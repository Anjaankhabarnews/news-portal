import { site } from "@/config/site";
import { getBrandLogos } from "@/lib/brand";
import type { Article, Video } from "@/lib/types";
import { absoluteUrl, articlePath, videoPath } from "@/lib/urls";
import { isoDuration } from "@/lib/format";
import type { Crumb } from "@/components/ui/primitives";

/** Serialises structured data safely (prevents `</script>` breakout). */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function publisher() {
  const logo = getBrandLogos().primary;
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    slogan: site.tagline,
    ...(logo ? { logo: { "@type": "ImageObject", url: absoluteUrl(logo.src), width: logo.width, height: logo.height } } : {}),
    sameAs: site.social.map((s) => s.href),
    publishingPrinciples: absoluteUrl("/editorial-policy"),
    correctionsPolicy: absoluteUrl("/corrections"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "newsroom",
      telephone: `+${site.contact.whatsappDigits}`,
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };
}

export function organizationSchema() {
  return [
    { "@context": "https://schema.org", ...publisher() },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      inLanguage: site.language,
      publisher: { "@id": `${site.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function newsArticleSchema(a: Article) {
  const url = absoluteUrl(articlePath(a));
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: a.title,
    description: a.dek,
    image: [absoluteUrl(a.image.src)],
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    inLanguage: site.language,
    articleSection: a.section,
    keywords: a.tags.join(", "),
    ...(a.location ? { contentLocation: { "@type": "Place", name: a.location } } : {}),
    author: a.author.isDesk
      ? { "@type": "Organization", name: `${site.name} ${a.author.name}`, url: site.url }
      : { "@type": "Person", name: a.author.name },
    publisher: { "@id": `${site.url}/#organization` },
    isAccessibleForFree: true,
  };
}

export function videoSchema(v: Video) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.summary,
    thumbnailUrl: [absoluteUrl(v.thumbnail.src)],
    uploadDate: v.publishedAt,
    duration: isoDuration(v.durationSeconds),
    url: absoluteUrl(videoPath(v)),
    ...(v.youtubeId ? { embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}` } : {}),
    publisher: { "@id": `${site.url}/#organization` },
  };
}

export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
}
