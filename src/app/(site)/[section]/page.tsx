import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionMeta, sections } from "@/config/taxonomy";
import { buildMetadata } from "@/lib/seo";
import { sectionPath } from "@/lib/urls";
import { SectionPage } from "@/components/news/section-page";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((s) => ({ section: s.slug }));
}

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSectionMeta(slug);
  if (!section) return {};
  const title =
    section.kind === "state"
      ? `${section.name} News — Latest ${section.name} Updates`
      : section.kind === "national"
        ? "India News — National Headlines"
        : `${section.name} News`;
  return buildMetadata({ title, description: section.description, path: sectionPath(slug) });
}

export default async function SectionRoute({ params }: Props) {
  const { section: slug } = await params;
  const section = getSectionMeta(slug);
  if (!section) notFound();
  return <SectionPage section={section} />;
}
