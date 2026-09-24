import type { Metadata } from "next";
import { listArticles } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { pageParam, type SearchParams } from "@/lib/params";
import { buildMetadata } from "@/lib/seo";
import type { Article } from "@/lib/types";
import { AdSlot } from "@/components/ads/ad-slot";
import { HorizontalStory, StoryList } from "@/components/news/story-cards";
import { Breadcrumbs, Pagination } from "@/components/ui/primitives";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Latest News — Every Story as It's Published",
  description: "The newest stories from Anjaan Khabar, in the order they were published.",
  path: "/latest",
});

const PAGE_SIZE = 20;

/** Groups a chronological list by IST calendar day. */
function groupByDay(items: Article[]) {
  const groups: Array<{ day: string; items: Article[] }> = [];
  for (const a of items) {
    const day = formatDate(a.publishedAt);
    const last = groups.at(-1);
    if (last?.day === day) last.items.push(a);
    else groups.push({ day, items: [a] });
  }
  return groups;
}

export default async function LatestPage({ searchParams }: { searchParams: SearchParams }) {
  const page = pageParam((await searchParams).page);
  const { items, total } = await listArticles({ sort: "latest", page, pageSize: PAGE_SIZE });

  return (
    <div className="container-page pt-5 pb-4 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Latest" }]} />
      <div className="mt-5 flex items-center gap-3">
        <span className="animate-live-dot size-2.5 rounded-full bg-red" aria-hidden />
        <h1 className="t-h1">Latest News</h1>
      </div>
      <p className="t-dek mt-2">Every story, newest first.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          {groupByDay(items).map((g) => (
            <section key={g.day} aria-label={g.day} className="mb-8">
              <h2 className="t-kicker sticky top-[var(--header-mobile-h)] z-10 border-b-2 border-ink bg-white py-2 text-ink lg:top-12">{g.day}</h2>
              <StoryList className="pt-4">
                {g.items.map((a) => (
                  <HorizontalStory key={a.id} article={a} size="md" showDek imageSide="left" />
                ))}
              </StoryList>
            </section>
          ))}
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} hrefFor={(p) => (p === 1 ? "/latest" : `/latest?page=${p}`)} />
        </div>
        <aside className="lg:col-span-4" aria-label="Advertisement">
          <div className="lg:sticky lg:top-20">
            <AdSlot placement="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
