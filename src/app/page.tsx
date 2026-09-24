import { loadHomepage } from "@/lib/homepage";
import { AdSlot } from "@/components/ads/ad-slot";
import { HomeBrief } from "@/components/home/brief";
import { HomeHero } from "@/components/home/hero";
import { HomeState } from "@/components/home/home-state";
import { SectionGrid, SectionWithRail, StatesRail, TopicColumns } from "@/components/home/sections";
import { VideoBand } from "@/components/home/video-band";
import { TipCta } from "@/components/news/tip-cta";

/** Front page re-renders every 2 minutes; the daypart layout follows IST. */
export const revalidate = 120;

export default async function HomePage() {
  const { modules } = await loadHomepage();

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
