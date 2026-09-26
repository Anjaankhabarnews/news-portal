"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalityMeta, getSectionMeta } from "@/config/taxonomy";
import { canPublish, newsroomClient } from "@/lib/newsroom/client";
import { articlePath } from "@/lib/urls";
import { useMember } from "@/components/newsroom/shell";
import { btnPrimary, fmt, Notice, PageTitle, StatusBadge, field, type StoryStatus } from "@/components/newsroom/ui";

interface Row {
  id: string;
  slug: string;
  title: string;
  status: StoryStatus;
  section_slug: string;
  locality_slug: string | null;
  priority: number;
  is_breaking: boolean;
  is_developing: boolean;
  published_at: string | null;
  created_at: string;
  created_by: string | null;
  author: { name: string } | null;
}

type Filter = "all" | "mine" | "draft" | "pending_review" | "scheduled" | "published" | "archived";
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "mine", label: "My stories" },
  { id: "pending_review", label: "Needs review" },
  { id: "draft", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

const PAGE = 40;

export default function StoriesPage() {
  const member = useMember();
  const [filter, setFilter] = useState<Filter>(canPublish(member.role) ? "all" : "mine");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      let query = newsroomClient()
        .from("articles")
        .select("id,slug,title,status,section_slug,locality_slug,priority,is_breaking,is_developing,published_at,created_at,created_by,author:authors(name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      const now = new Date().toISOString();
      if (filter === "mine") query = query.eq("created_by", member.userId);
      else if (filter === "scheduled") query = query.eq("status", "published").gt("published_at", now);
      else if (filter === "published") query = query.eq("status", "published").lte("published_at", now);
      else if (filter !== "all") query = query.eq("status", filter);
      const term = q.trim().replace(/[%_,()]/g, " ");
      if (term) query = query.ilike("title", `%${term}%`);
      const { data, error } = await query;
      if (cancelled) return;
      if (error) setError(error.message);
      else {
        setError(null);
        setRows(data as unknown as Row[]);
      }
    };
    const t = setTimeout(run, q ? 250 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [filter, q, limit, member.userId]);

  const where = (r: Row) =>
    (r.locality_slug && getLocalityMeta(r.section_slug, r.locality_slug)?.name) || getSectionMeta(r.section_slug)?.name || r.section_slug;
  const isLive = (r: Row) => r.status === "published" && r.published_at && new Date(r.published_at) <= new Date();

  return (
    <>
      <PageTitle
        action={
          member.role !== "ad_manager" ? (
            <Link href="/newsroom/stories/new" className={btnPrimary}>
              + New story
            </Link>
          ) : null
        }
      >
        Stories
      </PageTitle>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="scroll-rail flex gap-1.5" role="tablist" aria-label="Filter stories">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                setLimit(PAGE);
              }}
              className={`min-h-10 shrink-0 rounded-xs border px-3 text-sm font-semibold ${
                filter === f.id ? "border-navy-900 bg-navy-900 text-white" : "border-line-strong bg-white text-ink-2 hover:border-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="md:w-72">
          <span className="sr-only">Search headlines</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search headlines…" className={`${field} mt-0 h-10`} />
        </label>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {rows === null ? (
        <p className="t-meta" role="status">
          Loading stories…
        </p>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-line-strong bg-white px-6 py-12 text-center">
          <p className="font-serif text-xl font-bold">No stories here yet</p>
          <p className="t-meta mt-1">Write the first one with “New story”.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs font-bold tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Headline</th>
                <th className="px-3 py-3">Section</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Byline</th>
                <th className="px-3 py-3">Publish time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="align-top hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <Link href={`/newsroom/stories/${r.id}`} className="font-serif text-[1rem] font-semibold text-ink hover:underline">
                      {r.title || "(untitled)"}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {r.is_breaking ? <span className="font-bold text-red">BREAKING</span> : null}
                      {r.is_developing ? <span className="font-bold text-red">DEVELOPING</span> : null}
                      {r.priority >= 90 ? <span className="font-bold text-navy-700">TOP STORY</span> : null}
                      {isLive(r) ? (
                        <a href={articlePath({ section: r.section_slug, locality: r.locality_slug ?? undefined, slug: r.slug })} target="_blank" className="text-cobalt hover:underline">
                          View live ↗
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-2">{where(r)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} publishedAt={r.published_at} />
                  </td>
                  <td className="px-3 py-3 text-ink-2">{r.author?.name ?? "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-2">{fmt(r.published_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length >= limit ? (
            <div className="border-t border-line p-3 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="font-semibold text-cobalt hover:underline">
                Load more
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
