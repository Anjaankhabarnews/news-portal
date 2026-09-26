import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export type StaffRole = "admin" | "editor" | "reporter" | "ad_manager";

/**
 * Verifies a newsroom request: the Bearer token must be a valid Supabase login
 * AND the user must have a newsroom_members row. Checked on the server — never
 * trust the browser for authorisation.
 */
export async function verifyStaff(req: Request): Promise<{ userId: string; role: StaffRole } | null> {
  if (!isSupabaseConfigured) return null;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const asUser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error } = await asUser.auth.getUser(token);
  if (error || !userData.user) return null;

  const { data: member } = await asUser.from("newsroom_members").select("role").eq("user_id", userData.user.id).maybeSingle();
  if (!member) return null;
  return { userId: userData.user.id, role: member.role as StaffRole };
}
