import Link from "next/link";
import type { Article, Locality, Section } from "@/lib/types";
import { sectionPath } from "@/lib/urls";
import { ArrowRight } from "@/components/icons";
import { FeatureStory, StoryCard, StoryList, TextStory } from "@/components/news/story-cards";
import { EmptyState, SectionHeader } from "@/components/ui/primitives";
import { Band } from "./band";

/** Chip row of Jharkhand localities — the "soul" of the publication, one tap away. */
export function LocalityChips({ section, localities, limit = 6 }: { section: Section; localities: Locality[]; limit?: number }) {
  return (
    <ul className="scroll-rail -mx-[var(--gutter)] mt-4 flex gap-2 px-[var(--gutter)] md:mx-0 md:flex-wrap md:px-0">
      {localities.slice(0, limit).map((l) => (
        <li key={l.slug} className="shrink-0">
          <Link
            href={sectionPath(section.slug, l.slug)}
            className={`inline-flex min-h-10 items-center border px-3.5 text-sm font-semibold transition-colors ${
              l.featured ? "border-navy-900 bg-navy-900 text-white hover:bg-navy-800" : "border-line-strong bg-white text-ink-2 hover:border-ink hover:text-ink"
            }`}
          >
            {l.name}
          </Link>
        </li>
      ))}
      <li className="shrink-0">
        <Link href={`${sectionPath(section.slug)}#districts`} className="inline-flex min-h-10 items-center gap-1 px-2 text-sm font-semibold text-cobalt hover:underline">
          All districts <ArrowRight size={14} />
        </Link>
      </li>
    </ul>
  );
}

function LocalityBlock({ section, locality, items }: { section: Section; locality: Locality; items: Article[] }) {
  const [first, ...rest] = items;
  return (
    <div>
      <h3 className="flex items-baseline justify-between border-t-2 border-red pt-2.5 pb-3">
        <Link href={sectionPath(section.slug, locality.slug)} className="hl-link font-serif text-xl font-bold text-ink">
          {locality.name}
        </Link>
        <Link href={sectionPath(section.slug, locality.slug)} className="t-meta inline-flex min-h-9 items-center font-semibold text-cobalt hover:underline">
          More<span className="sr-only"> from {locality.name}</span>
        </Link>
      </h3>
      {first ? (
        <div className="grid gap-4 xl:grid-cols-2 xl:gap-6">
          <StoryCard article={first} ratio="3/2" size="sm" as="h4" sizes="(min-width: 1280px) 290px, (min-width: 768px) 45vw, 100vw" />
          <StoryList className="border-t border-line pt-4 xl:border-t-0 xl:pt-0">
            {rest.map((a) => (
              <TextStory key={a.id} article={a} as="h4" showKicker={false} size="xs" />
            ))}
          </StoryList>
        </div>
      ) : (
        <p className="t-meta">No recent stories.</p>
      )}
    </div>
  );
}

export function HomeState({
  section,
  lead,
  top,
  localities,
  across,
}: {
  section: Section;
  lead?: Article;
  top: Article[];
  localities: Array<{ locality: Locality; items: Article[] }>;
  across: Article[];
}) {
  return (
    <Band tone="paper" labelledBy="home-state-title">
      <SectionHeader title={section.name} href={sectionPath(section.slug)} linkLabel="All Jharkhand news" eyebrow="Our home state" id="home-state-title">
        <LocalityChips section={section} localities={section.localities ?? []} />
      </SectionHeader>

      {!lead ? (
        <EmptyState title="No Jharkhand stories yet" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FeatureStory article={lead} />
            {top.length ? (
              <ul className="mt-6 grid gap-x-8 gap-y-5 border-t border-line pt-5 sm:grid-cols-2">
                {top.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <TextStory article={a} as="h4" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <aside aria-labelledby="across-title" className="lg:col-span-4 lg:border-l lg:border-line lg:pl-8">
            <h3 id="across-title" className="t-kicker border-t-2 border-ink pt-2.5 pb-3 text-ink">
              Across the districts
            </h3>
            <StoryList>
              {across.map((a) => (
                <TextStory key={a.id} article={a} as="h4" />
              ))}
            </StoryList>
          </aside>

          <div className="grid gap-8 md:grid-cols-2 lg:col-span-12 lg:gap-10">
            {localities.map(({ locality, items }) => (
              <LocalityBlock key={locality.slug} section={section} locality={locality} items={items} />
            ))}
          </div>
        </div>
      )}
    </Band>
  );
}
