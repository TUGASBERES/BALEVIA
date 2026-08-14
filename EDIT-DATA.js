
/* EDIT-DATA.js — edit dengan Notepad.
   Data ini dipakai oleh seluruh halaman. */

const BALEVA = {
  whatsappDisplay: "087781998529",
  whatsappLink: "6287781998529",
  email: "partner@baleva.id",

  team1Name: "NAMA PENANGGUNG JAWAB 01",
  team2Name: "NAMA PENANGGUNG JAWAB 02",
  team3Name: "NAMA PENANGGUNG JAWAB 03",
  team4Name: "NAMA PENANGGUNG JAWAB 04",

  office: "Nusa Tenggara Barat, Indonesia"
};

document.addEventListener("DOMContentLoaded", function(){
  const text = {
    "[data-wa-display]": BALEVA.whatsappDisplay,
    "[data-email]": BALEVA.email,
    "[data-team1]": BALEVA.team1Name,
    "[data-team2]": BALEVA.team2Name,
    "[data-team3]": BALEVA.team3Name,
    "[data-team4]": BALEVA.team4Name,
    "[data-office]": BALEVA.office
  };
  Object.entries(text).forEach(([sel,val])=>{
    document.querySelectorAll(sel).forEach(el=>el.textContent=val);
  });
  document.querySelectorAll("[data-wa-link]").forEach(el=>el.href="https://wa.me/"+BALEVA.whatsappLink);
  document.querySelectorAll("[data-mail-link]").forEach(el=>el.href="mailto:"+BALEVA.email);
});
