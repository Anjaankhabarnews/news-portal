import Link from "next/link";
import { getSectionMeta, getLocalityMeta } from "@/config/taxonomy";
import { formatDuration } from "@/lib/format";
import type { Video } from "@/lib/types";
import { videoPath } from "@/lib/urls";
import { PlayIcon } from "@/components/icons";
import { Timestamp } from "@/components/ui/primitives";
import { StoryImage } from "@/components/ui/story-image";

function videoKicker(v: Video) {
  return (v.locality && getLocalityMeta(v.section, v.locality)?.name) || getSectionMeta(v.section)?.name || "Video";
}

export function VideoCard({
  video,
  size = "md",
  tone = "default",
  as: Tag = "h3",
  priority,
  sizes = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 85vw",
}: {
  video: Video;
  size?: "lg" | "md";
  tone?: "default" | "inverse";
  as?: "h2" | "h3";
  priority?: boolean;
  sizes?: string;
}) {
  const inverse = tone === "inverse";
  const lg = size === "lg";
  return (
    <article className="group relative">
      <StoryImage image={video.thumbnail} ratio="16/9" sizes={sizes} priority={priority}>
        <span className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" aria-hidden />
        <span
          className={`absolute bottom-3 left-3 flex items-center gap-2 font-sans text-xs font-bold text-white ${lg ? "md:bottom-5 md:left-5" : ""}`}
        >
          <span
            className={`grid place-items-center rounded-full bg-red text-white transition-transform group-hover:scale-105 ${lg ? "size-12 md:size-14" : "size-9"}`}
            aria-hidden
          >
            <PlayIcon size={lg ? 22 : 16} className="translate-x-px" />
          </span>
          <span className="rounded-xs bg-black/60 px-1.5 py-0.5 tabular-nums">
            <span className="sr-only">Duration </span>
            {formatDuration(video.durationSeconds)}
          </span>
        </span>
      </StoryImage>
      <div className="pt-3">
        <p className={`t-kicker mb-1.5 ${inverse ? "text-gold" : "text-red"}`}>{videoKicker(video)}</p>
        <Tag className={`${lg ? "t-h-lg" : "t-h-sm"} ${inverse ? "text-white" : "text-ink"}`}>
          <Link href={videoPath(video)} className="hl-link stretched-link">
            {video.title}
          </Link>
        </Tag>
        {lg ? <p className={`t-dek mt-2 ${inverse ? "text-white/75" : ""}`}>{video.summary}</p> : null}
        <p className={`t-meta mt-2 ${inverse ? "text-white/60" : ""}`}>
          <Timestamp iso={video.publishedAt} />
        </p>
      </div>
    </article>
  );
}
