import type { Metadata } from "next";
import Link from "next/link";
import { getSectionMeta, sections } from "@/config/taxonomy";
import { search } from "@/lib/data";
import { formatDuration } from "@/lib/format";
import { firstParam, pageParam, type SearchParams } from "@/lib/params";
import { articlePath, videoPath } from "@/lib/urls";
import { PlayIcon, SearchIcon } from "@/components/icons";
import { EmptyState, Kicker, Pagination, Timestamp, btn } from "@/components/ui/primitives";
import { StoryImage } from "@/components/ui/story-image";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Anjaan Khabar stories, places, topics and videos.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

const PAGE_SIZE = 10;
const types = [
  { value: "all", label: "All" },
  { value: "articles", label: "Articles" },
  { value: "videos", label: "Videos" },
] as const;
type SearchType = (typeof types)[number]["value"];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps matched terms in <mark>. Pure text splitting — no HTML injection. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-gold/35 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

const suggestions = ["Jamshedpur", "Ranchi", "Monsoon", "Traffic", "Railways", "Hockey", "Exams", "Markets"];

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (firstParam(sp.q) ?? "").trim().slice(0, 120);
  const rawSection = firstParam(sp.section) ?? "";
  const section = getSectionMeta(rawSection) ? rawSection : ""; // only known sections reach the data layer
  const rawType = firstParam(sp.type) ?? "all";
  const type: SearchType = types.some((t) => t.value === rawType) ? (rawType as SearchType) : "all";
  const page = pageParam(sp.page);

  const results = q ? await search({ q, section: section || undefined, type, page, pageSize: PAGE_SIZE }) : null;
  const terms = q.split(/\s+/).filter((t) => t.length > 1);

  const hrefFor = (overrides: Partial<{ type: string; page: number; section: string }>) => {
    const p = new URLSearchParams();
    p.set("q", q);
    const s = overrides.section ?? section;
    const t = overrides.type ?? type;
    const pg = overrides.page ?? 1;
    if (s) p.set("section", s);
    if (t !== "all") p.set("type", t);
    if (pg > 1) p.set("page", String(pg));
    return `/search?${p.toString()}`;
  };

  return (
    <div className="container-page pt-6 pb-4 md:pt-10">
      <h1 className="t-h1">Search</h1>

      <form action="/search" method="get" role="search" className="mt-5">
        <div className="flex border-2 border-ink focus-within:border-cobalt">
          <label htmlFor="search-q" className="sr-only">
            Search terms
          </label>
          <SearchIcon size={22} className="ml-3 shrink-0 self-center text-muted md:ml-4" />
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search stories, places, topics"
            maxLength={120}
            enterKeyHint="search"
            className="h-14 min-w-0 flex-1 bg-transparent px-3 font-serif text-lg focus:outline-none md:text-xl"
          />
          <button type="submit" className="bg-navy-900 px-5 font-semibold text-white hover:bg-navy-800 md:px-7">
            Search
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <fieldset className="flex items-center gap-1" aria-label="Content type">
            <legend className="sr-only">Content type</legend>
            {types.map((t) => (
              <label key={t.value} className="cursor-pointer">
                <input type="radio" name="type" value={t.value} defaultChecked={t.value === type} className="peer sr-only" />
                <span className="inline-flex min-h-10 items-center border border-line-strong px-3.5 text-sm font-semibold text-ink-2 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-cobalt">
                  {t.label}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex items-center gap-2">
            <label htmlFor="search-section" className="t-meta">
              Section
            </label>
            <select
              id="search-section"
              name="section"
              defaultValue={section}
              className="h-10 min-w-44 border border-line-strong bg-white px-2 text-sm text-ink"
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <button type="submit" className={btn("outline", "sm")}>
              Apply
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 max-w-4xl">
        {!q ? (
          <div>
            <p className="t-kicker text-muted">Popular searches</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <Link href={`/search?q=${encodeURIComponent(s)}`} className="inline-flex min-h-10 items-center border border-line-strong px-3.5 text-sm font-semibold text-ink-2 hover:border-ink">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : !results?.items.length ? (
          <EmptyState
            title={`No results for “${q}”`}
            action={
              <Link href="/latest" className={btn("outline")}>
                Browse latest news
              </Link>
            }
          >
            Check the spelling, try fewer words, or search for a place such as a district name.
            {section ? (
              <>
                {" "}
                <Link href={hrefFor({ section: "" })} className="text-cobalt underline">
                  Search all sections instead
                </Link>
                .
              </>
            ) : null}
          </EmptyState>
        ) : (
          <>
            <p className="t-meta border-b border-line pb-3" aria-live="polite">
              {results.total} result{results.total === 1 ? "" : "s"} for <strong className="text-ink">“{q}”</strong>
              {section ? ` in ${getSectionMeta(section)?.name}` : ""}
            </p>
            <ol className="divide-y divide-line">
              {results.items.map((r) =>
                r.kind === "article" ? (
                  <li key={`a-${r.item.id}`} className="group relative flex gap-4 py-5">
                    <div className="min-w-0 flex-1">
                      <Kicker article={r.item} className="mb-1" />
                      <h2 className="t-h-md">
                        <Link href={articlePath(r.item)} className="hl-link stretched-link">
                          <Highlight text={r.item.title} terms={terms} />
                        </Link>
                      </h2>
                      <p className="t-dek mt-1.5 line-clamp-2 text-[0.9375rem]">
                        <Highlight text={r.item.dek} terms={terms} />
                      </p>
                      <p className="t-meta mt-1.5">
                        <Timestamp iso={r.item.publishedAt} />
                      </p>
                    </div>
                    <StoryImage image={r.item.image} ratio="4/3" sizes="160px" className="w-24 shrink-0 self-start sm:w-40" />
                  </li>
                ) : (
                  <li key={`v-${r.item.id}`} className="group relative flex gap-4 py-5">
                    <div className="min-w-0 flex-1">
                      <p className="t-kicker mb-1 flex items-center gap-1.5 text-red">
                        <PlayIcon size={12} /> Video
                      </p>
                      <h2 className="t-h-md">
                        <Link href={videoPath(r.item)} className="hl-link stretched-link">
                          <Highlight text={r.item.title} terms={terms} />
                        </Link>
                      </h2>
                      <p className="t-meta mt-1.5">
                        {formatDuration(r.item.durationSeconds)} · <Timestamp iso={r.item.publishedAt} />
                      </p>
                    </div>
                    <StoryImage image={r.item.thumbnail} ratio="16/9" sizes="160px" className="w-28 shrink-0 self-start sm:w-40" />
                  </li>
                ),
              )}
            </ol>
            <Pagination page={page} total={results.total} pageSize={PAGE_SIZE} hrefFor={(p) => hrefFor({ page: p })} />
          </>
        )}
      </div>
    </div>
  );
}
