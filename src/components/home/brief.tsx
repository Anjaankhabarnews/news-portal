import Link from "next/link";
import { daypartBrief } from "@/lib/daypart";
import type { Article, Daypart } from "@/lib/types";
import { articlePath } from "@/lib/urls";
import { articleKicker } from "@/components/ui/primitives";
import { Band } from "./band";

/**
 * Time-aware briefing (Morning Brief → Midday Update → Evening Edition → Day in Review).
 * The label and position come from the daypart; the stories come from the editorial ranking.
 */
export function HomeBrief({ daypart, items }: { daypart: Daypart; items: Article[] }) {
  const copy = daypartBrief[daypart];
  return (
    <Band tone="navy" labelledBy="brief-title">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-3">
          <p className="t-kicker text-gold">{copy.kicker}</p>
          <h2 id="brief-title" className="mt-1 font-serif text-[1.75rem] leading-tight font-bold text-white md:text-[2rem]">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-white/70">{copy.blurb}</p>
        </div>
        <ol className="grid gap-x-8 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3">
          {items.map((a, i) => (
            <li
              key={a.id}
              className={`group relative grid grid-cols-[2rem_1fr] gap-2 border-t border-white/15 py-4 ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <span className="font-serif text-2xl leading-none font-bold text-gold tabular-nums" aria-hidden>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="t-kicker mb-1 text-[0.6875rem] text-white/55">{articleKicker(a)}</p>
                <h3 className="t-h-sm text-white">
                  <Link href={articlePath(a)} className="hl-link stretched-link">
                    {a.title}
                  </Link>
                </h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Band>
  );
}
