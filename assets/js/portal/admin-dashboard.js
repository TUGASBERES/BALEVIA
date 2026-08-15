import { portalDb } from "./supabase-client.js";
import { requireAdmin, logout } from "./auth.js";
import { qs, escapeHtml, statusBadge, formatDate, setAlert, clearAlert } from "./ui.js";

qs("#bp-logout")?.addEventListener("click", logout);
const tableBody = qs("#bp-partner-rows");
const adminAlert = qs("#bp-admin-alert");

async function loadPartners(){
  const { data, error } = await portalDb
    .from("properties")
    .select("id, owner_id, property_name, property_type, region, registration_status, admin_registration_note, created_at, owner:profiles!properties_owner_id_fkey(full_name)")
    .order("created_at",{ascending:false});
  if(error) throw error;

  tableBody.innerHTML = (data||[]).map(p => `
    <tr>
      <td><strong>${escapeHtml(p.property_name)}</strong><br><span class="bp-help">${escapeHtml(p.owner?.full_name || "")}</span></td>
      <td>${escapeHtml(p.property_type)}</td>
      <td>${escapeHtml(p.region)}</td>
      <td>${statusBadge(p.registration_status)}</td>
      <td>${escapeHtml(p.admin_registration_note || "-")}</td>
      <td>${formatDate(p.created_at)}</td>
      <td>
        <button class="bp-btn bp-btn-soft bp-edit-property" data-id="${p.id}" data-status="${p.registration_status}" data-note="${escapeHtml(p.admin_registration_note || "")}">Status/Komen</button>
        <a class="bp-btn bp-btn-dark" href="admin-penilaian.html?property=${p.id}">Penilaian</a>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7">Belum ada registrasi.</td></tr>`;

  document.querySelectorAll(".bp-edit-property").forEach(btn => {
    btn.addEventListener("click", () => openEditor(btn));
  });
}

function openEditor(btn){
  qs("#bp-edit-property-id").value = btn.dataset.id;
  qs("#bp-edit-status").value = btn.dataset.status;
  qs("#bp-edit-note").value = btn.dataset.note || "";
  qs("#bp-registration-editor").classList.remove("bp-hidden");
  qs("#bp-registration-editor").scrollIntoView({behavior:"smooth",block:"center"});
}

qs("#bp-registration-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAlert(adminAlert);
  const id = qs("#bp-edit-property-id").value;
  const registration_status = qs("#bp-edit-status").value;
  const admin_registration_note = qs("#bp-edit-note").value.trim();

  const { error } = await portalDb.from("properties")
    .update({registration_status, admin_registration_note})
    .eq("id", id);

  if(error){ setAlert(adminAlert,error.message,"error"); return; }
  setAlert(adminAlert,"Status dan komentar registrasi berhasil disimpan.","success");
  qs("#bp-registration-editor").classList.add("bp-hidden");
  await loadPartners();
});

async function init(){
  const me = await requireAdmin();
  qs("#bp-admin-name").textContent = me.profile.full_name || me.user.email;
  await loadPartners();
}
init().catch(err => {
  console.error(err);
  setAlert(adminAlert, err.message, "error");
});
