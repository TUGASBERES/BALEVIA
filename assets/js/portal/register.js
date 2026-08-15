import { requirePortalDb } from "./supabase-client.js";
import { qs,setAlert,clearAlert } from "./ui.js";
const form=qs("#bp-register-form"),alertBox=qs("#bp-register-alert"),submit=qs("#bp-register-submit");
form?.addEventListener("submit",async e=>{
  e.preventDefault();clearAlert(alertBox);
  const db=requirePortalDb(),fd=new FormData(form);
  if(String(fd.get("password")||"")!==String(fd.get("confirm_password")||"")){
    setAlert(alertBox,"Konfirmasi password tidak sama.","error");return;
  }
  const facilities=[...form.querySelectorAll('input[name="facilities"]:checked')].map(x=>x.value);
  submit.disabled=true;
  const {data,error}=await db.auth.signUp({
    email:String(fd.get("email")||"").trim(),
    password:String(fd.get("password")||""),
    options:{data:{
      full_name:String(fd.get("full_name")||"").trim(),
      phone:String(fd.get("phone")||"").trim(),
      property_name:String(fd.get("property_name")||"").trim(),
      property_type:String(fd.get("property_type")||"").trim(),
      region:String(fd.get("region")||"").trim(),
      address:String(fd.get("address")||"").trim(),
      description:String(fd.get("description")||"").trim(),
      facilities,
      website_url:String(fd.get("website_url")||"").trim(),
      photo_url:String(fd.get("photo_url")||"").trim(),
      room_count:Number(fd.get("room_count")||0),
      room_types:String(fd.get("room_types")||"").trim(),
      cooperation_notes:String(fd.get("cooperation_notes")||"").trim()
    }}
  });
  submit.disabled=false;
  if(error){setAlert(alertBox,error.message,"error");return;}
  form.reset();
  setAlert(alertBox,data.session
    ?"Registrasi berhasil. Status penginapan PENDING sampai diverifikasi admin."
    :"Registrasi berhasil. Silakan cek email untuk konfirmasi akun. Status penginapan PENDING.",
    "success");
});
