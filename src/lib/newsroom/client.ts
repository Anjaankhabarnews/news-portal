"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

let client: SupabaseClient | null = null;

/**
 * Newsroom browser client. Unlike the public one, it keeps the staff login
 * session. Every read and write is still enforced by Row Level Security on the
 * database — the UI hiding a button is never the security boundary.
 */
export function newsroomClient(): SupabaseClient {
  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "ak-newsroom-auth" },
  });
  return client;
}

export type Role = "admin" | "editor" | "reporter" | "ad_manager";

export const roleLabel: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  reporter: "Reporter",
  ad_manager: "Ad manager",
};

export const canPublish = (role?: Role | null) => role === "admin" || role === "editor";

/** Tell the public site to refresh cached pages now (otherwise it refreshes within ~60s). */
export async function refreshPublicSite() {
  try {
    const { data } = await newsroomClient().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/newsroom/revalidate", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  } catch {
    // Non-fatal: the site still refreshes on its own within about a minute.
  }
}
