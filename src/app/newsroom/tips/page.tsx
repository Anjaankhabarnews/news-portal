"use client";

import { useCallback, useEffect, useState } from "react";
import { canPublish, newsroomClient } from "@/lib/newsroom/client";
import { useMember } from "@/components/newsroom/shell";
import { btnOutline, fmt, Notice, PageTitle } from "@/components/newsroom/ui";

interface Tip {
  id: string;
  name: string | null;
  phone: string;
  location: string;
  category: string | null;
  description: string;
  media_paths: string[];
  status: "new" | "reviewing" | "assigned" | "closed";
  created_at: string;
}

const STATUSES: Array<{ id: Tip["status"]; label: string }> = [
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "assigned", label: "Assigned" },
  { id: "closed", label: "Closed" },
];

/** Reader tips from the website form. Private: only editors/admins can read them (RLS). */
export default function TipsPage() {
  const member = useMember();
  const db = newsroomClient();
  const [filter, setFilter] = useState<Tip["status"] | "all">("new");
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let q = db.from("news_tips").select("*").order("created_at", { ascending: false }).limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setError(error.message);
    setTips((data as Tip[]) ?? []);
  }, [db, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canPublish(member.role)) return <Notice>Only editors can read news tips.</Notice>;

  async function setStatus(t: Tip, status: Tip["status"]) {
    await db.from("news_tips").update({ status }).eq("id", t.id);
    void load();
  }

  /** Reader uploads are in a private bucket — open them through short-lived signed links. */
  async function openMedia(path: string) {
    const { data, error } = await db.storage.from("tips").createSignedUrl(path, 300);
    if (error || !data) return alert(`Could not open file: ${error?.message}`);
    window.open(data.signedUrl, "_blank", "noopener");
  }

  const whatsapp = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <>
      <PageTitle>News tips</PageTitle>
      <div className="scroll-rail mb-4 flex gap-1.5">
        {[{ id: "all" as const, label: "All" }, ...STATUSES].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            aria-pressed={filter === s.id}
            className={`min-h-10 shrink-0 rounded-xs border px-3 text-sm font-semibold ${
              filter === s.id ? "border-navy-900 bg-navy-900 text-white" : "border-line-strong bg-white text-ink-2 hover:border-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {tips === null ? (
        <p className="t-meta">Loading tips…</p>
      ) : tips.length === 0 ? (
        <div className="border border-dashed border-line-strong bg-white px-6 py-12 text-center">
          <p className="font-serif text-xl font-bold">No tips here</p>
          <p className="t-meta mt-1">Tips sent through the website form appear here. WhatsApp tips arrive on WhatsApp.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tips.map((t) => (
            <li key={t.id} className="border border-line bg-white p-4 md:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-ink">
                  {t.location}
                  {t.category ? <span className="ml-2 text-xs font-bold tracking-wide text-red uppercase">{t.category}</span> : null}
                </p>
                <p className="t-meta text-xs">{fmt(t.created_at)}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-2">{t.description}</p>
              {t.media_paths.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.media_paths.map((p, i) => (
                    <button key={p} type="button" onClick={() => openMedia(p)} className={`${btnOutline} min-h-9 px-3 text-sm`}>
                      Open attachment {i + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                <p className="text-ink-2">
                  {t.name || "Anonymous"} ·{" "}
                  <a href={whatsapp(t.phone)} target="_blank" rel="noopener" className="font-semibold text-cobalt hover:underline">
                    {t.phone} (WhatsApp)
                  </a>
                </p>
                <label className="flex items-center gap-2">
                  <span className="t-meta">Status</span>
                  <select value={t.status} onChange={(e) => setStatus(t, e.target.value as Tip["status"])} className="h-9 rounded-xs border border-line-strong px-2">
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
