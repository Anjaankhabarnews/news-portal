"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaImage } from "@/lib/types";
import { PlayIcon } from "@/components/icons";

/**
 * Click-to-load player. Nothing from YouTube is requested until the reader
 * presses play (faster pages, no third-party cookies on load).
 */
export function VideoPlayer({ title, poster, youtubeId }: { title: string; poster: MediaImage; youtubeId?: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing && youtubeId) {
    return (
      <div className="relative aspect-video bg-black">
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-navy-950">
      <Image
        src={poster.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 860px, 100vw"
        loading="eager"
        fetchPriority="high"
        unoptimized={poster.src.endsWith(".svg")}
        className="object-cover opacity-80"
      />
      {youtubeId ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="on-dark group absolute inset-0 grid place-items-center"
          aria-label={`Play video: ${title}`}
        >
          <span className="grid size-16 place-items-center rounded-full bg-red text-white transition-transform group-hover:scale-105 md:size-20">
            <PlayIcon size={30} className="translate-x-0.5" />
          </span>
        </button>
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="max-w-sm bg-navy-950/85 px-5 py-4 text-white">
            <p className="t-kicker text-gold">Demo video</p>
            <p className="mt-1 text-sm text-white/85">
              The player connects automatically when a video source is added in the newsroom.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
