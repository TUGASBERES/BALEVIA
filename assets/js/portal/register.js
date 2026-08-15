import { portalDb } from "./supabase-client.js";
import { qs, setAlert, clearAlert } from "./ui.js";

const form = qs("#bp-register-form");
const alertBox = qs("#bp-register-alert");
const submitBtn = qs("#bp-register-submit");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAlert(alertBox);

  const fd = new FormData(form);
  const password = String(fd.get("password") || "");
  const confirmPassword = String(fd.get("confirm_password") || "");
  if(password !== confirmPassword){
    setAlert(alertBox, "Konfirmasi password tidak sama.", "error");
    return;
  }
  submitBtn.disabled = true;

  const meta = {
    full_name: String(fd.get("full_name") || "").trim(),
    property_name: String(fd.get("property_name") || "").trim(),
    property_type: String(fd.get("property_type") || "").trim(),
    region: String(fd.get("region") || "").trim(),
    address: String(fd.get("address") || "").trim(),
    phone: String(fd.get("phone") || "").trim()
  };

  const { data, error } = await portalDb.auth.signUp({
    email: String(fd.get("email") || "").trim(),
    password,
    options: { data: meta }
  });

  submitBtn.disabled = false;
  if(error){
    setAlert(alertBox, error.message, "error");
    return;
  }

  form.reset();
  if(data.session){
    setAlert(alertBox, "Registrasi berhasil. Data penginapan masuk sebagai PENDING dan menunggu persetujuan admin BALEVA.", "success");
  }else{
    setAlert(alertBox, "Registrasi berhasil. Silakan cek email untuk konfirmasi akun. Data penginapan otomatis masuk sebagai PENDING.", "success");
  }
});
