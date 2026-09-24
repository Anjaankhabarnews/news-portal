import "server-only";
import { getPublicClient } from "@/lib/supabase/server";
import type {
  AdPlacement,
  Advertisement,
  Article,
  ArticleBlock,
  Author,
  BreakingItem,
  Correction,
  HomepageModule,
  MediaImage,
  Paged,
  Video,
} from "@/lib/types";
import { defaultHomepage } from "@/lib/demo/misc";
import type { ArticleQuery, ContentSource, SearchResult } from "./source";

/* ---------------------------------------------------------------- row shapes */

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  dek: string;
  section_slug: string;
  locality_slug: string | null;
  topics: string[];
  tag_names: string[] | null;
  location: string | null;
  author: { slug: string; name: string; role: string; is_desk: boolean };
  format: Article["format"];
  priority: number;
  is_breaking: boolean;
  is_developing: boolean;
  hero_image: MediaImage;
  body: ArticleBlock[];
  key_takeaways: string[] | null;
  source: string | null;
  corrections: Correction[] | null;
  published_at: string;
  updated_at: string | null;
}

interface VideoRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  section_slug: string;
  locality_slug: string | null;
  duration_seconds: number;
  thumbnail: MediaImage;
  youtube_id: string | null;
  published_at: string;
}

const ARTICLE_LIST_COLUMNS =
  "id,slug,title,dek,section_slug,locality_slug,topics,tag_names,location,author,format,priority,is_breaking,is_developing,hero_image,published_at,updated_at";

function toAuthor(a: ArticleRow["author"]): Author {
  return { slug: a.slug, name: a.name, role: a.role, isDesk: a.is_desk };
}

function toArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    dek: r.dek,
    section: r.section_slug,
    locality: r.locality_slug ?? undefined,
    topics: r.topics ?? [],
    tags: r.tag_names ?? [],
    location: r.location ?? undefined,
    author: toAuthor(r.author),
    publishedAt: r.published_at,
    updatedAt: r.updated_at ?? undefined,
    image: r.hero_image,
    body: r.body ?? [],
    keyTakeaways: r.key_takeaways ?? undefined,
    format: r.format,
    priority: r.priority,
    isBreaking: r.is_breaking,
    isDeveloping: r.is_developing,
    source: r.source ?? undefined,
    corrections: r.corrections ?? undefined,
    isDemo: false,
  };
}

function toVideo(r: VideoRow): Video {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    section: r.section_slug,
    locality: r.locality_slug ?? undefined,
    durationSeconds: r.duration_seconds,
    publishedAt: r.published_at,
    thumbnail: r.thumbnail,
    youtubeId: r.youtube_id ?? undefined,
    isDemo: false,
  };
}

function range(page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1] as const;
}

function fail(context: string, error: { message: string }): never {
  throw new Error(`[supabase] ${context}: ${error.message}`);
}

/* ---------------------------------------------------------------- source */

