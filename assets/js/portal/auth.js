import { portalDb } from "./supabase-client.js";

export async function getSessionUser(){
  const { data, error } = await portalDb.auth.getSession();
  if(error) throw error;
  return data.session?.user ?? null;
}

export async function requireUser(){
  const user = await getSessionUser();
  if(!user){
    location.href = "login.html";
    throw new Error("AUTH_REQUIRED");
  }
  return user;
}

export async function getMyProfile(){
  const user = await requireUser();
  const { data, error } = await portalDb
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();
  if(error) throw error;
  return { user, profile:data };
}

export async function requireAdmin(){
  const me = await getMyProfile();
  if(me.profile.role !== "admin"){
    location.href = "partner-dashboard.html";
    throw new Error("ADMIN_REQUIRED");
  }
  return me;
}

export async function logout(){
  await portalDb.auth.signOut();
  location.href = "login.html";
}
