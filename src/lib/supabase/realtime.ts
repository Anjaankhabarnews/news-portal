import type { BreakingItem } from "@/lib/types";
import { getBrowserClient } from "./browser";

/**
 * Browser-side Realtime subscription for the breaking bar. Loaded lazily by
 * BreakingNewsBar only when Supabase is configured. Uses the anon key (RLS applies).
 */
export function subscribeToBreaking(onChange: (items: BreakingItem[]) => void) {
  const db = getBrowserClient();

  const load = async () => {
    const { data } = await db
      .from("breaking_news")
      .select("id,headline,href,kind,published_at")
      .order("published_at", { ascending: false })
      .limit(5);
    if (data) {
      onChange(data.map((r) => ({ id: r.id, headline: r.headline, href: r.href, kind: r.kind, publishedAt: r.published_at })));
    }
  };

  // Unique channel per subscription: React (dev) mounts effects twice, and a
  // shared name would hand back an already-subscribed channel.
  const channel = db
    .channel(`breaking-news-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "breaking_news" }, () => void load())
    .subscribe();

  return () => {
    void db.removeChannel(channel);
  };
}
