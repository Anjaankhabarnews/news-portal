import type { MetadataRoute } from "next";
import { contentSourceName } from "@/lib/data";
import { absoluteUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  // While running on demo content, keep the preview out of search indexes.
  if (contentSourceName === "demo") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/search", "/newsroom"] }],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
  };
}
