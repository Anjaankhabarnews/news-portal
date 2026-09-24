import { getSectionMeta } from "@/config/taxonomy";
import { demoArticles, demoMostReadOrder } from "@/lib/demo/articles";
import { defaultHomepage, demoBreaking, demoVideos } from "@/lib/demo/misc";
import type { Article, Paged, Video } from "@/lib/types";
import { byEditorial, byLatest } from "./ranking";
import type { ArticleQuery, ContentSource, SearchResult } from "./source";

function paginate<T>(items: T[], page = 1, pageSize = 20): Paged<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

function matchesSection(a: Article, section: string, strict?: boolean) {
  return a.section === section || (!strict && a.topics.includes(section));
}

function normalise(s: string) {
  return s.toLowerCase().normalize("NFKD");
}

function articleRelevance(a: Article, terms: string[]) {
  const title = normalise(a.title);
  const rest = normalise(
    [a.dek, a.tags.join(" "), a.location ?? "", getSectionMeta(a.section)?.name ?? "", a.locality ?? "", a.author.name].join(" "),
  );
  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 3;
    else if (rest.includes(t)) score += 1;
    else return 0; // every term must match somewhere
  }
  return score;
}

function videoRelevance(v: Video, terms: string[]) {
  const hay = normalise(`${v.title} ${v.summary} ${getSectionMeta(v.section)?.name ?? ""} ${v.locality ?? ""}`);
  return terms.every((t) => hay.includes(t)) ? terms.length : 0;
}

export const demoSource: ContentSource = {
  name: "demo",

  async listArticles(q: ArticleQuery) {
    let items = demoArticles.filter((a) => {
      if (q.section && !matchesSection(a, q.section, q.strictSection)) return false;
      if (q.locality && a.locality !== q.locality) return false;
      if (q.format && a.format !== q.format) return false;
      if (q.excludeIds?.includes(a.id)) return false;
      return true;
    });
    items = [...items].sort(q.sort === "editorial" ? byEditorial : byLatest);
    return paginate(items, q.page, q.pageSize);
  },

  async getArticle(section, slug, locality) {
    return (
      demoArticles.find((a) => a.slug === slug && a.section === section && (a.locality ?? undefined) === locality) ?? null
    );
  },

  async getMostRead(limit, section) {
    const bySlug = new Map(demoArticles.map((a) => [a.slug, a]));
    const ranked = demoMostReadOrder.map((s) => bySlug.get(s)).filter((a): a is Article => Boolean(a));
    const pool = section ? [...demoArticles].filter((a) => matchesSection(a, section)).sort(byEditorial) : ranked;
    return pool.slice(0, limit);
  },

  async getBreaking() {
    return demoBreaking;
  },

  async listVideos({ section, page, pageSize }) {
    const items = demoVideos.filter((v) => !section || v.section === section).sort(byLatest);
    return paginate(items, page, pageSize ?? 12);
  },

  async getVideo(slug) {
    return demoVideos.find((v) => v.slug === slug) ?? null;
  },

  async getHomepageModules() {
    return defaultHomepage;
  },

  async getAd() {
    // No direct campaigns in demo mode; AdSlot falls back to AdSense or a house ad.
    return null;
  },

  async search({ q, section, type = "all", page = 1, pageSize = 10 }) {
    const terms = normalise(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return paginate<SearchResult>([], page, pageSize);

    const scored: Array<{ score: number; date: string; result: SearchResult }> = [];
    if (type !== "videos") {
      for (const a of demoArticles) {
        if (section && !matchesSection(a, section)) continue;
        const score = articleRelevance(a, terms);
        if (score) scored.push({ score, date: a.publishedAt, result: { kind: "article", item: a } });
      }
    }
    if (type !== "articles") {
      for (const v of demoVideos) {
        if (section && v.section !== section) continue;
        const score = videoRelevance(v, terms);
        if (score) scored.push({ score, date: v.publishedAt, result: { kind: "video", item: v } });
      }
    }
    scored.sort((a, b) => b.score - a.score || byLatest({ publishedAt: a.date }, { publishedAt: b.date }));
    return paginate(
      scored.map((s) => s.result),
      page,
      pageSize,
    );
  },

  async listAllArticlePaths() {
    return demoArticles.map(({ section, locality, slug, publishedAt, updatedAt }) => ({
      section,
      locality,
      slug,
      publishedAt,
      updatedAt,
    }));
  },
};
