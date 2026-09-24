import type { Metadata } from "next";
import { site } from "@/config/site";
import type { MediaImage } from "@/lib/types";

export const DEFAULT_OG = "/og-default.png";

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: MediaImage;
  type?: "website" | "article" | "video.other";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}

/** Consistent title / description / canonical / Open Graph / Twitter metadata for every page. */
export function buildMetadata(m: MetaInput): Metadata {
  const images = m.image
    ? [{ url: m.image.src, width: m.image.width, height: m.image.height, alt: m.image.alt }]
    : [{ url: DEFAULT_OG, width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.path },
    robots: m.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: m.type === "article" ? "article" : "website",
      siteName: site.name,
      locale: site.locale,
      url: m.path,
      title: m.title,
      description: m.description,
      images,
      ...(m.type === "article"
        ? { publishedTime: m.publishedTime, modifiedTime: m.modifiedTime, section: m.section, tags: m.tags }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: images.map((i) => i.url),
    },
  };
}
