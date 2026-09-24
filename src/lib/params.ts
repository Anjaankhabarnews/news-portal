export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function firstParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** Safe page number from ?page= (1–500). */
export function pageParam(v: string | string[] | undefined) {
  const n = Number.parseInt(firstParam(v) ?? "1", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), 500) : 1;
}
