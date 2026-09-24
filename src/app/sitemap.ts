import type { MetadataRoute } from "next";
import { sections } from "@/config/taxonomy";
import { listAllArticlePaths, listVideos } from "@/lib/data";
import { absoluteUrl, articlePath, videoPath } from "@/lib/urls";

export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, videos] = await Promise.all([listAllArticlePaths(), listVideos({ pageSize: 500 })]);
  const now = new Date();

  const staticPages = ["/", "/latest", "/video", "/about", "/contact", "/advertise", "/editorial-policy", "/corrections", "/news-tip", "/privacy", "/terms", "/cookies"].map(
    (p) => ({
      url: absoluteUrl(p),
      lastModified: now,
      changeFrequency: p === "/" || p === "/latest" ? ("always" as const) : ("monthly" as const),
      priority: p === "/" ? 1 : 0.4,
    }),
  );

  const sectionPages = sections.flatMap((s) => [
    { url: absoluteUrl(`/${s.slug}`), lastModified: now, changeFrequency: "hourly" as const, priority: s.isHome ? 0.9 : 0.8 },
    ...(s.localities ?? []).map((l) => ({
      url: absoluteUrl(`/${s.slug}/${l.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: l.featured ? 0.8 : 0.6,
    })),
  ]);

  const articlePages = articles.map((a) => ({
    url: absoluteUrl(articlePath(a)),
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const videoPages = videos.items.map((v) => ({
    url: absoluteUrl(videoPath(v)),
    lastModified: new Date(v.publishedAt),
    priority: 0.5,
  }));

  return [...staticPages, ...sectionPages, ...articlePages, ...videoPages];
}
