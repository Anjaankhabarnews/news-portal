import { site } from "@/config/site";
import { contentSourceName, listArticles } from "@/lib/data";
import { absoluteUrl, articlePath } from "@/lib/urls";

export const revalidate = 300;

function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

/**
 * Google News sitemap: articles from the last 48 hours.
 * Demo content is never advertised to search engines.
 */
export async function GET() {
  const cutoff = Date.now() - 48 * 3_600_000;
  const recent =
    contentSourceName === "demo"
      ? []
      : (await listArticles({ sort: "latest", pageSize: 1000 })).items.filter((a) => new Date(a.publishedAt).getTime() > cutoff);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent
  .map(
    (a) => `  <url>
    <loc>${xmlEscape(absoluteUrl(articlePath(a)))}</loc>
    <news:news>
      <news:publication><news:name>${xmlEscape(site.name)}</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title>${xmlEscape(a.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
