import { portalDb } from "./supabase-client.js";
import { getMyProfile, logout } from "./auth.js";
import { qs, escapeHtml, starsHtml, formatDate, setAlert, clearAlert } from "./ui.js";

qs("#bp-logout")?.addEventListener("click", logout);

let me = null;
let ownProperty = null;

async function getOwnProperty(){
  const { data, error } = await portalDb.from("properties")
    .select("id, registration_status").eq("owner_id", me.user.id).single();
  if(error) throw error;
  return data;
}

async function renderProperties(){
  const list = qs("#bp-properties");
  const { data: properties, error } = await portalDb
    .from("properties")
    .select("id, property_name, property_type, region")
    .eq("registration_status","approved")
    .order("property_name");
  if(error) throw error;

  const others = (properties || []).filter(p => p.id !== ownProperty.id);
  if(!others.length){
    list.innerHTML = `<div class="bp-empty">Belum ada penginapan approved lain yang dapat Anda nilai.</div>`;
    return;
  }

  list.innerHTML = "";
  for(const property of others){
    const { data: reviews, error:rErr } = await portalDb
      .from("partner_reviews")
      .select("id, rating, comment, created_at, reviewer:profiles!partner_reviews_reviewer_user_id_fkey(full_name)")
      .eq("property_id", property.id)
      .eq("is_visible", true)
      .order("created_at",{ascending:false});
    if(rErr) throw rErr;

    const ratings = (reviews||[]).map(r=>Number(r.rating));
    const average = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;

    const card = document.createElement("article");
    card.className = "bp-property";
    card.innerHTML = `
      <span class="bp-kicker">MITRA BALEVA</span>
      <h2>${escapeHtml(property.property_name)}</h2>
      <div class="bp-meta"><span>${escapeHtml(property.property_type)}</span><span>${escapeHtml(property.region)}</span></div>
      <div class="bp-rating-line">
        ${ratings.length ? `${starsHtml(average)} <strong>${average.toFixed(1)}</strong> <span class="bp-help">(${ratings.length})</span>` : `<span class="bp-help">Belum ada rating</span>`}
      </div>
      <div class="bp-divider"></div>
      <form class="bp-form bp-review-form" data-property-id="${property.id}">
        <div class="bp-field">
          <label>Rating Anda</label>
          <div class="bp-stars" aria-label="Pilih 1 sampai 5 bintang">
            <input type="radio" id="star5-${property.id}" name="rating" value="5" required><label for="star5-${property.id}">★</label>
            <input type="radio" id="star4-${property.id}" name="rating" value="4"><label for="star4-${property.id}">★</label>
            <input type="radio" id="star3-${property.id}" name="rating" value="3"><label for="star3-${property.id}">★</label>
            <input type="radio" id="star2-${property.id}" name="rating" value="2"><label for="star2-${property.id}">★</label>
            <input type="radio" id="star1-${property.id}" name="rating" value="1"><label for="star1-${property.id}">★</label>
          </div>
        </div>
        <div class="bp-field"><label>Komentar</label><textarea name="comment" maxlength="1000" placeholder="Tuliskan pengalaman kerja sama atau masukan yang relevan..." required></textarea></div>
        <button class="bp-btn bp-btn-primary" type="submit">Simpan Rating & Komentar</button>
        <div class="bp-alert"></div>
      </form>
      <div class="bp-comments">
        ${(reviews||[]).slice(0,8).map(r=>`
          <div class="bp-comment">
            <strong>${escapeHtml(r.reviewer?.full_name || "Mitra BALEVA")} · ${starsHtml(r.rating)}</strong>
            <p>${escapeHtml(r.comment || "")}</p>
            <time>${formatDate(r.created_at)}</time>
          </div>`).join("") || `<div class="bp-help">Belum ada komentar.</div>`}
      </div>
    `;
    list.appendChild(card);
  }

  document.querySelectorAll(".bp-review-form").forEach(form => {
    form.addEventListener("submit", submitReview);
  });
}

async function submitReview(event){
  event.preventDefault();
  const form = event.currentTarget;
  const alertBox = form.querySelector(".bp-alert");
  clearAlert(alertBox);
  const fd = new FormData(form);
  const propertyId = form.dataset.propertyId;
  const rating = Number(fd.get("rating"));
  const comment = String(fd.get("comment") || "").trim();

  const { error } = await portalDb.from("partner_reviews").upsert({
    property_id: propertyId,
    reviewer_user_id: me.user.id,
    rating,
    comment,
    is_visible: true
  }, { onConflict:"property_id,reviewer_user_id" });

  if(error){
    setAlert(alertBox, error.message, "error");
    return;
  }
  setAlert(alertBox, "Rating dan komentar tersimpan. Jika Anda menilai lagi, penilaian lama akan diperbarui.", "success");
  await renderProperties();
}

async function init(){
  me = await getMyProfile();
  qs("#bp-user-name").textContent = me.profile.full_name || me.user.email;
  ownProperty = await getOwnProperty();

  if(ownProperty.registration_status !== "approved"){
    qs("#bp-properties").innerHTML = `<div class="bp-note">Hanya mitra dengan penginapan berstatus APPROVED yang dapat memberi rating dan komentar.</div>`;
    return;
  }
  await renderProperties();
}
init().catch(err => {
  console.error(err);
  const el = qs("#bp-page-error");
  if(el){ el.textContent = err.message; el.className = "bp-alert is-show is-error"; }
});
