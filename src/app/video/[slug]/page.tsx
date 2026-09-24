import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocalityMeta, getSectionMeta } from "@/config/taxonomy";
import { getVideo, listVideos } from "@/lib/data";
import { formatDateTime, formatDuration } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, videoPath } from "@/lib/urls";
import { AdSlot } from "@/components/ads/ad-slot";
import { ArticleShare } from "@/components/article/article-share";
import { VideoCard } from "@/components/news/video-card";
import { VideoPlayer } from "@/components/news/video-player";
import { JsonLd, breadcrumbSchema, videoSchema } from "@/components/seo/json-ld";
import { Breadcrumbs, DemoTag, SectionHeader } from "@/components/ui/primitives";

export const revalidate = 600;

export async function generateStaticParams() {
  const { items } = await listVideos({ pageSize: 100 });
  return items.map((v) => ({ slug: v.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideo((await params).slug);
  if (!video) return {};
  return buildMetadata({
    title: video.title,
    description: video.summary,
    path: videoPath(video),
    image: video.thumbnail,
    type: "video.other",
  });
}

export default async function VideoRoute({ params }: Props) {
  const video = await getVideo((await params).slug);
  if (!video) notFound();
  const { items } = await listVideos({ pageSize: 9 });
  const more = items.filter((v) => v.id !== video.id).slice(0, 8);
  const place = (video.locality && getLocalityMeta(video.section, video.locality)?.name) || getSectionMeta(video.section)?.name;
  const crumbs = [{ label: "Home", href: "/" }, { label: "Video", href: "/video" }, { label: video.title }];

  return (
    <>
      <JsonLd data={[videoSchema(video), breadcrumbSchema(crumbs)]} />
      <div className="on-dark bg-navy-950 text-white">
        <div className="container-page pt-5 pb-10">
          <Breadcrumbs items={crumbs.slice(0, -1)} tone="inverse" />
          <div className="mt-5 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="-mx-[var(--gutter)] sm:mx-0">
                <VideoPlayer title={video.title} poster={video.thumbnail} youtubeId={video.youtubeId} />
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <p className="t-kicker text-gold">{place}</p>
                {video.isDemo ? <DemoTag className="text-white/70" /> : null}
              </div>
              <h1 className="t-h-lg mt-2 text-white md:text-[2rem]">{video.title}</h1>
              <p className="mt-3 text-white/80">{video.summary}</p>
              <p className="t-meta mt-4 text-white/60">
                <time dateTime={video.publishedAt}>{formatDateTime(video.publishedAt)}</time> · {formatDuration(video.durationSeconds)}
              </p>
              <div className="mt-5 [&_a]:border-white/25 [&_a]:text-white/85 [&_button]:border-white/25 [&_button]:text-white/85 [&_span]:text-white/60">
                <ArticleShare url={absoluteUrl(videoPath(video))} title={video.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdSlot placement="leaderboard" band />

      <section aria-labelledby="more-videos" className="container-page py-10">
        <SectionHeader title="More videos" href="/video" linkLabel="All videos" id="more-videos" />
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((v) => (
            <li key={v.id}>
              <VideoCard video={v} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
