import type { Article } from "@/lib/types";
import { HorizontalStory, LeadStory, StoryCard, StoryList, TextStory } from "@/components/news/story-cards";
import { LatestRail } from "@/components/news/rails";

/**
 * Front-page top block.
 *   ≥1280: [ lead 6 + 2 text ][ supporting 3 ][ latest 3 ]
 *   1024:  [ lead 8 + 2 text      ][ latest 4 ]
 *          [ supporting (2-up) 8  ][          ]
 *   <1024: lead → supporting → latest; phones get compact rows.
 */
export function HomeHero({
  lead,
  secondary,
  more,
  latest,
}: {
  lead: Article;
  secondary: Article[];
  more: Article[];
  latest: Article[];
}) {
  const alsoTop = more.slice(0, 2);
  return (
    <section aria-label="Top stories" className="container-page pt-4 pb-8 md:pt-6 md:pb-10">
      <h1 className="sr-only">Anjaan Khabar — Top stories</h1>
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-6">
          <LeadStory article={lead} as="h2" />
          {alsoTop.length ? (
            <ul className="mt-5 hidden gap-x-8 border-t border-line pt-4 sm:grid sm:grid-cols-2">
              {alsoTop.map((a) => (
                <li key={a.id}>
                  <TextStory article={a} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="lg:col-span-8 lg:row-start-2 xl:col-span-3 xl:col-start-7 xl:row-start-1 xl:border-l xl:border-line xl:pl-8">
          {/* Phones: compact rows */}
          <StoryList className="border-t border-line pt-4 sm:hidden">
            {[...secondary, ...alsoTop].map((a) => (
              <HorizontalStory key={a.id} article={a} />
            ))}
          </StoryList>
          {/* Tablet / desktop: image cards */}
          <div className="hidden gap-x-6 gap-y-7 sm:grid sm:grid-cols-2 xl:grid-cols-1">
            {secondary.map((a) => (
              <StoryCard key={a.id} article={a} ratio="3/2" size="sm" sizes="(min-width: 1280px) 280px, (min-width: 1024px) 320px, 45vw" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 xl:col-span-3 xl:col-start-10 xl:row-span-1 xl:border-l xl:border-line xl:pl-8">
          <LatestRail items={latest} headingId="home-latest" />
        </div>
      </div>
    </section>
  );
}
