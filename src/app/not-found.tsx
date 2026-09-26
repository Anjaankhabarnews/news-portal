import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/data";
import { TextStory, StoryList } from "@/components/news/story-cards";
import { btn } from "@/components/ui/primitives";
import SiteLayout from "./(site)/layout";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

async function NotFoundContent() {
  const { items } = await listArticles({ sort: "editorial", pageSize: 5 });
  return (
    <div className="container-page grid gap-12 py-12 md:py-20 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="t-kicker text-red">Error 404</p>
        <h1 className="t-h1 mt-2">Looks like this story took a wrong turn.</h1>
        <p className="t-dek mt-4 max-w-xl text-lg">
          The page you were looking for may have moved, been renamed, or never existed. Our reporting is still here.
        </p>
        <form action="/search" method="get" role="search" className="mt-8 flex max-w-lg border-2 border-ink">
          <label htmlFor="nf-q" className="sr-only">
            Search
          </label>
          <input id="nf-q" name="q" type="search" placeholder="Search Anjaan Khabar" className="h-12 min-w-0 flex-1 px-3 focus:outline-none" />
          <button type="submit" className="bg-navy-900 px-5 font-semibold text-white">
            Search
          </button>
        </form>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className={btn("primary")}>
            Go to the front page
          </Link>
          <Link href="/jharkhand" className={btn("outline")}>
            Jharkhand news
          </Link>
        </div>
      </div>
      <aside className="lg:col-span-5 lg:border-l lg:border-line lg:pl-10" aria-labelledby="nf-top">
        <h2 id="nf-top" className="t-section border-t-[3px] border-ink pt-3 pb-3">
          Top stories
        </h2>
        <StoryList>
          {items.map((a) => (
            <TextStory key={a.id} article={a} />
          ))}
        </StoryList>
      </aside>
    </div>
  );
}

/** Unmatched URLs render outside the (site) group, so wrap them in the site chrome here. */
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
