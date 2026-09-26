import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocalityMeta, getSectionMeta } from "@/config/taxonomy";
import { getArticle, listAllArticlePaths } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { articlePath } from "@/lib/urls";
import { ArticleView } from "@/components/article/article-view";

/** Locality articles: /jharkhand/jamshedpur/<slug> */
export const revalidate = 600;

export async function generateStaticParams() {
  return (await listAllArticlePaths())
    .filter((a) => a.locality)
    .map((a) => ({ section: a.section, slug: a.locality!, article: a.slug }));
}

type Props = { params: Promise<{ section: string; slug: string; article: string }> };

async function load(params: Props["params"]) {
  const { section, slug: locality, article } = await params;
  if (!getSectionMeta(section) || !getLocalityMeta(section, locality)) return null;
  return getArticle(section, article, locality);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await load(params);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.dek,
    path: articlePath(article),
    image: article.image,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    section: getSectionMeta(article.section)?.name,
    tags: article.tags,
  });
}

export default async function LocalityArticleRoute({ params }: Props) {
  const article = await load(params);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
