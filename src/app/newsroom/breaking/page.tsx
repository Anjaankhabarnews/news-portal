"use client";

import { useCallback, useEffect, useState } from "react";
import { canPublish, newsroomClient, refreshPublicSite } from "@/lib/newsroom/client";
import { useMember } from "@/components/newsroom/shell";
import { btnOutline, btnPrimary, field, fmt, Label, Notice, PageTitle, Panel } from "@/components/newsroom/ui";

interface Item {
  id: string;
  headline: string;
  href: string;
  kind: "breaking" | "developing";
  active: boolean;
  published_at: string;
  expires_at: string | null;
}

/** The red/navy strip under the site header. Up to 5 active items rotate; the site updates live. */
export default function BreakingPage() {
  const member = useMember();
  const db = newsroomClient();
  const [items, setItems] = useState<Item[] | null>(null);
  const [headline, setHeadline] = useState("");
  const [href, setHref] = useState("");
  const [kind, setKind] = useState<Item["kind"]>("breaking");
  const [hours, setHours] = useState("6");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db.from("breaking_news").select("*").order("published_at", { ascending: false }).limit(30);
    if (error) setMsg({ tone: "error", text: error.message });
    setItems((data as Item[]) ?? []);
  }, [db]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canPublish(member.role)) return <Notice>Only editors can manage breaking news.</Notice>;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const h = headline.trim();
    let link = href.trim();
    if (h.length < 10) return setMsg({ tone: "error", text: "Write a headline of at least 10 characters." });
    // Accept full site URLs and turn them into paths.
    link = link.replace(/^https?:\/\/[^/]+/i, "");
    if (!link.startsWith("/")) return setMsg({ tone: "error", text: "Paste the story's link from this site (e.g. /jharkhand/ranchi/…)." });
    const expires = hours === "0" ? null : new Date(Date.now() + Number(hours) * 3_600_000).toISOString();
    const { error } = await db.from("breaking_news").insert({ headline: h, href: link, kind, expires_at: expires });
    if (error) return setMsg({ tone: "error", text: error.message });
    setHeadline("");
    setHref("");
    setMsg({ tone: "success", text: "Added. It appears on the site now." });
    await refreshPublicSite();
    void load();
  }

  async function toggle(it: Item) {
    await db.from("breaking_news").update({ active: !it.active }).eq("id", it.id);
    await refreshPublicSite();
    void load();
  }

  async function remove(it: Item) {
    if (!confirm("Remove this item?")) return;
    await db.from("breaking_news").delete().eq("id", it.id);
    await refreshPublicSite();
    void load();
  }

  const expired = (it: Item) => it.expires_at && new Date(it.expires_at) <= new Date();

  return (
    <>
      <PageTitle>Breaking news bar</PageTitle>
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel title="Add an item" className="lg:col-span-5">
          <form onSubmit={add} className="space-y-4">
            <div>
              <Label htmlFor="b-h">Headline</Label>
              <textarea id="b-h" rows={2} maxLength={160} value={headline} onChange={(e) => setHeadline(e.target.value)} className={`${field} py-2`} />
            </div>
            <div>
              <Label htmlFor="b-l" hint="(the story it opens)">
                Story link
              </Label>
              <input id="b-l" value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://anjaankhabar.com/jharkhand/…" className={`${field} h-11`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="b-k">Label</Label>
                <select id="b-k" value={kind} onChange={(e) => setKind(e.target.value as Item["kind"])} className={`${field} h-11`}>
                  <option value="breaking">Breaking (red)</option>
                  <option value="developing">Developing (navy)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="b-e">Show for</Label>
                <select id="b-e" value={hours} onChange={(e) => setHours(e.target.value)} className={`${field} h-11`}>
                  <option value="2">2 hours</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="0">Until removed</option>
                </select>
              </div>
            </div>
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            <button type="submit" className={`${btnPrimary} w-full`}>
              Add to breaking bar
            </button>
          </form>
        </Panel>

        <Panel title="Items (newest first — up to 5 active show on the site)" className="lg:col-span-7">
          {items === null ? (
            <p className="t-meta">Loading…</p>
          ) : items.length === 0 ? (
            <p className="t-meta">No items yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${it.active && !expired(it) ? "text-ink" : "text-muted line-through"}`}>{it.headline}</p>
                    <p className="t-meta text-xs">
                      <span className={it.kind === "breaking" ? "font-bold text-red" : "font-bold text-navy-700"}>{it.kind.toUpperCase()}</span> · {fmt(it.published_at)}
                      {it.expires_at ? ` · ${expired(it) ? "expired" : "until"} ${fmt(it.expires_at)}` : ""} · {it.href}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => toggle(it)} className={`${btnOutline} min-h-9 px-3 text-sm`}>
                      {it.active ? "Hide" : "Show"}
                    </button>
                    <button type="button" onClick={() => remove(it)} className={`${btnOutline} min-h-9 px-3 text-sm text-red`}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
