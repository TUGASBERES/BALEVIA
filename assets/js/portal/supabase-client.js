import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { portalConfig } from "./config.js";

export const portalConfigured =
  /^https:\/\/.+\.supabase\.co$/i.test(portalConfig.supabaseUrl) &&
  !portalConfig.supabasePublishableKey.startsWith("PASTE_");

export const portalDb = portalConfigured
  ? createClient(portalConfig.supabaseUrl, portalConfig.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export function requirePortalDb(){
  if(!portalDb) throw new Error("Supabase belum dikonfigurasi di assets/js/portal/config.js.");
  return portalDb;
}
