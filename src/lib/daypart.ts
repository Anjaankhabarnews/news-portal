import { site } from "@/config/site";
import type { Daypart } from "@/lib/types";

const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, hour: "numeric", hourCycle: "h23" });

/** Editorial dayparts in IST. Boundaries are newsroom conventions and easy to tune. */
export function getDaypart(now: Date = new Date()): Daypart {
  const h = Number(hourFmt.format(now));
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 16) return "midday";
  if (h >= 16 && h < 21) return "evening";
  return "night";
}

export const daypartBrief: Record<Daypart, { title: string; kicker: string; blurb: string }> = {
  morning: {
    title: "Morning Brief",
    kicker: "Start here",
    blurb: "Overnight developments and what to watch today, from Jharkhand to Delhi.",
  },
  midday: {
    title: "Midday Update",
    kicker: "Developing",
    blurb: "The stories moving right now across the region.",
  },
  evening: {
    title: "Evening Edition",
    kicker: "Today's biggest stories",
    blurb: "The day's major developments, in one place.",
  },
  night: {
    title: "Day in Review",
    kicker: "Before you sleep",
    blurb: "What happened today, and why it matters.",
  },
};
