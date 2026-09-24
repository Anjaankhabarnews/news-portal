import Link from "next/link";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { getLocalityMeta, getSectionMeta } from "@/config/taxonomy";
import { getMostRead, listArticles } from "@/lib/data";
import { formatDate, formatDateTime, readingMinutes } from "@/lib/format";
import type { Article } from "@/lib/types";
import { absoluteUrl, articlePath, sectionPath } from "@/lib/urls";
import { AdSlot } from "@/components/ads/ad-slot";
import { PinIcon } from "@/components/icons";
import { MostRead } from "@/components/news/rails";
import { StoryCard, StoryList, TextStory } from "@/components/news/story-cards";
import { TipCta } from "@/components/news/tip-cta";
import { JsonLd, breadcrumbSchema, newsArticleSchema } from "@/components/seo/json-ld";
import { Breadcrumbs, DemoTag, Kicker, SectionHeader, type Crumb } from "@/components/ui/primitives";
import { StoryImage } from "@/components/ui/story-image";
import { ArticleBody } from "./article-body";
import { ArticleShare } from "./article-share";
import { ViewBeacon } from "./view-beacon";

function wordCount(a: Article) {
  return a.body.reduce((n, b) => {
    if (b.type === "p" || b.type === "h2" || b.type === "quote" || b.type === "note") return n + b.text.split(/\s+/).length;
    if (b.type === "list") return n + b.items.join(" ").split(/\s+/).length;
    return n;
  }, 0);
}

