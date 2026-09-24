import type { Author } from "@/lib/types";

/**
 * Newsroom desks. Individual reporters are added by the newsroom through the
 * CMS — no names are invented here.
 */
export const desks = {
  newsroom: { slug: "newsroom", name: "Anjaan Khabar Newsroom", role: "Newsroom", isDesk: true },
  jharkhand: { slug: "jharkhand-desk", name: "Jharkhand Desk", role: "State desk", isDesk: true },
  jamshedpur: { slug: "jamshedpur-desk", name: "Jamshedpur Desk", role: "City desk", isDesk: true },
  ranchi: { slug: "ranchi-desk", name: "Ranchi Desk", role: "City desk", isDesk: true },
  regional: { slug: "regional-desk", name: "Regional Desk", role: "States desk", isDesk: true },
  national: { slug: "national-desk", name: "National Desk", role: "National desk", isDesk: true },
  business: { slug: "business-desk", name: "Business Desk", role: "Business desk", isDesk: true },
  sports: { slug: "sports-desk", name: "Sports Desk", role: "Sports desk", isDesk: true },
  explainers: { slug: "explainers-desk", name: "Explainers Desk", role: "Explainers", isDesk: true },
} satisfies Record<string, Author>;

export type DeskId = keyof typeof desks;
