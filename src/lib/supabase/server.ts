import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

let publicClient: SupabaseClient | null = null;

/** Cache tag on every content read — `revalidateTag(CONTENT_TAG, …)` refreshes the whole site. */
export const CONTENT_TAG = "content";
/** Max age (seconds) of cached database reads in Next's Data Cache. */
const CONTENT_MAX_AGE = 60;

/**
 * Read-only client for public content. Subject to RLS like any visitor.
 * Reads get an explicit freshness window + tag, so cached responses never
 * outlive a publish (or a redeploy) by more than a minute, and editors can
 * force an instant refresh via /api/revalidate.
 */
export function getPublicClient(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  publicClient ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Writes (view logging) must never be cached.
          ...(init?.method && init.method !== "GET" && init.method !== "HEAD"
            ? { cache: "no-store" as const }
            : { next: { revalidate: CONTENT_MAX_AGE, tags: [CONTENT_TAG] } }),
        }),
    },
  });
  return publicClient;
}

/**
 * Privileged client for trusted server work only (validated tip submissions,
 * signed uploads). Never import this from a Client Component.
 */
export function getServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
