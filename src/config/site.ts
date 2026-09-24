/**
 * Brand, contact and social configuration.
 * Only verified, official channels belong here — do not add accounts that do not exist.
 */

const whatsappDigits = "918986706033";

export const site = {
  name: "Anjaan Khabar",
  tagline: "Khabar Wahi, Jo Sahi.",
  description:
    "Anjaan Khabar is a digital-first Indian news platform from Jharkhand — reporting from Jamshedpur, Ranchi and every district, and from Bihar, Odisha, West Bengal, Uttar Pradesh and across India.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  language: "en-IN",
  timeZone: "Asia/Kolkata",
  foundingRegion: "Jharkhand",

  /**
   * Logo files are looked up in /public/brand (see src/lib/brand.ts).
   * Drop the official file there — it is never redrawn or recoloured.
   */
  logoDir: "brand",

  contact: {
    whatsappDisplay: "+91 89867 06033",
    whatsappDigits,
    /** Set when an official newsroom email exists. Hidden when undefined. */
    email: undefined as string | undefined,
    /** Registered office address. Hidden when undefined — do not guess. */
    address: undefined as string | undefined,
  },

  /**
   * Policy pages show a "draft pending legal review" notice until this is true.
   * Flip it only after a qualified lawyer has reviewed /privacy, /terms and /cookies.
   */
  legalReviewed: false,
  policiesUpdated: "2026-09-25",

  social: [
    { id: "instagram", label: "Instagram", handle: "@anjaan_khabar", href: "https://www.instagram.com/anjaan_khabar/" },
    { id: "facebook", label: "Facebook", handle: "Anjaan Khabar", href: "https://www.facebook.com/profile.php?id=61585995166150" },
  ] as const,
} as const;

export type SocialId = (typeof site.social)[number]["id"];

/** WhatsApp deep link with an optional prefilled message. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.contact.whatsappDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const whatsappMessages = {
  tip: "Hello Anjaan Khabar newsroom, I have a news tip:\n\nLocation: \nWhat happened: ",
  advertise: "Hello Anjaan Khabar, I would like to enquire about advertising.",
  correction: "Hello Anjaan Khabar, I would like to report a possible error in a story:\n\nStory link: \nDetails: ",
  general: "Hello Anjaan Khabar,",
} as const;
