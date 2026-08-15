export function qs(selector, root = document){ return root.querySelector(selector); }
export function qsa(selector, root = document){ return [...root.querySelectorAll(selector)]; }

export function setAlert(el, message = "", type = "info"){
  if (!el) return;
  el.textContent = message;
  el.className = `bp-alert is-show is-${type}`;
}
export function clearAlert(el){
  if (!el) return;
  el.textContent = "";
  el.className = "bp-alert";
}
export function escapeHtml(value = ""){
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}
export function statusBadge(status){
  const s = String(status || "pending").toLowerCase();
  const label = s === "approved" ? "APPROVED" : s === "rejected" ? "REJECTED" : "PENDING";
  return `<span class="bp-badge ${s}">${label}</span>`;
}
export function starsHtml(value){
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return `<span class="bp-star-view">${"★".repeat(n)}<span class="bp-star-empty">${"★".repeat(5-n)}</span></span>`;
}
export function formatDate(value){
  if(!value) return "-";
  try { return new Intl.DateTimeFormat("id-ID",{dateStyle:"medium"}).format(new Date(value)); }
  catch { return String(value); }
}
export function avg(values){
  const nums = values.map(Number).filter(n => Number.isFinite(n));
  return nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : 0;
}
