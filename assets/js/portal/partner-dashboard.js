import { portalDb } from "./supabase-client.js";
import { getMyProfile, logout } from "./auth.js";
import { qs, escapeHtml, statusBadge, starsHtml, formatDate } from "./ui.js";

const logoutBtn = qs("#bp-logout");
logoutBtn?.addEventListener("click", logout);

async function init(){
  const me = await getMyProfile();
  qs("#bp-user-name").textContent = me.profile.full_name || me.user.email;

  const { data: property, error:pErr } = await portalDb
    .from("properties")
    .select("*")
    .eq("owner_id", me.user.id)
    .single();

  if(pErr) throw pErr;

  qs("#bp-property-summary").innerHTML = `
    <h2>${escapeHtml(property.property_name)}</h2>
    <div class="bp-meta">
      <span>${escapeHtml(property.property_type)}</span>
      <span>${escapeHtml(property.region)}</span>
      ${statusBadge(property.registration_status)}
    </div>
    <p>${escapeHtml(property.address || "-")}</p>
    <div class="bp-note"><strong>Catatan Admin Registrasi:</strong><br>${escapeHtml(property.admin_registration_note || "Belum ada catatan.")}</div>
  `;

  const { data: assessments, error:aErr } = await portalDb
    .from("assessments")
    .select("*")
    .eq("property_id", property.id)
    .order("assessment_date",{ascending:false})
    .limit(1);

  if(aErr) throw aErr;
  const a = assessments?.[0];
  qs("#bp-official-score").innerHTML = a ? `
    <div class="bp-score-grid">
      <div class="bp-score-box"><small>Operational</small><strong>${a.operational_score}</strong></div>
      <div class="bp-score-box"><small>Communication</small><strong>${a.communication_score}</strong></div>
      <div class="bp-score-box"><small>Rate</small><strong>${a.rate_score}</strong></div>
      <div class="bp-score-box"><small>Inventory</small><strong>${a.inventory_score}</strong></div>
      <div class="bp-score-box"><small>Guest Experience</small><strong>${a.guest_experience_score}</strong></div>
    </div>
    <div class="bp-divider"></div>
    <p><strong>Total:</strong> ${Number(a.total_score).toFixed(1)} / 100 &nbsp; <strong>Grade:</strong> ${escapeHtml(a.grade)}</p>
    <div class="bp-note"><strong>Catatan Penilaian:</strong><br>${escapeHtml(a.notes || "-")}</div>
  ` : `<div class="bp-empty">Belum ada penilaian resmi BALEVA.</div>`;

  const { data: reviewStats, error:rErr } = await portalDb
    .from("partner_reviews")
    .select("rating")
    .eq("property_id", property.id)
    .eq("is_visible", true);

  if(rErr) throw rErr;
  const ratings = (reviewStats || []).map(r=>Number(r.rating));
  const avg = ratings.length ? ratings.reduce((x,y)=>x+y,0)/ratings.length : 0;
  qs("#bp-partner-rating").innerHTML = ratings.length
    ? `<div class="bp-rating-line">${starsHtml(avg)} <strong>${avg.toFixed(1)}</strong> <span class="bp-help">(${ratings.length} penilaian mitra)</span></div>`
    : `<div class="bp-empty">Belum ada rating dari mitra.</div>`;
}

init().catch(err => {
  console.error(err);
  const target = qs("#bp-page-error");
  if(target){ target.textContent = err.message; target.className = "bp-alert is-show is-error"; }
});
