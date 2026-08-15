import { requirePortalDb } from "./supabase-client.js";
import { requireApprovedPartner,logout } from "./auth.js";
import { qs,setAlert,clearAlert } from "./ui.js";
qs("#bp-logout")?.addEventListener("click",logout);
let me;
const form=qs("#bp-feedback-form"),alertBox=qs("#bp-feedback-alert");

async function loadExisting(){
  const db=requirePortalDb();
  const {data,error}=await db.from("system_feedback").select("*").eq("user_id",me.user.id).maybeSingle();
  if(error)throw error;if(!data)return;
  const names=["security_rating","speed_rating","stability_rating","ease_rating","information_rating","features_rating","support_rating","usefulness_rating","overall_rating"];
  for(const name of names){
    const radio=form.querySelector(`input[name="${name}"][value="${data[name]}"]`);if(radio)radio.checked=true;
  }
  form.elements.comments.value=data.comments||"";
  form.elements.suggestions.value=data.suggestions||"";
  form.elements.problem_experience.value=data.problem_experience||"none";
}

form?.addEventListener("submit",async e=>{
  e.preventDefault();clearAlert(alertBox);const db=requirePortalDb(),fd=new FormData(form);
  const payload={user_id:me.user.id,property_id:me.property.id,
    security_rating:Number(fd.get("security_rating")),speed_rating:Number(fd.get("speed_rating")),
    stability_rating:Number(fd.get("stability_rating")),ease_rating:Number(fd.get("ease_rating")),
    information_rating:Number(fd.get("information_rating")),features_rating:Number(fd.get("features_rating")),
    support_rating:Number(fd.get("support_rating")),usefulness_rating:Number(fd.get("usefulness_rating")),
    overall_rating:Number(fd.get("overall_rating")),problem_experience:String(fd.get("problem_experience")||"none"),
    comments:String(fd.get("comments")||"").trim(),suggestions:String(fd.get("suggestions")||"").trim()
  };
  if(Object.entries(payload).filter(([k])=>k.endsWith("_rating")).some(([,v])=>!Number.isInteger(v)||v<1||v>5)){
    setAlert(alertBox,"Mohon isi semua penilaian bintang 1–5.","error");return;
  }
  const {error}=await db.from("system_feedback").upsert(payload,{onConflict:"user_id"});
  if(error){setAlert(alertBox,error.message,"error");return;}
  setAlert(alertBox,"Terima kasih. Penilaian aplikasi BALEVA sudah disimpan. Anda dapat memperbaruinya kapan saja.","success");
});
async function init(){me=await requireApprovedPartner();await loadExisting();}
init().catch(err=>{console.error(err);setAlert(alertBox,err.message,"error");});
