import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { portalConfig } from "./config.js";

const missing =
  portalConfig.supabaseUrl.startsWith("PASTE_") ||
  portalConfig.supabasePublishableKey.startsWith("PASTE_");

if (missing) {
  console.warn("[BALEVA Portal] Supabase belum dikonfigurasi di assets/js/portal/config.js");
}

export const portalDb = createClient(
  portalConfig.supabaseUrl,
  portalConfig.supabasePublishableKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
