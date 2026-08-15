import { requirePortalDb } from "./supabase-client.js";
import { requireAdmin,logout } from "./auth.js";
import { qs,escapeHtml,starsHtml,formatDate } from "./ui.js";
qs("#bp-logout")?.addEventListener("click",logout);

const metrics=[
  ["security_rating","Keamanan"],["speed_rating","Kecepatan"],["stability_rating","Kestabilan"],
  ["ease_rating","Kemudahan"],["information_rating","Informasi"],["features_rating","Fitur"],
  ["support_rating","Support"],["usefulness_rating","Kegunaan"],["overall_rating","Overall"]
];
function average(rows,key){return rows.length?rows.reduce((s,r)=>s+Number(r[key]||0),0)/rows.length:0;}

async function init(){
  await requireAdmin();const db=requirePortalDb();
  const {data,error}=await db.from("system_feedback").select("*,property:properties(property_name),profile:profiles(full_name)").order("updated_at",{ascending:false});
  if(error)throw error;const rows=data||[];
  qs("#bp-feedback-count").textContent=rows.length;
  qs("#bp-metric-grid").innerHTML=metrics.map(([key,label])=>{const avg=average(rows,key);return `<div class="bp-stat"><small>${label}</small><strong>${avg.toFixed(1)}</strong><div>${starsHtml(avg)}</div></div>`;}).join("");
  qs("#bp-feedback-list").innerHTML=rows.length?rows.map(r=>`<article class="bp-feedback-item">
    <h3>${escapeHtml(r.property?.property_name||"Mitra BALEVA")}</h3>
    <div>${starsHtml(r.overall_rating)} <strong>${r.overall_rating}/5</strong></div>
    <p><strong>Masalah yang dialami:</strong> ${escapeHtml(r.problem_experience||"none")}</p>
    <p><strong>Komentar:</strong> ${escapeHtml(r.comments||"-")}</p>
    <p><strong>Saran:</strong> ${escapeHtml(r.suggestions||"-")}</p>
    <time>Diperbarui ${formatDate(r.updated_at)}</time>
  </article>`).join(""):`<div class="bp-empty">Belum ada penilaian aplikasi dari mitra.</div>`;
}
init().catch(err=>{console.error(err);qs("#bp-feedback-list").innerHTML=`<div class="bp-note">${escapeHtml(err.message)}</div>`;});
