import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdPlacement } from "@/lib/types";
import { demoSource } from "./demo-source";
import type { ArticleQuery, ContentSource, SearchQuery } from "./source";
import { supabaseSource } from "./supabase-source";

/** Demo content until Supabase credentials are provided. */
const source: ContentSource = isSupabaseConfigured ? supabaseSource : demoSource;

export const contentSourceName = source.name;

export const listArticles = (q: ArticleQuery) => source.listArticles(q);
export const search = (q: SearchQuery) => source.search(q);
export const listVideos = (q: Parameters<ContentSource["listVideos"]>[0]) => source.listVideos(q);

// Deduplicated per request (React cache) — safe to call from several components.
export const getArticle = cache((section: string, slug: string, locality?: string) =>
  source.getArticle(section, slug, locality),
);
export const getMostRead = cache((limit: number, section?: string) => source.getMostRead(limit, section));
export const getBreaking = cache(() => source.getBreaking());
export const getVideo = cache((slug: string) => source.getVideo(slug));
export const getHomepageModules = cache(() => source.getHomepageModules());
export const getAd = cache((placement: AdPlacement) => source.getAd(placement));
export const listAllArticlePaths = cache(() => source.listAllArticlePaths());

export type { ArticleQuery, SearchQuery, SearchResult } from "./source";
