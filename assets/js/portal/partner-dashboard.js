import { requirePortalDb } from "./supabase-client.js";
import { getMyProfile,getMyProperty,logout } from "./auth.js";
import { qs,escapeHtml,statusBadge } from "./ui.js";
qs("#bp-logout")?.addEventListener("click",logout);
async function init(){
  const db=requirePortalDb(),me=await getMyProfile(),property=await getMyProperty();
  qs("#bp-user-name").textContent=me.profile.full_name||me.user.email;
  if(!property){qs("#bp-property-summary").innerHTML=`<div class="bp-empty">Data properti belum ditemukan.</div>`;return;}
  const {data:privateData}=await db.from("partner_private_details").select("admin_registration_note").eq("property_id",property.id).maybeSingle();
  qs("#bp-property-summary").innerHTML=`
    <h2>${escapeHtml(property.property_name)}</h2>
    <div class="bp-meta"><span>${escapeHtml(property.property_type)}</span><span>${escapeHtml(property.region)}</span>${statusBadge(property.registration_status)}</div>
    <p>${escapeHtml(property.description||"")}</p>
    <div class="bp-note"><strong>Komentar Admin</strong><br>${escapeHtml(privateData?.admin_registration_note||"Belum ada komentar.")}</div>`;
  const approved=property.registration_status==="approved";
  document.querySelectorAll("[data-approved-only]").forEach(el=>el.classList.toggle("bp-hidden",!approved));
  if(!approved){
    qs("#bp-access-note").innerHTML=`<div class="bp-note">Direktori hotel mitra dan Form Penilaian Aplikasi akan aktif setelah registrasi Anda berstatus <strong>APPROVED</strong>.</div>`;
  }
}
init().catch(err=>{console.error(err);const el=qs("#bp-page-error");el.textContent=err.message;el.className="bp-alert is-show is-error";});
