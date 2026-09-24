import type { Article } from "@/lib/types";

/**
 * Editorial score = editor-assigned priority, gently decayed by age.
 * A priority-98 story stays on top for most of a day; a routine story
 * drops as newer work arrives. The decay caps at 72h so evergreen
 * explainers remain rankable in their sections.
 */
const DECAY_PER_HOUR = 0.6;
const DECAY_CAP_HOURS = 72;

export function editorialScore(a: Article, now = Date.now()) {
  const ageHours = Math.max(0, (now - new Date(a.publishedAt).getTime()) / 3_600_000);
  return a.priority - Math.min(ageHours, DECAY_CAP_HOURS) * DECAY_PER_HOUR;
}

export function byEditorial(a: Article, b: Article) {
  const now = Date.now();
  return editorialScore(b, now) - editorialScore(a, now);
}

export function byLatest(a: { publishedAt: string }, b: { publishedAt: string }) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/**
 * Trending score for when real view data exists:
 * views in the window, weighted towards the most recent hours.
 * (Used by the Supabase `most_read` view; mirrored here for reference.)
 */
export function trendingScore(viewsLast6h: number, viewsLast48h: number) {
  return viewsLast6h * 3 + viewsLast48h;
}
