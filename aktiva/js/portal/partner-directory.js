import { requirePortalDb } from "./supabase-client.js";
import { requireApprovedPartner,logout } from "./auth.js";
import { qs,escapeHtml,imageOrLogo } from "./ui.js";
qs("#bp-logout")?.addEventListener("click",logout);
let all=[];
function render(){
  const q=String(qs("#bp-search").value||"").toLowerCase(),region=qs("#bp-region").value,type=qs("#bp-type").value;
  const rows=all.filter(p=>(!q||`${p.property_name} ${p.region} ${p.property_type}`.toLowerCase().includes(q))&&(!region||p.region===region)&&(!type||p.property_type===type));
  qs("#bp-directory").innerHTML=rows.length?rows.map(p=>`
    <article class="bp-property-card">
      <div class="bp-property-image"><img src="${escapeHtml(imageOrLogo(p.photo_url))}" alt="${escapeHtml(p.property_name)}"></div>
      <div class="bp-property-body">
        <span class="bp-kicker">APPROVED BALEVA PARTNER</span>
        <h2>${escapeHtml(p.property_name)}</h2>
        <div class="bp-meta"><span>${escapeHtml(p.property_type)}</span><span>${escapeHtml(p.region)}</span></div>
        <p>${escapeHtml(p.description||"")}</p>
        <div class="bp-property-actions"><a class="bp-btn bp-btn-dark" href="partner-detail.html?id=${encodeURIComponent(p.id)}">Lihat Informasi Mitra</a></div>
      </div>
    </article>`).join(""):`<div class="bp-empty">Tidak ada partner yang cocok dengan pencarian.</div>`;
}
async function init(){
  await requireApprovedPartner();const db=requirePortalDb();
  const {data,error}=await db.from("properties").select("id,property_name,property_type,region,description,facilities,website_url,photo_url").eq("registration_status","approved").order("property_name");
  if(error)throw error;all=data||[];
  const regions=[...new Set(all.map(x=>x.region).filter(Boolean))].sort(),types=[...new Set(all.map(x=>x.property_type).filter(Boolean))].sort();
  qs("#bp-region").innerHTML=`<option value="">Semua daerah</option>`+regions.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
  qs("#bp-type").innerHTML=`<option value="">Semua jenis</option>`+types.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
  qs("#bp-search").addEventListener("input",render);qs("#bp-region").addEventListener("change",render);qs("#bp-type").addEventListener("change",render);render();
}
init().catch(err=>{console.error(err);qs("#bp-directory").innerHTML=`<div class="bp-note">${escapeHtml(err.message)}</div>`;});
