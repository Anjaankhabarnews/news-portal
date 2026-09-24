import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

/** Browser client (anon key, RLS-bound). Lazy-imported only by features that need it. */
export function getBrowserClient() {
  client ??= createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  return client;
}