export const supabaseSource: ContentSource = {
  name: "supabase",

  async listArticles(q: ArticleQuery): Promise<Paged<Article>> {
    const db = getPublicClient();
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    let query = db.from("published_articles").select(ARTICLE_LIST_COLUMNS, { count: "exact" });

    if (q.section) {
      query = q.strictSection
        ? query.eq("section_slug", q.section)
        : query.or(`section_slug.eq.${q.section},topics.cs.{${q.section}}`);
    }
    if (q.locality) query = query.eq("locality_slug", q.locality);
    if (q.format) query = query.eq("format", q.format);
    if (q.excludeIds?.length) query = query.not("id", "in", `(${q.excludeIds.join(",")})`);

    // Editorial ordering: priority first within the recent window, then recency.
    query =
      q.sort === "editorial"
        ? query.gte("published_at", new Date(Date.now() - 72 * 3_600_000).toISOString()).order("priority", { ascending: false })
        : query;
    query = query.order("published_at", { ascending: false }).range(...range(page, pageSize));

    const { data, error, count } = await query;
    if (error) fail("listArticles", error);
    return { items: (data as unknown as ArticleRow[]).map(toArticle), total: count ?? 0, page, pageSize };
  },

  async getArticle(section, slug, locality) {
    const db = getPublicClient();
    let query = db.from("published_articles").select("*").eq("section_slug", section).eq("slug", slug);
    query = locality ? query.eq("locality_slug", locality) : query.is("locality_slug", null);
    const { data, error } = await query.maybeSingle();
    if (error) fail("getArticle", error);
    return data ? toArticle(data as ArticleRow) : null;
  },

  async getMostRead(limit, section) {
    const db = getPublicClient();
    let query = db.from("most_read").select(ARTICLE_LIST_COLUMNS).limit(limit);
    if (section) query = query.or(`section_slug.eq.${section},topics.cs.{${section}}`);
    const { data, error } = await query;
    if (error) fail("getMostRead", error);
    return (data as unknown as ArticleRow[]).map(toArticle);
  },

  async getBreaking(): Promise<BreakingItem[]> {
    const db = getPublicClient();
    const { data, error } = await db
      .from("breaking_news")
      .select("id,headline,href,kind,published_at")
      .order("published_at", { ascending: false })
      .limit(5);
    if (error) fail("getBreaking", error);
    return (data ?? []).map((r) => ({
      id: r.id,
      headline: r.headline,
      href: r.href,
      kind: r.kind,
      publishedAt: r.published_at,
    }));
  },

  async listVideos({ section, page = 1, pageSize = 12 }) {
    const db = getPublicClient();
    let query = db.from("videos").select("*", { count: "exact" });
    if (section) query = query.eq("section_slug", section);
    const { data, error, count } = await query
      .order("published_at", { ascending: false })
      .range(...range(page, pageSize));
    if (error) fail("listVideos", error);
    return { items: (data as VideoRow[]).map(toVideo), total: count ?? 0, page, pageSize };
  },

  async getVideo(slug) {
    const { data, error } = await getPublicClient().from("videos").select("*").eq("slug", slug).maybeSingle();
    if (error) fail("getVideo", error);
    return data ? toVideo(data as VideoRow) : null;
  },

  async getHomepageModules(): Promise<HomepageModule[]> {
    const { data, error } = await getPublicClient().from("homepage_sections").select("*").order("sort_order");
    if (error) fail("getHomepageModules", error);
    if (!data?.length) return defaultHomepage;
    return data.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title ?? undefined,
      sections: r.sections ?? undefined,
      placement: r.placement ?? undefined,
      tone: r.tone ?? undefined,
      layout: r.layout ?? undefined,
      dayparts: r.dayparts ?? undefined,
      order: r.sort_order,
      daypartOrder: r.daypart_order ?? undefined,
    }));
  },

  async getAd(placement: AdPlacement): Promise<Advertisement | null> {
    const { data, error } = await getPublicClient().from("advertisements").select("*").eq("placement", placement);
    if (error) fail("getAd", error);
    if (!data?.length) return null;
    // Weighted random rotation between live campaigns for this placement.
    const total = data.reduce((s, r) => s + (r.weight ?? 1), 0);
    let pick = Math.random() * total;
    const row = data.find((r) => (pick -= r.weight ?? 1) < 0) ?? data[0];
    return {
      id: row.id,
      placement: row.placement,
      advertiser: row.advertiser,
      campaign: row.campaign ?? undefined,
      kind: row.kind,
      image: row.image,
      mobileImage: row.mobile_image ?? undefined,
      href: row.href,
      startsAt: row.starts_at ?? undefined,
      endsAt: row.ends_at ?? undefined,
      active: row.active,
    };
  },

  async search({ q, section, type = "all", page = 1, pageSize = 10 }): Promise<Paged<SearchResult>> {
    const db = getPublicClient();
    const results: SearchResult[] = [];
    let total = 0;

    if (type !== "videos") {
      let query = db
        .from("published_articles")
        .select(ARTICLE_LIST_COLUMNS, { count: "exact" })
        .textSearch("fts", q, { type: "websearch", config: "simple" });
      if (section) query = query.or(`section_slug.eq.${section},topics.cs.{${section}}`);
      const { data, error, count } = await query
        .order("published_at", { ascending: false })
        .range(...range(page, pageSize));
      if (error) fail("search articles", error);
      results.push(...(data as unknown as ArticleRow[]).map((r) => ({ kind: "article" as const, item: toArticle(r) })));
      total += count ?? 0;
    }
    if (type === "videos" || (type === "all" && page === 1)) {
      const safe = q.replace(/[%_,()]/g, " ").trim();
      let query = db.from("videos").select("*", { count: "exact" }).ilike("title", `%${safe}%`);
      if (section) query = query.eq("section_slug", section);
      const { data, error, count } = await query.limit(type === "videos" ? pageSize : 4);
      if (error) fail("search videos", error);
      results.push(...(data as VideoRow[]).map((r) => ({ kind: "video" as const, item: toVideo(r) })));
      total += count ?? 0;
    }
    return { items: results, total, page, pageSize };
  },

  async listAllArticlePaths() {
    const { data, error } = await getPublicClient()
      .from("published_articles")
      .select("section_slug,locality_slug,slug,published_at,updated_at")
      .order("published_at", { ascending: false })
      .limit(5000);
    if (error) fail("listAllArticlePaths", error);
    return (data ?? []).map((r) => ({
      section: r.section_slug,
      locality: r.locality_slug ?? undefined,
      slug: r.slug,
      publishedAt: r.published_at,
      updatedAt: r.updated_at ?? undefined,
    }));
  },
};
