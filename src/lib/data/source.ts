import type { AdPlacement, Advertisement, Article, BreakingItem, HomepageModule, Paged, Video } from "@/lib/types";

export interface ArticleQuery {
  /** Matches the article's home section OR its secondary topics. */
  section?: string;
  locality?: string;
  /** Only articles whose home section is exactly `section` (e.g. state pages). */
  strictSection?: boolean;
  excludeIds?: string[];
  format?: Article["format"];
  sort?: "latest" | "editorial";
  page?: number;
  pageSize?: number;
}

export interface SearchQuery {
  q: string;
  section?: string;
  type?: "all" | "articles" | "videos";
  page?: number;
  pageSize?: number;
}

export type SearchResult =
  | { kind: "article"; item: Article }
  | { kind: "video"; item: Video };

/**
 * Every content backend implements this contract. Pages never talk to a
 * database directly, so swapping demo data for Supabase changes nothing in the UI.
 */
export interface ContentSource {
  readonly name: "demo" | "supabase";
  listArticles(q: ArticleQuery): Promise<Paged<Article>>;
  getArticle(section: string, slug: string, locality?: string): Promise<Article | null>;
  getMostRead(limit: number, section?: string): Promise<Article[]>;
  getBreaking(): Promise<BreakingItem[]>;
  listVideos(q: { section?: string; page?: number; pageSize?: number }): Promise<Paged<Video>>;
  getVideo(slug: string): Promise<Video | null>;
  getHomepageModules(): Promise<HomepageModule[]>;
  getAd(placement: AdPlacement): Promise<Advertisement | null>;
  search(q: SearchQuery): Promise<Paged<SearchResult>>;
  /** Lightweight index for sitemap / static params. */
  listAllArticlePaths(): Promise<Array<Pick<Article, "section" | "locality" | "slug" | "publishedAt" | "updatedAt">>>;
}
