/**
 * DEMO CONTENT — videos, breaking items and the default homepage layout.
 */
import type { BreakingItem, HomepageModule, Video } from "@/lib/types";
import { articlePath } from "@/lib/urls";
import { demoArticles, demoImage } from "./articles";

const NOW = Math.floor(Date.now() / 300_000) * 300_000;
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

function v(
  slug: string,
  title: string,
  summary: string,
  section: string,
  image: string,
  durationSeconds: number,
  mins: number,
  locality?: string,
): Video {
  return {
    id: `demo-video-${slug}`,
    slug,
    title,
    summary,
    section,
    locality,
    durationSeconds,
    publishedAt: minutesAgo(mins),
    thumbnail: { ...demoImage(image, `Video thumbnail: ${title}`), caption: undefined },
    isDemo: true,
  };
}

export const demoVideos: Video[] = [
  v("jamshedpur-week-in-90-seconds", "Jamshedpur in 90 seconds: the week's key local stories", "A quick round-up of the stories that mattered in the Steel City this week.", "jharkhand", "video-jamshedpur", 94, 60, "jamshedpur"),
  v("how-ranchi-traffic-plan-works", "How a city traffic plan is made — explained with Ranchi's junctions", "What traffic studies measure, and how recommendations become signals and crossings.", "jharkhand", "video-ranchi", 212, 240, "ranchi"),
  v("monsoon-preparedness-what-districts-review", "Monsoon preparedness: what districts review every year", "Drains, embankments, shelters and control rooms — the checklist explained.", "jharkhand", "video-monsoon", 185, 420),
  v("grassroots-cricket-in-jharkhand", "Grassroots cricket: inside a district league weekend", "Early starts, matting pitches and a lot of enthusiasm.", "sports", "video-cricket", 248, 700),
  v("inside-a-weekly-haat", "Inside a weekly haat: how a village market works", "From dawn set-up to closing time, the rhythm of a rural market.", "business", "video-market", 176, 1100),
  v("reading-your-electricity-bill", "Explained: how to read your electricity bill", "Fixed charges, units and slabs — what each line means.", "business", "video-explainer", 158, 1500),
  v("folk-music-traditions", "Folk music traditions of the region", "Musicians talk about the songs they grew up with.", "entertainment", "video-culture", 301, 2200),
  v("rail-travel-eastern-india-what-to-know", "Rail travel in eastern India: what to check before you go", "Timetables, halts and enquiry channels in under three minutes.", "india", "video-rail", 164, 2800),
];

const bySlug = new Map(demoArticles.map((a) => [a.slug, a]));
function link(slug: string) {
  const a = bySlug.get(slug);
  return a ? articlePath(a) : "/";
}

export const demoBreaking: BreakingItem[] = [
  {
    id: "demo-b1",
    kind: "breaking",
    headline: "Jamshedpur draws up festival-season traffic plan for Bistupur and Sakchi markets",
    href: link("festival-traffic-plan-for-bistupur-and-sakchi-markets"),
    publishedAt: minutesAgo(22),
  },
  {
    id: "demo-b2",
    kind: "developing",
    headline: "Jharkhand monsoon review: districts asked to map flood-prone villages",
    href: link("districts-asked-to-map-flood-prone-villages-before-next-monsoon"),
    publishedAt: minutesAgo(38),
  },
  {
    id: "demo-b3",
    kind: "developing",
    headline: "Ranchi traffic study recommends signal upgrades at five busy junctions",
    href: link("traffic-study-recommends-signal-upgrades-at-busy-junctions"),
    publishedAt: minutesAgo(70),
  },
];

/**
 * Default homepage layout. Editors will manage this in `homepage_sections`.
 * `daypartOrder` lets the page re-prioritise modules through the day
 * without code changes.
 */
export const defaultHomepage: HomepageModule[] = [
  { id: "hero", type: "hero", order: 10 },
  { id: "brief", type: "brief", order: 20, tone: "navy", daypartOrder: { evening: 55, night: 20 } },
  { id: "ad-top", type: "ad", placement: "leaderboard", order: 25 },
  { id: "home-state", type: "home-state", title: "Jharkhand", sections: ["jharkhand"], tone: "paper", order: 30 },
  { id: "india", type: "section-with-rail", title: "India", sections: ["india"], order: 40 },
  { id: "video", type: "video", title: "Watch", tone: "navy", order: 50, daypartOrder: { evening: 35, night: 70 } },
  { id: "states", type: "states-rail", title: "Across the Region", sections: ["bihar", "odisha", "west-bengal", "uttar-pradesh"], order: 60 },
  { id: "ad-mid", type: "ad", placement: "billboard", order: 65 },
  {
    id: "business",
    type: "section-grid",
    title: "Business",
    sections: ["business"],
    tone: "paper",
    layout: "lead-list",
    order: 70,
    daypartOrder: { midday: 45 },
  },
  {
    id: "sports",
    type: "section-grid",
    title: "Sports",
    sections: ["sports"],
    layout: "four-up",
    order: 80,
    daypartOrder: { evening: 45 },
  },
  {
    id: "topics",
    type: "topic-columns",
    title: "More News",
    sections: ["politics", "education", "health", "entertainment"],
    order: 90,
  },
  { id: "tip", type: "tip-cta", order: 100 },
];
