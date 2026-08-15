import { portalDb } from "./supabase-client.js";
import { requireAdmin, logout } from "./auth.js";
import { qs, setAlert, clearAlert, escapeHtml, starsHtml, formatDate } from "./ui.js";

qs("#bp-logout")?.addEventListener("click", logout);
const alertBox = qs("#bp-assessment-alert");
const params = new URLSearchParams(location.search);
const propertyId = params.get("property");

function grade(total){
  if(total >= 90) return "EXCELLENT";
  if(total >= 80) return "VERY GOOD";
  if(total >= 70) return "GOOD";
  if(total >= 60) return "IMPROVEMENT REQUIRED";
  return "REVIEW REQUIRED";
}
function updatePreview(){
  const ids = ["operational_score","communication_score","rate_score","inventory_score","guest_experience_score"];
  const vals = ids.map(id=>Number(qs(`#${id}`).value)||0);
  const total = vals.reduce((a,b)=>a+b,0)/5;
  qs("#bp-total-preview").textContent = total.toFixed(1);
  qs("#bp-grade-preview").textContent = grade(total);
}
document.querySelectorAll(".bp-score-input").forEach(i=>i.addEventListener("input",updatePreview));

async function load(){
  await requireAdmin();
  if(!propertyId) throw new Error("Property ID tidak ditemukan.");

  const { data: property, error:pErr } = await portalDb.from("properties")
    .select("id, property_name, property_type, region, registration_status")
    .eq("id",propertyId).single();
  if(pErr) throw pErr;
  qs("#bp-property-name").textContent = property.property_name;
  qs("#bp-property-meta").textContent = `${property.property_type} · ${property.region} · ${property.registration_status.toUpperCase()}`;

  const { data: reviews, error:rErr } = await portalDb.from("partner_reviews")
    .select("rating, comment, created_at, reviewer:profiles!partner_reviews_reviewer_user_id_fkey(full_name)")
    .eq("property_id",propertyId).eq("is_visible",true).order("created_at",{ascending:false});
  if(rErr) throw rErr;
  qs("#bp-review-list").innerHTML = (reviews||[]).map(r=>`
    <div class="bp-comment">
      <strong>${escapeHtml(r.reviewer?.full_name || "Mitra BALEVA")} · ${starsHtml(r.rating)}</strong>
      <p>${escapeHtml(r.comment || "")}</p>
      <time>${formatDate(r.created_at)}</time>
    </div>`).join("") || `<div class="bp-empty">Belum ada rating/komentar mitra.</div>`;
}

qs("#bp-assessment-form")?.addEventListener("submit", async (event)=>{
  event.preventDefault();
  clearAlert(alertBox);
  const form = new FormData(event.currentTarget);
  const vals = [
    Number(form.get("operational_score")), Number(form.get("communication_score")),
    Number(form.get("rate_score")), Number(form.get("inventory_score")),
    Number(form.get("guest_experience_score"))
  ];
  if(vals.some(v=>!Number.isFinite(v) || v<0 || v>100)){
    setAlert(alertBox,"Semua nilai harus antara 0 sampai 100.","error"); return;
  }
  const total = vals.reduce((a,b)=>a+b,0)/5;
  const { data:{user} } = await portalDb.auth.getUser();

  const { error } = await portalDb.from("assessments").insert({
    property_id: propertyId,
    operational_score: vals[0],
    communication_score: vals[1],
    rate_score: vals[2],
    inventory_score: vals[3],
    guest_experience_score: vals[4],
    total_score: total,
    grade: grade(total),
    notes: String(form.get("notes") || "").trim(),
    assessed_by: user.id,
    assessment_date: new Date().toISOString().slice(0,10)
  });
  if(error){ setAlert(alertBox,error.message,"error"); return; }
  setAlert(alertBox,"Penilaian resmi BALEVA berhasil disimpan.","success");
  event.currentTarget.reset();
  updatePreview();
});

load().catch(err=>setAlert(alertBox,err.message,"error"));
