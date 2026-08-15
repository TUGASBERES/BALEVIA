import { requirePortalDb } from "./supabase-client.js";

export async function getSessionUser(){
  const db=requirePortalDb();
  const {data,error}=await db.auth.getSession();
  if(error)throw error;
  return data.session?.user??null;
}
export async function requireUser(){
  const user=await getSessionUser();
  if(!user){location.href="login.html";throw new Error("AUTH_REQUIRED");}
  return user;
}
export async function getMyProfile(){
  const db=requirePortalDb(),user=await requireUser();
  const {data,error}=await db.from("profiles").select("id,full_name,role").eq("id",user.id).single();
  if(error)throw error;
  return {user,profile:data};
}
export async function getMyProperty(){
  const db=requirePortalDb(),user=await requireUser();
  const {data,error}=await db.from("properties").select("*").eq("owner_id",user.id).maybeSingle();
  if(error)throw error;
  return data;
}
export async function requireApprovedPartner(){
  const me=await getMyProfile();
  if(me.profile.role==="admin")return {...me,property:null};
  const property=await getMyProperty();
  if(!property||property.registration_status!=="approved"){
    location.href="partner-dashboard.html";
    throw new Error("APPROVED_REQUIRED");
  }
  return {...me,property};
}
export async function requireAdmin(){
  const me=await getMyProfile();
  if(me.profile.role!=="admin"){location.href="partner-dashboard.html";throw new Error("ADMIN_REQUIRED");}
  return me;
}
export async function logout(){
  const db=requirePortalDb();
  await db.auth.signOut();
  location.href="login.html";
}
