import { requirePortalDb } from "./supabase-client.js";
import { requireApprovedPartner,logout } from "./auth.js";
import { qs,escapeHtml,safeHttpUrl,whatsappUrl,imageOrLogo } from "./ui.js";
qs("#bp-logout")?.addEventListener("click",logout);
const id=new URLSearchParams(location.search).get("id");
async function init(){
  await requireApprovedPartner();if(!id)throw new Error("ID partner tidak ditemukan.");const db=requirePortalDb();
  const {data:p,error:pErr}=await db.from("properties").select("*").eq("id",id).eq("registration_status","approved").single();
  if(pErr)throw pErr;
  const {data:priv,error:prErr}=await db.from("partner_private_details").select("*").eq("property_id",id).single();
  if(prErr)throw prErr;
  qs("#bp-property-name").textContent=p.property_name;qs("#bp-property-meta").textContent=`${p.property_type} · ${p.region}`;
  qs("#bp-property-photo").src=imageOrLogo(p.photo_url);
  qs("#bp-public-info").innerHTML=`<p>${escapeHtml(p.description||"")}</p><p><strong>Area / Alamat</strong><br>${escapeHtml(p.address||"-")}</p><div class="bp-facilities">${(p.facilities||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join("")||"<span>Fasilitas belum diisi</span>"}</div>${safeHttpUrl(p.website_url)?`<div class="bp-property-actions" style="margin-top:14px"><a class="bp-btn bp-btn-soft" target="_blank" rel="noopener noreferrer" href="${escapeHtml(safeHttpUrl(p.website_url))}">Website Properti</a></div>`:""}`;
  const wa=whatsappUrl(priv.phone);
  qs("#bp-private-info").innerHTML=`<h2>Informasi Kerja Sama</h2>
    <p><strong>PIC</strong><br>${escapeHtml(priv.pic_name||"-")}</p>
    <p><strong>Email</strong><br>${escapeHtml(priv.email||"-")}</p>
    <p><strong>Jumlah Kamar</strong><br>${Number(priv.room_count||0)}</p>
    <p><strong>Tipe Kamar</strong><br>${escapeHtml(priv.room_types||"-")}</p>
    <p><strong>Catatan Kerja Sama</strong><br>${escapeHtml(priv.cooperation_notes||"-")}</p>
    <div class="bp-property-actions">${wa?`<a class="bp-btn bp-btn-primary" target="_blank" rel="noopener noreferrer" href="${escapeHtml(wa)}">Hubungi WhatsApp</a>`:""}${priv.email?`<a class="bp-btn bp-btn-soft" href="mailto:${escapeHtml(priv.email)}">Kirim Email</a>`:""}</div>`;
}
init().catch(err=>{console.error(err);const el=qs("#bp-page-error");el.textContent=err.message;el.className="bp-alert is-show is-error";});
