export function qs(selector,root=document){return root.querySelector(selector);}
export function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
export function setAlert(el,msg="",type="info"){if(!el)return;el.textContent=msg;el.className=`bp-alert is-show is-${type}`;}
export function clearAlert(el){if(!el)return;el.textContent="";el.className="bp-alert";}
export function statusBadge(s){
  const x=String(s||"pending").toLowerCase(),label=x==="approved"?"APPROVED":x==="rejected"?"REJECTED":"PENDING";
  return `<span class="bp-badge ${x}">${label}</span>`;
}
export function safeHttpUrl(v=""){try{const u=new URL(String(v).trim());return["http:","https:"].includes(u.protocol)?u.href:"";}catch{return"";}}
export function imageOrLogo(v=""){return safeHttpUrl(v)||"assets/images/baleva-logo-portal.png";}
export function whatsappUrl(phone=""){
  const d=String(phone||"").replace(/\D/g,""); if(!d)return"";
  return `https://wa.me/${d.startsWith("0")?"62"+d.slice(1):d}`;
}
export function starsHtml(value){
  const n=Math.max(0,Math.min(5,Math.round(Number(value)||0)));
  return `<span class="bp-star-view">${"★".repeat(n)}<span class="bp-star-empty">${"★".repeat(5-n)}</span></span>`;
}
export function formatDate(v){if(!v)return"-";try{return new Intl.DateTimeFormat("id-ID",{dateStyle:"medium"}).format(new Date(v));}catch{return String(v);}}
