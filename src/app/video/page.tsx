import type { Metadata } from "next";
import Link from "next/link";
import { getSectionMeta } from "@/config/taxonomy";
import { listVideos } from "@/lib/data";
import { firstParam, pageParam, type SearchParams } from "@/lib/params";
import { buildMetadata } from "@/lib/seo";
import { VideoCard } from "@/components/news/video-card";
import { Breadcrumbs, EmptyState, Pagination } from "@/components/ui/primitives";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Video — News, Explainers and Local Stories",
  description: "Watch Anjaan Khabar video reports and explainers from Jharkhand, eastern India and across the country.",
  path: "/video",
});

const filters = [
  { slug: "", label: "All" },
  { slug: "jharkhand", label: "Jharkhand" },
  { slug: "india", label: "India" },
  { slug: "business", label: "Business" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Entertainment" },
];

const PAGE_SIZE = 12;

export default async function VideoIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const requested = firstParam(sp.section) ?? "";
  const section = filters.some((f) => f.slug === requested) ? requested : "";
  const page = pageParam(sp.page);
  const { items, total } = await listVideos({ section: section || undefined, page, pageSize: PAGE_SIZE });
  const featured = page === 1 ? items[0] : undefined;
  const side = featured ? items.slice(1, 3) : [];
  const grid = featured ? items.slice(3) : items;
  const href = (p: number, s = section) => {
    const q = new URLSearchParams();
    if (s) q.set("section", s);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/video?${qs}` : "/video";
  };

  return (
    <>
      <div className="on-dark bg-navy-900 text-white">
        <div className="container-page pt-5 pb-8 md:pt-7 md:pb-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Video" }]} tone="inverse" />
          <p className="t-kicker mt-5 text-gold">Watch</p>
          <h1 className="t-h1 mt-1">Video</h1>
          <p className="mt-2 max-w-2xl text-white/75">Reports, explainers and local stories from our newsroom.</p>

          <nav aria-label="Filter videos" className="scroll-rail -mx-[var(--gutter)] mt-6 flex gap-2 px-[var(--gutter)] md:mx-0 md:px-0">
            {filters.map((f) => {
              const active = f.slug === section;
              return (
                <Link
                  key={f.slug || "all"}
                  href={href(1, f.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center px-3.5 text-sm font-semibold ${
                    active ? "bg-white text-navy-900" : "border border-white/25 text-white/85 hover:border-white"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </nav>

          {featured ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <VideoCard video={featured} size="lg" tone="inverse" as="h2" priority sizes="(min-width: 1024px) 820px, 100vw" />
              </div>
              <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
                {side.map((v) => (
                  <li key={v.id}>
                    <VideoCard video={v} tone="inverse" sizes="(min-width: 1024px) 380px, 45vw" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <section aria-label="More videos" className="container-page py-10">
        {!items.length ? (
          <EmptyState title={`No ${getSectionMeta(section)?.name ?? ""} videos yet`}>New videos are published regularly.</EmptyState>
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {grid.map((v) => (
              <li key={v.id}>
                <VideoCard video={v} />
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} hrefFor={(p) => href(p)} />
      </section>
    </>
  );
}
