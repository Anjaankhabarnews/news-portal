"use client";

import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { HorizontalStory } from "./story-cards";

/**
 * Progressive "Load more" for section archives. Without JavaScript the link
 * still works (it points to the chronological Latest page).
 */
export function LoadMore({
  section,
  locality,
  exclude,
  total,
  loaded,
  showKicker,
}: {
  section: string;
  locality?: string;
  exclude: string[];
  total: number;
  loaded: number;
  showKicker: boolean;
}) {
  const [items, setItems] = useState<Article[]>([]);
  const [page, setPage] = useState(2);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const remaining = total - loaded - items.length;

  async function load(e: React.MouseEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const q = new URLSearchParams({ section, page: String(page), exclude: exclude.join(",") });
      if (locality) q.set("locality", locality);
      const res = await fetch(`/api/articles?${q}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: { items: Article[] } = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setPage((p) => p + 1);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      {items.length ? (
        <div className="divide-y divide-line border-t border-line [&>*]:py-4">
          {items.map((a) => (
            <HorizontalStory key={a.id} article={a} size="md" showDek imageSide="left" showKicker={showKicker} />
          ))}
        </div>
      ) : null}
      {remaining > 0 ? (
        <div className="mt-8 border-t border-line pt-6 text-center">
          <Link
            href="/latest"
            onClick={load}
            aria-disabled={state === "loading"}
            className="inline-flex min-h-12 min-w-56 items-center justify-center border-2 border-ink px-6 font-semibold text-ink transition-colors hover:bg-ink hover:text-white aria-disabled:pointer-events-none aria-disabled:opacity-60"
          >
            {state === "loading" ? "Loading…" : "Load more stories"}
          </Link>
          {state === "error" ? (
            <p className="mt-3 text-sm text-red" role="alert">
              Couldn't load more stories. Check your connection and try again.
            </p>
          ) : null}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {items.length ? `${items.length} more stories loaded` : ""}
      </p>
    </>
  );
}
