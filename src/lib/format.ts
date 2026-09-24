import { site } from "@/config/site";

const tz = site.timeZone;

const timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
const dayMonthFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, day: "numeric", month: "short" });
const fullDateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, day: "numeric", month: "long", year: "numeric" });
const longDayFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: tz,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const ymdFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });

/** "10:42 am" → "10:42 AM" for newsroom style. */
export function formatTime(iso: string) {
  return timeFmt.format(new Date(iso)).toUpperCase();
}

/** "25 September 2026" */
export function formatDate(iso: string | Date) {
  return fullDateFmt.format(new Date(iso));
}

/** "Thursday, 25 September 2026" — utility bar */
export function formatLongDate(d: Date) {
  return longDayFmt.format(d);
}

/** "25 Sep 2026, 10:42 AM IST" — article metadata */
export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)} IST`;
}

function sameIstDay(a: Date, b: Date) {
  return ymdFmt.format(a) === ymdFmt.format(b);
}

/**
 * Card timestamps: "12 min ago", "3 hrs ago", "Yesterday, 9:15 PM", "21 Sep".
 * Rendered on the server; pages revalidate often enough that drift is minutes.
 */
export function formatRelative(iso: string, now: Date = new Date()) {
  const date = new Date(iso);
  const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 12 && sameIstDay(date, now)) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  if (sameIstDay(date, now)) return `Today, ${formatTime(iso)}`;
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (sameIstDay(date, yesterday)) return `Yesterday, ${formatTime(iso)}`;
  return dayMonthFmt.format(date);
}

export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** ISO 8601 duration for VideoObject schema. */
export function isoDuration(totalSeconds: number) {
  return `PT${Math.floor(totalSeconds / 60)}M${totalSeconds % 60}S`;
}

export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 220));
}
