import type { Locality, Section } from "@/lib/types";

/**
 * Geographic + topical taxonomy. This is the single source of truth for
 * routes, navigation and the sitemap. The `sections` / `localities` tables in
 * Supabase mirror this shape so it can move into the CMS without code changes.
 */

const jharkhandLocalities: Locality[] = [
  {
    slug: "jamshedpur",
    name: "Jamshedpur",
    type: "city",
    district: "East Singhbhum",
    featured: true,
    description: "News from the Steel City and East Singhbhum district.",
  },
  {
    slug: "ranchi",
    name: "Ranchi",
    type: "district",
    featured: true,
    description: "News from the state capital and Ranchi district.",
  },
  // Ordered roughly by newsroom priority; all 22 remaining districts are routable.
  { slug: "dhanbad", name: "Dhanbad", type: "district" },
  { slug: "bokaro", name: "Bokaro", type: "district" },
  { slug: "hazaribagh", name: "Hazaribagh", type: "district" },
  { slug: "deoghar", name: "Deoghar", type: "district" },
  { slug: "giridih", name: "Giridih", type: "district" },
  { slug: "seraikela-kharsawan", name: "Seraikela Kharsawan", type: "district" },
  { slug: "west-singhbhum", name: "West Singhbhum", type: "district" },
  { slug: "ramgarh", name: "Ramgarh", type: "district" },
  { slug: "dumka", name: "Dumka", type: "district" },
  { slug: "palamu", name: "Palamu", type: "district" },
  { slug: "koderma", name: "Koderma", type: "district" },
  { slug: "chatra", name: "Chatra", type: "district" },
  { slug: "garhwa", name: "Garhwa", type: "district" },
  { slug: "godda", name: "Godda", type: "district" },
  { slug: "gumla", name: "Gumla", type: "district" },
  { slug: "jamtara", name: "Jamtara", type: "district" },
  { slug: "khunti", name: "Khunti", type: "district" },
  { slug: "latehar", name: "Latehar", type: "district" },
  { slug: "lohardaga", name: "Lohardaga", type: "district" },
  { slug: "pakur", name: "Pakur", type: "district" },
  { slug: "sahebganj", name: "Sahebganj", type: "district" },
  { slug: "simdega", name: "Simdega", type: "district" },
];

export const sections: Section[] = [
  {
    slug: "jharkhand",
    name: "Jharkhand",
    kind: "state",
    isHome: true,
    order: 1,
    description: "Our home state. Reporting from Jamshedpur, Ranchi and all 24 districts of Jharkhand.",
    localities: jharkhandLocalities,
  },
  { slug: "bihar", name: "Bihar", kind: "state", order: 2, description: "News and developments from across Bihar." },
  { slug: "odisha", name: "Odisha", kind: "state", order: 3, description: "News and developments from across Odisha." },
  {
    slug: "west-bengal",
    name: "West Bengal",
    shortName: "Bengal",
    kind: "state",
    order: 4,
    description: "News and developments from across West Bengal.",
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    shortName: "UP",
    kind: "state",
    order: 5,
    description: "News and developments from across Uttar Pradesh.",
  },
  { slug: "india", name: "India", kind: "national", order: 6, description: "National news, policy and developments from across India." },
  { slug: "business", name: "Business", kind: "topic", order: 7, description: "Economy, industry, markets, jobs and money — with a regional lens." },
  { slug: "sports", name: "Sports", kind: "topic", order: 8, description: "Cricket, football, hockey, athletics and grassroots sport." },
  { slug: "politics", name: "Politics", kind: "topic", order: 9, description: "Governance, elections, policy and public life." },
  { slug: "education", name: "Education", kind: "topic", order: 10, description: "Schools, colleges, exams and careers." },
  { slug: "health", name: "Health", kind: "topic", order: 11, description: "Public health, hospitals and wellbeing." },
  { slug: "entertainment", name: "Entertainment", kind: "topic", order: 12, description: "Film, music, culture and regional cinema." },
  { slug: "technology", name: "Technology", kind: "topic", order: 13, description: "Digital life, startups and technology policy." },
];

export const sectionMap = new Map(sections.map((s) => [s.slug, s]));

export const stateSections = sections.filter((s) => s.kind === "state");
export const otherStateSections = stateSections.filter((s) => !s.isHome);
export const topicSections = sections.filter((s) => s.kind !== "state");
export const homeState = sections.find((s) => s.isHome)!;

export function getSectionMeta(slug: string): Section | undefined {
  return sectionMap.get(slug);
}

export function getLocalityMeta(sectionSlug: string, localitySlug: string): Locality | undefined {
  return sectionMap.get(sectionSlug)?.localities?.find((l) => l.slug === localitySlug);
}

export interface NavItem {
  href: string;
  label: string;
  /** Opens the Jharkhand districts menu on desktop. */
  hasMenu?: boolean;
  /** Only shown on wide desktop (≥1280px); reachable via menus below that. */
  wideOnly?: boolean;
}

/** Primary navigation, in display order. `More` holds the remaining topics. */
export const primaryNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/jharkhand", label: "Jharkhand", hasMenu: true },
  { href: "/jharkhand/jamshedpur", label: "Jamshedpur", wideOnly: true },
  { href: "/jharkhand/ranchi", label: "Ranchi", wideOnly: true },
  { href: "/bihar", label: "Bihar" },
  { href: "/odisha", label: "Odisha" },
  { href: "/west-bengal", label: "West Bengal" },
  { href: "/uttar-pradesh", label: "Uttar Pradesh" },
  { href: "/india", label: "India" },
  { href: "/business", label: "Business" },
  { href: "/sports", label: "Sports" },
  { href: "/video", label: "Video" },
];

/** Mobile quick-access rail under the header: Jharkhand first, per mobile priorities. */
export const mobileRailNav: NavItem[] = [
  { href: "/", label: "Top" },
  { href: "/latest", label: "Latest" },
  { href: "/jharkhand", label: "Jharkhand" },
  { href: "/jharkhand/jamshedpur", label: "Jamshedpur" },
  { href: "/jharkhand/ranchi", label: "Ranchi" },
  { href: "/india", label: "India" },
  { href: "/video", label: "Video" },
  { href: "/bihar", label: "Bihar" },
  { href: "/odisha", label: "Odisha" },
  { href: "/west-bengal", label: "Bengal" },
  { href: "/uttar-pradesh", label: "UP" },
  { href: "/business", label: "Business" },
  { href: "/sports", label: "Sports" },
];

export const moreNav = [
  { href: "/politics", label: "Politics" },
  { href: "/education", label: "Education" },
  { href: "/health", label: "Health" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/technology", label: "Technology" },
  { href: "/latest", label: "Latest News" },
] as const;

export const companyNav = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/advertise", label: "Advertise With Us" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/corrections", label: "Corrections" },
] as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;
