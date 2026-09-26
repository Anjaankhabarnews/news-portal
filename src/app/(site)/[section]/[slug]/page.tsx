import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocalityMeta, getSectionMeta, sections } from "@/config/taxonomy";
import { getArticle, listAllArticlePaths } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { articlePath, sectionPath } from "@/lib/urls";
import { ArticleView } from "@/components/article/article-view";
import { SectionPage } from "@/components/news/section-page";

/**
 * Second path segment is either a locality (/jharkhand/jamshedpur) or an
 * article in a section without locality (/bihar/<slug>, /business/<slug>).
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const localities = sections.flatMap((s) => (s.localities ?? []).map((l) => ({ section: s.slug, slug: l.slug })));
  const articles = (await listAllArticlePaths()).filter((a) => !a.locality).map((a) => ({ section: a.section, slug: a.slug }));
  return [...localities, ...articles];
}

type Props = { params: Promise<{ section: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: sectionSlug, slug } = await params;
  const section = getSectionMeta(sectionSlug);
  if (!section) return {};

  const locality = getLocalityMeta(sectionSlug, slug);
  if (locality) {
    return buildMetadata({
      title: `${locality.name} News — Latest from ${locality.name}, ${section.name}`,
      description: locality.description ?? `The latest news, updates and stories from ${locality.name}, ${section.name}.`,
      path: sectionPath(sectionSlug, slug),
    });
  }

  const article = await getArticle(sectionSlug, slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.dek,
    path: articlePath(article),
    image: article.image,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    section: section.name,
    tags: article.tags,
  });
}

export default async function SecondLevelRoute({ params }: Props) {
  const { section: sectionSlug, slug } = await params;
  const section = getSectionMeta(sectionSlug);
  if (!section) notFound();

  const locality = getLocalityMeta(sectionSlug, slug);
  if (locality) return <SectionPage section={section} locality={locality} />;

  const article = await getArticle(sectionSlug, slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
