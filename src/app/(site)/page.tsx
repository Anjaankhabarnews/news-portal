import { loadHomepage } from "@/lib/homepage";
import { AdSlot } from "@/components/ads/ad-slot";
import { HomeBrief } from "@/components/home/brief";
import { HomeHero } from "@/components/home/hero";
import { HomeState } from "@/components/home/home-state";
import { SectionGrid, SectionWithRail, StatesRail, TopicColumns } from "@/components/home/sections";
import { VideoBand } from "@/components/home/video-band";
import { TipCta } from "@/components/news/tip-cta";
import Link from "next/link";
import { site } from "@/config/site";
import { homeState, otherStateSections } from "@/config/taxonomy";

function LaunchState() {
  return (
    <div className="container-page py-12 md:py-20">
      <h1 className="sr-only">{site.name}</h1>
      <div className="max-w-3xl">
        <p className="t-kicker text-red">{site.tagline}</p>
        <p className="t-h1 mt-2">Our newsroom is getting ready.</p>
        <p className="t-dek mt-4 text-lg">
          Reporting from Jamshedpur, Ranchi and across Jharkhand — and from Bihar, Odisha, West Bengal, Uttar Pradesh and India — will
          appear here as soon as it is published.
        </p>
      </div>
      <nav aria-label="Sections" className="mt-10">
        <ul className="flex flex-wrap gap-2">
          {[homeState, ...otherStateSections].map((s) => (
            <li key={s.slug}>
              <Link href={`/${s.slug}`} className="inline-flex min-h-11 items-center border border-line-strong px-4 font-semibold text-ink-2 hover:border-ink hover:text-ink">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-12">
        <TipCta />
      </div>
    </div>
  );
}

/** Front page re-renders every 2 minutes; the daypart layout follows IST. */
export const revalidate = 120;

export default async function HomePage() {
  const { modules } = await loadHomepage();

  // Nothing published yet (fresh database): a deliberate launch state, not empty modules.
  if (!modules.some((m) => m.type === "hero")) return <LaunchState />;

  return (
    <>
      {modules.map((mod) => {
        const key = mod.m.id;
        switch (mod.type) {
          case "hero":
            return <HomeHero key={key} lead={mod.lead} secondary={mod.secondary} more={mod.more} latest={mod.latest} />;
          case "brief":
            return <HomeBrief key={key} daypart={mod.daypart} items={mod.items} />;
          case "home-state":
            return (
              <HomeState key={key} section={mod.section} lead={mod.lead} top={mod.top} localities={mod.localities} across={mod.across} />
            );
          case "section-with-rail":
            return <SectionWithRail key={key} m={mod.m} section={mod.section} items={mod.items} mostRead={mod.mostRead} />;
          case "section-grid":
            return <SectionGrid key={key} m={mod.m} section={mod.section} items={mod.items} />;
          case "states-rail":
            return <StatesRail key={key} m={mod.m} columns={mod.columns} />;
          case "topic-columns":
            return <TopicColumns key={key} m={mod.m} columns={mod.columns} />;
          case "video":
            return <VideoBand key={key} m={mod.m} videos={mod.videos} />;
          case "ad":
            return mod.m.placement ? <AdSlot key={key} placement={mod.m.placement} band /> : null;
          case "tip-cta":
            return (
              <div key={key} className="container-page pt-8 md:pt-10">
                <TipCta />
              </div>
            );
        }
      })}
    </>
  );
}
