import "server-only";
import { getSectionMeta, homeState } from "@/config/taxonomy";
import { getDaypart } from "@/lib/daypart";
import { getHomepageModules, getMostRead, listArticles, listVideos } from "@/lib/data";
import { byEditorial, byLatest } from "@/lib/data/ranking";
import type { Article, Daypart, HomepageModule, Locality, Section, Video } from "@/lib/types";

/**
 * Resolves the editor-defined homepage layout into renderable data.
 *
 * - Modules are filtered/re-ordered for the current daypart (IST).
 * - Stories are allocated in module order by editorial score, and a story
 *   shown in one module is not repeated in the next — so the page reads as a
 *   front page, not a feed.
 */

export type ResolvedModule =
  | { type: "hero"; m: HomepageModule; lead: Article; secondary: Article[]; more: Article[]; latest: Article[] }
  | { type: "brief"; m: HomepageModule; daypart: Daypart; items: Article[] }
  | {
      type: "home-state";
      m: HomepageModule;
      section: Section;
      lead?: Article;
      top: Article[];
      localities: Array<{ locality: Locality; items: Article[] }>;
      across: Article[];
    }
  | { type: "section-with-rail"; m: HomepageModule; section: Section; items: Article[]; mostRead: Article[] }
  | { type: "section-grid"; m: HomepageModule; section: Section; items: Article[] }
  | { type: "states-rail"; m: HomepageModule; columns: Array<{ section: Section; items: Article[] }> }
  | { type: "topic-columns"; m: HomepageModule; columns: Array<{ section: Section; items: Article[] }> }
  | { type: "video"; m: HomepageModule; videos: Video[] }
  | { type: "ad"; m: HomepageModule }
  | { type: "tip-cta"; m: HomepageModule };

function orderFor(m: HomepageModule, d: Daypart) {
  return m.daypartOrder?.[d] ?? m.order;
}

export async function loadHomepage(now = new Date()) {
  const daypart = getDaypart(now);
  const [modules, pool, videos, mostRead] = await Promise.all([
    getHomepageModules(),
    listArticles({ sort: "editorial", pageSize: 200 }).then((r) => r.items),
    listVideos({ pageSize: 8 }).then((r) => r.items),
    getMostRead(6),
  ]);

  const active = modules
    .filter((m) => !m.dayparts || m.dayparts.includes(daypart))
    .sort((a, b) => orderFor(a, daypart) - orderFor(b, daypart));

  const used = new Set<string>();
  const ranked = [...pool].sort(byEditorial);

  /** Take the next `n` highest-ranked unused stories matching `pred`. */
  const take = (n: number, pred: (a: Article) => boolean = () => true) => {
    const out: Article[] = [];
    for (const a of ranked) {
      if (out.length >= n) break;
      if (used.has(a.id) || !pred(a)) continue;
      used.add(a.id);
      out.push(a);
    }
    return out;
  };
  const inSection = (slug: string, strict = false) => (a: Article) =>
    a.section === slug || (!strict && a.topics.includes(slug));

  const resolved: ResolvedModule[] = [];

  for (const m of active) {
    switch (m.type) {
      case "hero": {
        const [lead, ...rest] = take(5);
        if (!lead) break;
        const latest = [...pool].sort(byLatest).filter((a) => a.id !== lead.id).slice(0, 7);
        resolved.push({ type: "hero", m, lead, secondary: rest.slice(0, 2), more: rest.slice(2), latest });
        break;
      }
      case "brief": {
        const items = take(5);
        if (items.length) resolved.push({ type: "brief", m, daypart, items });
        break;
      }
      case "home-state": {
        const section = homeState;
        const featured = (section.localities ?? []).filter((l) => l.featured);
        const [lead] = take(1, (a) => a.section === section.slug);
        const localities = featured.map((locality) => ({
          locality,
          items: take(4, (a) => a.section === section.slug && a.locality === locality.slug),
        }));
        const across = take(5, (a) => a.section === section.slug && !!a.locality && !featured.some((f) => f.slug === a.locality));
        // Remaining state-wide (or leftover city) stories fill the list beside the lead.
        const top = take(4, (a) => a.section === section.slug);
        resolved.push({ type: "home-state", m, section, lead, top, localities, across });
        break;
      }
      case "section-with-rail":
      case "section-grid": {
        const slug = m.sections?.[0];
        const section = slug ? getSectionMeta(slug) : undefined;
        if (!section) break;
        const items = take(5, inSection(section.slug));
        if (!items.length) break;
        if (m.type === "section-with-rail") resolved.push({ type: m.type, m, section, items, mostRead });
        else resolved.push({ type: m.type, m, section, items });
        break;
      }
      case "states-rail":
      case "topic-columns": {
        const columns = (m.sections ?? [])
          .map((slug) => getSectionMeta(slug))
          .filter((s): s is Section => Boolean(s))
          .map((section) => ({ section, items: take(3, inSection(section.slug, m.type === "states-rail")) }));
        resolved.push({ type: m.type, m, columns });
        break;
      }
      case "video":
        if (videos.length) resolved.push({ type: "video", m, videos });
        break;
      case "ad":
        resolved.push({ type: "ad", m });
        break;
      case "tip-cta":
        resolved.push({ type: "tip-cta", m });
        break;
    }
  }

  return { daypart, modules: resolved };
}
