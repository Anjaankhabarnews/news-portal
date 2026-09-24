/**
 * Core content model. Mirrors the Supabase schema in /supabase/schema.sql so the
 * demo data source and the database adapter return identical shapes.
 */

export type SectionKind = "state" | "national" | "topic";

export interface Locality {
  slug: string;
  name: string;
  /** City pages (Jamshedpur) vs. district pages (Dhanbad). */
  type: "city" | "district";
  /** Administrative district, when the locality is a city. */
  district?: string;
  /** Shown as dedicated blocks on the state page and in navigation. */
  featured?: boolean;
  description?: string;
}

export interface Section {
  slug: string;
  name: string;
  /** Short label for tight spaces (nav chips). */
  shortName?: string;
  kind: SectionKind;
  description: string;
  localities?: Locality[];
  /** Lower = earlier in navigation. */
  order: number;
  /** Primary regional identity of the publication. */
  isHome?: boolean;
}

export interface MediaImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  credit?: string;
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "image"; image: MediaImage }
  | { type: "note"; text: string };

export type ArticleFormat = "news" | "analysis" | "explainer" | "brief";

export interface Author {
  slug: string;
  name: string;
  /** Desk/role label. Individual reporters are added by the newsroom, never invented. */
  role: string;
  isDesk: boolean;
}

export interface Correction {
  date: string;
  text: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  /** Standfirst / summary. */
  dek: string;
  section: string;
  locality?: string;
  topics: string[];
  tags: string[];
  location?: string;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  image: MediaImage;
  body: ArticleBlock[];
  keyTakeaways?: string[];
  format: ArticleFormat;
  /** Editorial weight 0–100 set by editors; drives homepage prominence. */
  priority: number;
  isBreaking?: boolean;
  isDeveloping?: boolean;
  source?: string;
  corrections?: Correction[];
  /** Placeholder content used during development. Rendered with a visible label. */
  isDemo: boolean;
}

export interface Video {
  id: string;
  slug: string;
  title: string;
  summary: string;
  section: string;
  locality?: string;
  durationSeconds: number;
  publishedAt: string;
  thumbnail: MediaImage;
  /** YouTube video id or other provider embed id. Empty in demo mode. */
  youtubeId?: string;
  isDemo: boolean;
}

export interface BreakingItem {
  id: string;
  headline: string;
  href: string;
  publishedAt: string;
  kind: "breaking" | "developing";
}

export type Daypart = "morning" | "midday" | "evening" | "night";

export type HomepageModuleType =
  | "hero"
  | "brief"
  | "home-state"
  | "section-grid"
  | "states-rail"
  | "video"
  | "section-with-rail"
  | "topic-columns"
  | "tip-cta"
  | "ad";

export interface HomepageModule {
  id: string;
  type: HomepageModuleType;
  title?: string;
  /** Section slugs this module draws from. */
  sections?: string[];
  /** Ad placement for `ad` modules. */
  placement?: AdPlacement;
  /** Background band for visual rhythm. */
  tone?: "plain" | "paper" | "navy";
  /** Layout variant for generic section modules, so adjacent sections don't look identical. */
  layout?: "lead-list" | "four-up";
  /** If set, module only shows during these dayparts. */
  dayparts?: Daypart[];
  /** Per-daypart order override (lower first). Falls back to `order`. */
  order: number;
  daypartOrder?: Partial<Record<Daypart, number>>;
}

export type AdPlacement =
  | "leaderboard"
  | "billboard"
  | "sidebar"
  | "sidebar-tall"
  | "in-article"
  | "section-break"
  | "footer";

export interface Advertisement {
  id: string;
  placement: AdPlacement;
  advertiser: string;
  campaign?: string;
  /** direct = sold banner, government = public-sector notice, local = local business. */
  kind: "direct" | "government" | "local";
  image: MediaImage;
  mobileImage?: MediaImage;
  href: string;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
