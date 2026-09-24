"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BreakingItem } from "@/lib/types";
import { ChevronLeft, ChevronRight, PauseIcon, PlayIcon } from "@/components/icons";

const ROTATE_MS = 7000;

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return `${h} hr${h > 1 ? "s" : ""} ago`;
}

/**
 * Breaking / developing news strip.
 * - One headline at a time with a calm cross-fade (no marquee, no flashing).
 * - Pausable; pauses on hover/focus; respects reduced motion.
 * - Subscribes to Supabase Realtime when configured, so editors can push items live.
 */
export function BreakingNewsBar({ initial }: { initial: BreakingItem[] }) {
  const [items, setItems] = useState(initial);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [, setTick] = useState(0);

  // Live updates (lazy-loaded; no Supabase code ships when it is not configured).
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    let cleanup: (() => void) | undefined;
    import("@/lib/supabase/realtime").then(({ subscribeToBreaking }) => {
      cleanup = subscribeToBreaking(setItems);
    });
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused || hovered || items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, hovered, items.length]);

  // Refresh relative timestamps each minute.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!items.length) return null;
  const current = items[index % items.length];
  const isBreaking = current.kind === "breaking";
  const go = (d: number) => setIndex((i) => (i + d + items.length) % items.length);

  return (
    <section
      aria-label="Breaking news"
      className="border-b border-line bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="container-page flex min-h-12 items-stretch gap-3 md:gap-4">
        <p
          className={`t-kicker flex shrink-0 items-center gap-2 px-2.5 text-white md:px-3 ${isBreaking ? "bg-red" : "bg-navy-900"}`}
        >
          <span className="animate-live-dot size-1.5 rounded-full bg-white" aria-hidden />
          <span className="hidden xs:inline">{isBreaking ? "Breaking" : "Developing"}</span>
          <span className="xs:hidden">{isBreaking ? "Breaking" : "Live"}</span>
        </p>

        <div className="flex min-w-0 flex-1 items-center py-2" aria-live="polite" aria-atomic="true">
          <Link key={current.id} href={current.href} className="animate-fade-in group block min-w-0">
            <span className="line-clamp-2 font-sans text-[0.9375rem] leading-snug font-semibold text-ink group-hover:underline md:line-clamp-1">
              {current.headline}
            </span>
          </Link>
          <time dateTime={current.publishedAt} className="t-meta ml-3 hidden shrink-0 whitespace-nowrap md:block" suppressHydrationWarning>
            {timeAgo(current.publishedAt)}
          </time>
        </div>

        {items.length > 1 ? (
          <div className="hidden shrink-0 items-center text-ink-2 sm:flex">
            <span className="t-meta mr-1 tabular-nums">
              {(index % items.length) + 1}/{items.length}
            </span>
            <button type="button" onClick={() => go(-1)} className="grid size-9 place-items-center hover:text-ink" aria-label="Previous headline">
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="grid size-9 place-items-center hover:text-ink"
              aria-label={paused ? "Resume headline rotation" : "Pause headline rotation"}
              aria-pressed={paused}
            >
              {paused ? <PlayIcon size={14} /> : <PauseIcon size={16} />}
            </button>
            <button type="button" onClick={() => go(1)} className="grid size-9 place-items-center hover:text-ink" aria-label="Next headline">
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
