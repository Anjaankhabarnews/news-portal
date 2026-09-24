import Link from "next/link";
import type { Article, HomepageModule, Section } from "@/lib/types";
import { sectionPath } from "@/lib/urls";
import { AdSlot } from "@/components/ads/ad-slot";
import { MostRead } from "@/components/news/rails";
import { HorizontalStory, StoryCard, StoryList, TextStory } from "@/components/news/story-cards";
import { SectionHeader } from "@/components/ui/primitives";
import { Band } from "./band";

/** Section lead + list, with Most Read and a sidebar ad in the right rail (India). */
export function SectionWithRail({ m, section, items, mostRead }: { m: HomepageModule; section: Section; items: Article[]; mostRead: Article[] }) {
  const [lead, ...rest] = items;
  const id = `mod-${m.id}`;
  return (
    <Band tone={m.tone} labelledBy={id}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <SectionHeader title={m.title ?? section.name} href={sectionPath(section.slug)} id={id} />
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <StoryCard article={lead} ratio="3/2" size="lg" showDek sizes="(min-width: 1024px) 400px, (min-width: 768px) 45vw, 100vw" />
            <StoryList className="md:border-l md:border-line md:pl-8">
              {rest.map((a) => (
                <HorizontalStory key={a.id} article={a} showKicker={false} thumbClass="lg:max-xl:hidden" />
              ))}
            </StoryList>
          </div>
        </div>
        <aside className="grid gap-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:content-start lg:border-l lg:border-line lg:pl-8" aria-label="Most read and advertisement">
          <MostRead items={mostRead.slice(0, 5)} headingId={`${id}-most-read`} />
          <AdSlot placement="sidebar" className="sm:pt-10 lg:pt-0" />
        </aside>
      </div>
    </Band>
  );
}

/** Generic section module with two layouts so neighbouring sections never look identical. */
export function SectionGrid({ m, section, items }: { m: HomepageModule; section: Section; items: Article[] }) {
  const id = `mod-${m.id}`;
  const [lead, ...rest] = items;

  return (
    <Band tone={m.tone} labelledBy={id}>
      <SectionHeader title={m.title ?? section.name} href={sectionPath(section.slug)} id={id} />
      {m.layout === "four-up" ? (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((a, i) => (
            <div key={a.id} className={i > 0 ? "max-sm:border-t max-sm:border-line max-sm:pt-6" : ""}>
              {i === 0 ? (
                <StoryCard article={a} ratio="3/2" size="md" sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw" />
              ) : (
                <>
                  <div className="sm:hidden">
                    <HorizontalStory article={a} showKicker={false} />
                  </div>
                  <div className="hidden sm:block">
                    <StoryCard article={a} ratio="3/2" size="sm" sizes="(min-width: 1024px) 300px, 45vw" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <StoryCard article={lead} ratio="16/9" size="lg" showDek sizes="(min-width: 1024px) 700px, 100vw" />
          </div>
          <StoryList className="lg:col-span-5 lg:border-l lg:border-line lg:pl-8">
            {rest.map((a) => (
              <HorizontalStory key={a.id} article={a} size="sm" showDek />
            ))}
          </StoryList>
        </div>
      )}
    </Band>
  );
}

/**
 * Other states side by side. Phones get a swipeable, snap-scrolling rail
 * instead of four long stacked columns.
 */
export function StatesRail({ m, columns }: { m: HomepageModule; columns: Array<{ section: Section; items: Article[] }> }) {
  const id = `mod-${m.id}`;
  return (
    <Band tone={m.tone} labelledBy={id}>
      <SectionHeader title={m.title ?? "States"} id={id} eyebrow="Bihar · Odisha · West Bengal · Uttar Pradesh" />
      <ul className="scroll-rail -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-5 px-[var(--gutter)] md:mx-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:px-0 xl:grid-cols-4">
        {columns.map(({ section, items }) => {
          const [first, ...rest] = items;
          return (
            <li key={section.slug} className="w-[82%] shrink-0 snap-start xs:w-[70%] md:w-auto">
              <h3 className="flex items-baseline justify-between border-t-2 border-ink pt-2.5 pb-3">
                <Link href={sectionPath(section.slug)} className="hl-link font-serif text-xl font-bold">
                  {section.name}
                </Link>
                <Link href={sectionPath(section.slug)} className="t-meta inline-flex min-h-9 items-center font-semibold text-cobalt hover:underline">
                  More<span className="sr-only"> from {section.name}</span>
                </Link>
              </h3>
              {first ? (
                <>
                  <StoryCard article={first} as="h4" ratio="3/2" size="sm" sizes="(min-width: 1280px) 290px, (min-width: 768px) 45vw, 80vw" />
                  <StoryList className="mt-4 border-t border-line pt-4">
                    {rest.map((a) => (
                      <TextStory key={a.id} article={a} as="h4" showKicker={false} size="xs" />
                    ))}
                  </StoryList>
                </>
              ) : (
                <p className="t-meta">No recent stories from {section.name}.</p>
              )}
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

/** Dense text columns for secondary topics. */
export function TopicColumns({ m, columns }: { m: HomepageModule; columns: Array<{ section: Section; items: Article[] }> }) {
  const id = `mod-${m.id}`;
  const visible = columns.filter((c) => c.items.length);
  if (!visible.length) return null;
  return (
    <Band tone={m.tone} labelledBy={id}>
      <SectionHeader title={m.title ?? "More News"} id={id} />
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map(({ section, items }) => (
          <div key={section.slug}>
            <h3 className="border-b border-line pb-2">
              <Link href={sectionPath(section.slug)} className="t-kicker inline-flex min-h-9 items-center text-red hover:underline">
                {section.name}
              </Link>
            </h3>
            <StoryList className="pt-3">
              {items.map((a) => (
                <TextStory key={a.id} article={a} as="h4" showKicker={false} />
              ))}
            </StoryList>
          </div>
        ))}
      </div>
    </Band>
  );
}
