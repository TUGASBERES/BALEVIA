import { requirePortalDb } from "./supabase-client.js";
import { qs,setAlert,clearAlert } from "./ui.js";
const form=qs("#bp-login-form"),alertBox=qs("#bp-login-alert"),submit=qs("#bp-login-submit");
form?.addEventListener("submit",async e=>{
  e.preventDefault();clearAlert(alertBox);submit.disabled=true;
  const db=requirePortalDb(),fd=new FormData(form);
  const {data,error}=await db.auth.signInWithPassword({
    email:String(fd.get("email")||"").trim(),
    password:String(fd.get("password")||"")
  });
  if(error){submit.disabled=false;setAlert(alertBox,error.message,"error");return;}
  const {data:profile,error:pErr}=await db.from("profiles").select("role").eq("id",data.user.id).single();
  submit.disabled=false;
  if(pErr){setAlert(alertBox,"Login berhasil tetapi profil belum dapat dibaca.","error");return;}
  location.href=profile.role==="admin"?"admin-dashboard.html":"partner-dashboard.html";
});
