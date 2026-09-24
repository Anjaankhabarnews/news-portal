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

  const channel = db
    .channel("breaking-news")
    .on("postgres_changes", { event: "*", schema: "public", table: "breaking_news" }, () => void load())
    .subscribe();

  return () => {
    void db.removeChannel(channel);
  };
}
