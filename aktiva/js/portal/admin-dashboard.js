import { requirePortalDb } from "./supabase-client.js";
import { requireAdmin,logout } from "./auth.js";
import { qs,escapeHtml,statusBadge,formatDate,setAlert,clearAlert } from "./ui.js";
qs("#bp-logout")?.addEventListener("click",logout);
const body=qs("#bp-partner-rows"),alertBox=qs("#bp-admin-alert");let notes=new Map();

async function load(){
  const db=requirePortalDb(),me=await requireAdmin();qs("#bp-admin-name").textContent=me.profile.full_name||me.user.email;
  const [{data:props,error:pErr},{data:profiles,error:prErr},{data:privs,error:pvErr}]=await Promise.all([
    db.from("properties").select("*").order("created_at",{ascending:false}),
    db.from("profiles").select("id,full_name"),
    db.from("partner_private_details").select("property_id,admin_registration_note")
  ]);
  if(pErr)throw pErr;if(prErr)throw prErr;if(pvErr)throw pvErr;
  const names=new Map((profiles||[]).map(x=>[x.id,x.full_name]));notes=new Map((privs||[]).map(x=>[x.property_id,x.admin_registration_note]));
  body.innerHTML=(props||[]).map(p=>`<tr>
    <td><strong>${escapeHtml(p.property_name)}</strong><br><span class="bp-help">${escapeHtml(names.get(p.owner_id)||"")}</span></td>
    <td>${escapeHtml(p.property_type)}</td><td>${escapeHtml(p.region)}</td><td>${statusBadge(p.registration_status)}</td>
    <td>${escapeHtml(notes.get(p.id)||"-")}</td><td>${formatDate(p.created_at)}</td>
    <td><button class="bp-btn bp-btn-soft bp-edit" data-id="${p.id}" data-status="${p.registration_status}">Status/Komentar</button></td>
  </tr>`).join("")||`<tr><td colspan="7">Belum ada registrasi.</td></tr>`;
  document.querySelectorAll(".bp-edit").forEach(b=>b.addEventListener("click",()=>{
    qs("#bp-edit-property-id").value=b.dataset.id;qs("#bp-edit-status").value=b.dataset.status;qs("#bp-edit-note").value=notes.get(b.dataset.id)||"";
    qs("#bp-registration-editor").classList.remove("bp-hidden");qs("#bp-registration-editor").scrollIntoView({behavior:"smooth"});
  }));
}
qs("#bp-registration-form")?.addEventListener("submit",async e=>{
  e.preventDefault();clearAlert(alertBox);const db=requirePortalDb(),id=qs("#bp-edit-property-id").value;
  const {error:a}=await db.from("properties").update({registration_status:qs("#bp-edit-status").value}).eq("id",id);
  if(a){setAlert(alertBox,a.message,"error");return;}
  const {error:b}=await db.from("partner_private_details").update({admin_registration_note:qs("#bp-edit-note").value.trim()}).eq("property_id",id);
  if(b){setAlert(alertBox,b.message,"error");return;}
  setAlert(alertBox,"Status dan komentar registrasi berhasil disimpan.","success");qs("#bp-registration-editor").classList.add("bp-hidden");await load();
});
load().catch(err=>setAlert(alertBox,err.message,"error"));
