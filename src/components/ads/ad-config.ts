import type { AdPlacement } from "@/lib/types";

export interface PlacementSpec {
  /** Human label for the ad-ops team and the Advertise page. */
  label: string;
  /** IAB sizes served at each breakpoint. */
  sizes: { mobile?: string; tablet?: string; desktop: string };
  /** Reserved box (prevents layout shift). */
  frameClass: string;
  /** Hide entirely below this breakpoint. */
  hiddenOnMobile?: boolean;
  adsenseSlot?: string;
}

export const placements: Record<AdPlacement, PlacementSpec> = {
  leaderboard: {
    label: "Leaderboard",
    sizes: { mobile: "320×100", tablet: "728×90", desktop: "970×90" },
    frameClass: "h-[100px] max-w-[320px] md:h-[90px] md:max-w-[728px] xl:max-w-[970px]",
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  },
  billboard: {
    label: "Billboard",
    sizes: { mobile: "300×250", tablet: "728×90", desktop: "970×250" },
    frameClass: "h-[250px] max-w-[300px] md:h-[90px] md:max-w-[728px] xl:h-[250px] xl:max-w-[970px]",
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  },
  sidebar: {
    label: "Sidebar rectangle",
    sizes: { mobile: "300×250", desktop: "300×250" },
    frameClass: "h-[250px] max-w-[300px]",
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  },
  "sidebar-tall": {
    label: "Half page",
    sizes: { desktop: "300×600" },
    frameClass: "h-[600px] max-w-[300px]",
    hiddenOnMobile: true,
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  },
  "in-article": {
    label: "In-article",
    sizes: { mobile: "300×250", desktop: "300×250" },
    frameClass: "h-[250px] max-w-[300px]",
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  },
  "section-break": {
    label: "Section break",
    sizes: { mobile: "320×100", tablet: "728×90", desktop: "728×90" },
    frameClass: "h-[100px] max-w-[320px] md:h-[90px] md:max-w-[728px]",
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  },
  footer: {
    label: "Footer",
    sizes: { mobile: "320×50", desktop: "728×90" },
    frameClass: "h-[50px] max-w-[320px] md:h-[90px] md:max-w-[728px]",
    adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
  },
};

export const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
