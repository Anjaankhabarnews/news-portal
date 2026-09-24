import Link from "next/link";
import { getMostRead, listArticles } from "@/lib/data";
import type { Locality, Section } from "@/lib/types";
import { sectionPath } from "@/lib/urls";
import { AdSlot } from "@/components/ads/ad-slot";
import { LocalityChips } from "@/components/home/home-state";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { Breadcrumbs, EmptyState, SectionHeader, btn, type Crumb } from "@/components/ui/primitives";
import { LoadMore } from "./load-more";
import { MostRead } from "./rails";
import { HorizontalStory, LeadStory, StoryCard, StoryList, TextStory } from "./story-cards";
import { TipCta } from "./tip-cta";

const PAGE_SIZE = 12;

/**
 * One data-driven template for every state, district, national and topic page.
 * Opens with an editorial top block; the chronological archive below loads
 * more on demand, so the page itself stays statically cached (ISR).
 */
export async function SectionPage({ section, locality }: { section: Section; locality?: Locality }) {
  const scope = { section: section.slug, locality: locality?.slug, strictSection: section.kind === "state" };
  const [top, mostRead] = await Promise.all([
    listArticles({ ...scope, sort: "editorial", pageSize: 5 }),
    getMostRead(5, section.slug),
  ]);
  const exclude = top.items.map((a) => a.id);
  const archive = await listArticles({ ...scope, excludeIds: exclude, sort: "latest", page: 1, pageSize: PAGE_SIZE });

  const title = locality?.name ?? section.name;
  const path = sectionPath(section.slug, locality?.slug);
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: section.name, href: sectionPath(section.slug) }];
  if (locality) crumbs.push({ label: locality.name, href: path });

  const eyebrow = locality
    ? `${section.name}${locality.type === "city" && locality.district ? ` · ${locality.district} district` : " · District"}`
    : section.isHome
      ? "Our home state"
      : section.kind === "state"
        ? "State"
        : section.kind === "national"
          ? "National"
          : "Section";

  const [lead, ...supporting] = top.items;
  const showArchiveKicker = !locality;

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      {/* ---------- Section masthead */}
      <div className={`border-b border-line ${section.isHome ? "bg-paper" : "bg-white"}`}>
        <div className="container-page pt-5 pb-6 md:pt-7 md:pb-8">
          <Breadcrumbs items={crumbs} />
          <p className="t-kicker mt-5 text-red">{eyebrow}</p>
          <h1 className="t-h1 mt-1 text-ink">{title}</h1>
          <p className="t-dek mt-2 max-w-2xl">
            {locality?.description ?? (locality ? `The latest news from ${locality.name}, Jharkhand.` : section.description)}
          </p>
          {section.localities?.length && !locality ? <LocalityChips section={section} localities={section.localities} limit={8} /> : null}
        </div>
      </div>

      {!lead ? (
        <div className="container-page py-12">
          <EmptyState
            title={`No stories from ${title} yet`}
            action={
              <Link href={locality ? sectionPath(section.slug) : "/"} className={btn("outline")}>
                {locality ? `Browse all ${section.name} news` : "Back to the front page"}
              </Link>
            }
          >
            Our newsroom is expanding coverage here. Have something we should report? Send us a tip.
          </EmptyState>
          <div className="mt-10">
            <TipCta />
          </div>
        </div>
      ) : (
        <>
          {/* ---------- Editorial top block */}
          <section aria-label={`Top stories: ${title}`} className="container-page py-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <LeadStory article={lead} as="h2" sizes="(min-width: 1024px) 720px, 100vw" />
              </div>
              {supporting.length ? (
                <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-8">
                  <div className="hidden gap-6 sm:grid sm:grid-cols-2">
                    {supporting.slice(0, 2).map((a) => (
                      <StoryCard key={a.id} article={a} size="sm" sizes="(min-width: 1024px) 220px, 45vw" />
                    ))}
                  </div>
                  <StoryList className="border-t border-line pt-4 sm:mt-6 sm:pt-5">
                    {supporting.slice(0, 2).map((a) => (
                      <div key={a.id} className="sm:hidden">
                        <HorizontalStory article={a} />
                      </div>
                    ))}
                    {supporting.slice(2).map((a) => (
                      <TextStory key={a.id} article={a} />
                    ))}
                  </StoryList>
                </div>
              ) : null}
            </div>
          </section>

          <AdSlot placement="leaderboard" band />

          {/* ---------- Jharkhand: district index */}
          {section.localities?.length && !locality ? <DistrictIndex section={section} /> : null}

          {/* ---------- Archive + rail */}
          <div className="container-page grid gap-10 py-8 md:py-10 lg:grid-cols-12 lg:gap-8">
            <section aria-labelledby="archive-title" className="lg:col-span-8">
              <SectionHeader title={`Latest from ${title}`} as="h2" id="archive-title" />
              {archive.items.length ? (
                <StoryList>
                  {archive.items.map((a) => (
                    <HorizontalStory key={a.id} article={a} size="md" showDek imageSide="left" showKicker={showArchiveKicker} />
                  ))}
                </StoryList>
              ) : (
                <p className="t-meta">That's everything for now — check back soon.</p>
              )}
              <LoadMore
                section={section.slug}
                locality={locality?.slug}
                exclude={exclude}
                total={archive.total}
                loaded={archive.items.length}
                showKicker={showArchiveKicker}
              />
            </section>
            <aside className="lg:col-span-4 lg:border-l lg:border-line lg:pl-8" aria-label="Most read and advertisement">
              <div className="space-y-10 lg:sticky lg:top-16">
                <MostRead items={mostRead} title={`Most Read in ${section.name}`} headingId="section-most-read" />
                <AdSlot placement="sidebar" />
              </div>
            </aside>
          </div>
        </>
      )}
    </>
  );
}

function DistrictIndex({ section }: { section: Section }) {
  const localities = section.localities ?? [];
  return (
    <section id="districts" aria-labelledby="districts-title" className="scroll-mt-20 bg-paper py-8 md:py-10">
      <div className="container-page">
        <SectionHeader title={`${section.name} districts`} id="districts-title" />
        <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {localities.map((l) => (
            <li key={l.slug} className="bg-white">
              <Link href={sectionPath(section.slug, l.slug)} className="group flex min-h-14 flex-col justify-center px-4 py-3 hover:bg-navy-900">
                <span className={`font-serif text-[1.0625rem] font-semibold group-hover:text-white ${l.featured ? "text-red" : "text-ink"}`}>
                  {l.name}
                </span>
                {l.type === "city" ? <span className="t-meta text-xs group-hover:text-white/70">{l.district}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
