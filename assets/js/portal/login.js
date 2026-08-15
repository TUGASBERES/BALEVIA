import { portalDb } from "./supabase-client.js";
import { qs, setAlert, clearAlert } from "./ui.js";

const form = qs("#bp-login-form");
const alertBox = qs("#bp-login-alert");
const submitBtn = qs("#bp-login-submit");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAlert(alertBox);
  submitBtn.disabled = true;
  const fd = new FormData(form);

  const { data, error } = await portalDb.auth.signInWithPassword({
    email: String(fd.get("email") || "").trim(),
    password: String(fd.get("password") || "")
  });

  if(error){
    submitBtn.disabled = false;
    setAlert(alertBox, error.message, "error");
    return;
  }

  const { data: profile, error: profileError } = await portalDb
    .from("profiles").select("role").eq("id", data.user.id).single();

  submitBtn.disabled = false;
  if(profileError){
    setAlert(alertBox, "Login berhasil, tetapi profil belum dapat dibaca.", "error");
    return;
  }

  location.href = profile.role === "admin" ? "admin-dashboard.html" : "partner-dashboard.html";
});
