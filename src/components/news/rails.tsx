import Link from "next/link";
import type { Article } from "@/lib/types";
import { ArrowRight } from "@/components/icons";
import { RankedStory, StoryList, TimelineStory } from "./story-cards";

/** "Most Read" — ordered by the trending view (views × recency). Counts are never shown. */
export function MostRead({ items, title = "Most Read", headingId = "most-read" }: { items: Article[]; title?: string; headingId?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="t-section border-t-[3px] border-red pt-3 pb-3">
        {title}
      </h2>
      <StoryList spacing="sm">
        {items.map((a, i) => (
          <RankedStory key={a.id} article={a} rank={i + 1} />
        ))}
      </StoryList>
    </section>
  );
}

/** "Latest" — strictly chronological, with clock times. */
export function LatestRail({ items, headingId = "latest" }: { items: Article[]; headingId?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-center justify-between border-t-[3px] border-ink pt-3 pb-2">
        <h2 id={headingId} className="t-section flex items-center gap-2">
          <span className="animate-live-dot size-2 rounded-full bg-red" aria-hidden />
          Latest
        </h2>
        <Link href="/latest" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-cobalt hover:text-cobalt-700">
          All <span className="sr-only">latest news</span>
          <ArrowRight size={15} />
        </Link>
      </div>
      <StoryList spacing="sm">
        {items.map((a) => (
          <TimelineStory key={a.id} article={a} />
        ))}
      </StoryList>
    </section>
  );
}
