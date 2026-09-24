import { site } from "@/config/site";
import type { Article, Video } from "@/lib/types";

/**
 * Canonical, SEO-friendly article URLs:
 *   /jharkhand/jamshedpur/<slug>   (locality stories)
 *   /bihar/<slug>                  (state stories)
 *   /business/<slug>               (topic stories)
 */
export function articlePath(a: Pick<Article, "section" | "locality" | "slug">) {
  return a.locality ? `/${a.section}/${a.locality}/${a.slug}` : `/${a.section}/${a.slug}`;
}

export function videoPath(v: Pick<Video, "slug">) {
  return `/video/${v.slug}`;
}

export function sectionPath(section: string, locality?: string) {
  return locality ? `/${section}/${locality}` : `/${section}`;
}

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
