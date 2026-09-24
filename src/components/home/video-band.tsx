import type { HomepageModule, Video } from "@/lib/types";
import { VideoCard } from "@/components/news/video-card";
import { SectionHeader } from "@/components/ui/primitives";
import { Band } from "./band";

/** Dark band for rhythm: one featured video, the rest in a swipeable row on phones. */
export function VideoBand({ m, videos }: { m: HomepageModule; videos: Video[] }) {
  const [featured, ...rest] = videos;
  const id = `mod-${m.id}`;
  return (
    <Band tone="navy" labelledBy={id}>
      <SectionHeader title={m.title ?? "Video"} href="/video" linkLabel="All videos" tone="inverse" id={id} />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <VideoCard video={featured} size="lg" tone="inverse" as="h3" sizes="(min-width: 1024px) 700px, 100vw" />
        </div>
        <ul className="scroll-rail -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-5 px-[var(--gutter)] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:col-span-5 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-7">
          {rest.slice(0, 4).map((v) => (
            <li key={v.id} className="w-[72%] shrink-0 snap-start sm:w-auto sm:max-lg:[&:nth-child(4)]:hidden">
              <VideoCard video={v} tone="inverse" sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 72vw" />
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