export async function ArticleView({ article }: { article: Article }) {
  const section = getSectionMeta(article.section);
  const locality = article.locality ? getLocalityMeta(article.section, article.locality) : undefined;
  const path = articlePath(article);
  const url = absoluteUrl(path);

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];
  if (section) crumbs.push({ label: section.name, href: sectionPath(section.slug) });
  if (locality) crumbs.push({ label: locality.name, href: sectionPath(article.section, locality.slug) });
  crumbs.push({ label: article.title });

  const [related, moreInSection, mostRead] = await Promise.all([
    listArticles({
      section: article.section,
      locality: article.locality,
      strictSection: true,
      excludeIds: [article.id],
      sort: "editorial",
      pageSize: 4,
    }),
    listArticles({ section: article.section, excludeIds: [article.id], sort: "latest", pageSize: 5 }),
    getMostRead(5),
  ]);
  // Fill "Related" from the wider section if the locality is thin.
  let relatedItems = related.items;
  if (relatedItems.length < 4) {
    const extra = moreInSection.items.filter((a) => !relatedItems.some((r) => r.id === a.id));
    relatedItems = [...relatedItems, ...extra].slice(0, 4);
  }
  const sidebarMore = moreInSection.items.filter((a) => !relatedItems.some((r) => r.id === a.id)).slice(0, 4);

  const updated = article.updatedAt && article.updatedAt !== article.publishedAt ? article.updatedAt : undefined;
  const minutes = readingMinutes(wordCount(article));

  return (
    <>
      <JsonLd data={[newsArticleSchema(article), breadcrumbSchema(crumbs)]} />
      <ViewBeacon articleId={article.id} />
      <div className="reading-progress fixed inset-x-0 top-0 z-50 h-[3px] bg-red" aria-hidden />

      <article className="container-page pt-5 md:pt-7">
        <div className="hidden md:block">
          <Breadcrumbs items={crumbs.slice(0, -1)} />
        </div>

        <div className="grid gap-x-12 lg:grid-cols-12">
          {/* ------------------------------------------------ Main column */}
          <div className="min-w-0 lg:col-span-8">
            <header className="md:mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Kicker article={article} />
                {article.isDemo ? <DemoTag className="text-cobalt-700" /> : null}
              </div>
              <h1 className="t-h1 mt-2 text-ink">{article.title}</h1>
              <p className="mt-3 font-serif text-[1.1875rem] leading-snug text-ink-2 md:text-[1.375rem]">{article.dek}</p>

              <div className="mt-5 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="t-meta space-y-1">
                  <p>
                    By <span className="font-semibold text-ink">{article.author.name}</span>
                    {article.location ? (
                      <span className="ml-2 inline-flex items-center gap-1 text-ink-2">
                        <PinIcon size={14} className="text-red" />
                        {article.location}
                      </span>
                    ) : null}
                  </p>
                  <p>
                    <span className="sr-only">Published </span>
                    <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
                    {updated ? (
                      <>
                        <span aria-hidden> · </span>
                        Updated <time dateTime={updated}>{formatDateTime(updated)}</time>
                      </>
                    ) : null}
                    <span aria-hidden> · </span>
                    {minutes} min read
                  </p>
                </div>
                <ArticleShare url={url} title={article.title} />
              </div>
            </header>

            <figure className="mt-6 -mx-[var(--gutter)] sm:mx-0">
              <StoryImage image={article.image} ratio="16/9" priority zoom={false} sizes="(min-width: 1024px) 820px, 100vw" />
              {article.image.caption || article.image.credit ? (
                <figcaption className="t-meta mt-2 px-[var(--gutter)] sm:px-0">
                  {article.image.caption}
                  {article.image.credit ? <span className="text-muted"> · {article.image.credit}</span> : null}
                </figcaption>
              ) : null}
            </figure>

            <div className="mx-auto max-w-[var(--measure)] lg:mx-0">
              {article.keyTakeaways?.length ? (
                <section aria-labelledby="takeaways" className="mt-8 border-t-[3px] border-red bg-paper p-5 md:p-6">
                  <h2 id="takeaways" className="t-kicker text-ink">
                    Key takeaways
                  </h2>
                  <ul className="mt-3 space-y-2.5">
                    {article.keyTakeaways.map((t) => (
                      <li key={t} className="flex gap-3 font-sans text-[1rem] leading-relaxed text-ink">
                        <span className="mt-2.5 size-1.5 shrink-0 bg-red" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="mt-8">
                <ArticleBody blocks={article.body} insert={<AdSlot placement="in-article" />} />
              </div>

              {article.source ? (
                <p className="t-meta mt-8">
                  <span className="font-semibold text-ink-2">Source:</span> {article.source}
                </p>
              ) : null}

              {article.corrections?.length ? (
                <section aria-labelledby="corrections" className="mt-8 border-l-4 border-gold bg-paper p-4">
                  <h2 id="corrections" className="t-kicker text-ink">
                    Correction
                  </h2>
                  {article.corrections.map((c) => (
                    <p key={c.date} className="mt-2 text-[0.9375rem] text-ink-2">
                      <time dateTime={c.date} className="font-semibold">
                        {formatDate(c.date)}:
                      </time>{" "}
                      {c.text}
                    </p>
                  ))}
                </section>
              ) : null}

              {article.tags.length ? (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="t-kicker mr-1 text-muted">Topics</span>
                  {article.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/search?q=${encodeURIComponent(t)}`}
                      className="inline-flex min-h-9 items-center border border-line-strong px-3 text-sm text-ink-2 hover:border-ink hover:text-ink"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
                <ArticleShare url={url} title={article.title} />
                <Link href={sectionPath(article.section, article.locality)} className="text-sm font-semibold text-cobalt hover:underline">
                  More from {locality?.name ?? section?.name} →
                </Link>
              </div>

              {/* Trust & standards */}
              <aside aria-label="About this story" className="mt-8 text-[0.9375rem] leading-relaxed text-ink-2">
                <p>
                  <span className="font-semibold text-ink">{site.name}</span> follows a published{" "}
                  <Link href="/editorial-policy" className="text-cobalt underline">
                    editorial policy
                  </Link>
                  . Spotted an error?{" "}
                  <a href={whatsappLink(whatsappMessages.correction)} target="_blank" rel="noopener" className="text-cobalt underline">
                    Tell us on WhatsApp
                  </a>{" "}
                  or read our{" "}
                  <Link href="/corrections" className="text-cobalt underline">
                    corrections policy
                  </Link>
                  .
                </p>
              </aside>

              <div className="mt-8">
                <TipCta compact />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ Sidebar */}
          <aside className="mt-12 lg:col-span-4 lg:mt-6" aria-label="More stories">
            <div className="space-y-10">
              <MostRead items={mostRead} headingId="article-most-read" />
              <AdSlot placement="sidebar" />
              {sidebarMore.length ? (
                <section aria-labelledby="more-in-section">
                  <h2 id="more-in-section" className="t-section border-t-[3px] border-ink pt-3 pb-3">
                    Latest in {section?.name}
                  </h2>
                  <StoryList spacing="sm">
                    {sidebarMore.map((a) => (
                      <TextStory key={a.id} article={a} size="xs" />
                    ))}
                  </StoryList>
                </section>
              ) : null}
              <div className="lg:sticky lg:top-20">
                <AdSlot placement="sidebar-tall" />
              </div>
            </div>
          </aside>
        </div>
      </article>

      {relatedItems.length ? (
        <section aria-labelledby="related" className="mt-14 bg-paper py-10 md:py-12">
          <div className="container-page">
            <SectionHeader title="Related stories" id="related" href={sectionPath(article.section, article.locality)} linkLabel="More" />
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((a) => (
                <StoryCard key={a.id} article={a} size="sm" sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
