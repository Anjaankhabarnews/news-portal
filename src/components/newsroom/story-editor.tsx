"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sections, getSectionMeta } from "@/config/taxonomy";
import { blocksToText, slugify, textToBlocks } from "@/lib/newsroom/body";
import { canPublish, newsroomClient, refreshPublicSite } from "@/lib/newsroom/client";
import type { ArticleBlock, ArticleFormat, Correction, ImageKind, MediaImage } from "@/lib/types";
import { articlePath } from "@/lib/urls";
import { useMember } from "./shell";
import { btnNavy, btnOutline, btnPrimary, field, fmt, Label, Notice, PageTitle, Panel, StatusBadge, type StoryStatus } from "./ui";

interface Author {
  id: string;
  name: string;
  is_desk: boolean;
}

interface Draft {
  title: string;
  dek: string;
  slug: string;
  section: string;
  locality: string;
  topics: string[];
  location: string;
  authorId: string;
  format: ArticleFormat;
  priority: number;
  isDeveloping: boolean;
  isBreaking: boolean;
  body: string;
  takeaways: string;
  tags: string;
  source: string;
  image: MediaImage | null;
  publishAt: string; // datetime-local value
}

const EMPTY: Draft = {
  title: "",
  dek: "",
  slug: "",
  section: "jharkhand",
  locality: "",
  topics: [],
  location: "",
  authorId: "",
  format: "news",
  priority: 60,
  isDeveloping: false,
  isBreaking: false,
  body: "",
  takeaways: "",
  tags: "",
  source: "",
  image: null,
  publishAt: "",
};

const PRIORITIES = [
  { value: 95, label: "Top story (lead of the homepage)" },
  { value: 80, label: "Important" },
  { value: 60, label: "Normal" },
  { value: 40, label: "Low" },
];

const KINDS: Array<{ value: ImageKind; label: string }> = [
  { value: "event", label: "Photo of this event" },
  { value: "file", label: "File photo" },
  { value: "representative", label: "Representative image" },
  { value: "illustration", label: "Illustration" },
  { value: "ai-illustration", label: "AI-generated illustration" },
];

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** ISO → value for <input type="datetime-local"> in the browser's timezone (IST for the newsroom). */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function StoryEditor({ id }: { id?: string }) {
  const member = useMember();
  const router = useRouter();
  const db = newsroomClient();
  const editorRole = canPublish(member.role);

  const [d, setD] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loaded, setLoaded] = useState(!id);
  const [meta, setMeta] = useState<{
    status: StoryStatus;
    publishedAt: string | null;
    createdBy: string | null;
    corrections: Correction[];
  }>({ status: "draft", publishedAt: null, createdBy: member.userId, corrections: [] });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addToBreaking, setAddToBreaking] = useState(false);
  const [correction, setCorrection] = useState("");

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  // Bylines
  useEffect(() => {
    db.from("authors")
      .select("id,name,is_desk")
      .order("is_desk")
      .order("name")
      .then(({ data }) => setAuthors((data as Author[]) ?? []));
  }, [db]);

  // Existing story
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await db.from("articles").select("*, article_tags(tags(name))").eq("id", id).maybeSingle();
      if (error || !data) {
        setMessage({ tone: "error", text: error?.message ?? "Story not found." });
        setLoaded(true);
        return;
      }
      const tagNames = ((data.article_tags ?? []) as Array<{ tags: { name: string } | null }>).map((t) => t.tags?.name).filter(Boolean);
      setD({
        title: data.title ?? "",
        dek: data.dek ?? "",
        slug: data.slug ?? "",
        section: data.section_slug,
        locality: data.locality_slug ?? "",
        topics: data.topics ?? [],
        location: data.location ?? "",
        authorId: data.author_id,
        format: data.format,
        priority: data.priority,
        isDeveloping: data.is_developing,
        isBreaking: data.is_breaking,
        body: blocksToText(data.body as ArticleBlock[]),
        takeaways: (data.key_takeaways ?? []).join("\n"),
        tags: tagNames.join(", "),
        source: data.source ?? "",
        image: (data.hero_image as MediaImage | null) ?? null,
        publishAt: toLocalInput(data.published_at),
      });
      setSlugTouched(true);
      setMeta({ status: data.status, publishedAt: data.published_at, createdBy: data.created_by, corrections: data.corrections ?? [] });
      setLoaded(true);
    })();
  }, [id, db]);

  // Default byline: the member's own, else the newsroom desk.
  useEffect(() => {
    if (d.authorId || !authors.length) return;
    const own = member.authorId && authors.find((a) => a.id === member.authorId);
    const desk = authors.find((a) => a.name === "Anjaan Khabar Newsroom") ?? authors[0];
    set("authorId", (own || desk).id);
  }, [authors, d.authorId, member.authorId]);

  // Auto-slug from headline until edited by hand.
  useEffect(() => {
    if (!slugTouched) set("slug", d.title ? slugify(d.title) : "");
  }, [d.title, slugTouched]);

  const section = getSectionMeta(d.section);
  const localities = section?.localities ?? [];
  const isPublished = meta.status === "published";
  const isLive = isPublished && meta.publishedAt && new Date(meta.publishedAt) <= new Date();
  const canEdit =
    !id || editorRole || (meta.createdBy === member.userId && (meta.status === "draft" || meta.status === "pending_review"));
  const liveUrl = useMemo(
    () => (d.slug ? articlePath({ section: d.section, locality: d.locality || undefined, slug: d.slug }) : null),
    [d.slug, d.section, d.locality],
  );

  async function uploadImage(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) return setMessage({ tone: "error", text: "Use a JPG, PNG, WebP or AVIF photo." });
    if (file.size > MAX_IMAGE_BYTES) return setMessage({ tone: "error", text: "Photo must be under 10 MB." });
    setUploading(true);
    setMessage(null);
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const now = new Date();
      const path = `articles/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
      const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data } = db.storage.from("media").getPublicUrl(path);
      setD((prev) => ({
        ...prev,
        image: {
          src: data.publicUrl,
          width,
          height,
          alt: prev.image?.alt ?? "",
          caption: prev.image?.caption ?? "",
          credit: prev.image?.credit ?? "",
          kind: prev.image?.kind ?? "event",
          source: { name: "Anjaan Khabar" },
        },
      }));
    } catch (e) {
      setMessage({ tone: "error", text: `Upload failed: ${(e as Error).message}` });
    } finally {
      setUploading(false);
    }
  }

  const setImage = (patch: Partial<MediaImage>) => setD((prev) => (prev.image ? { ...prev, image: { ...prev.image, ...patch } } : prev));

  function validate(publishing: boolean): string | null {
    if (d.title.trim().length < 8) return "Write a headline (at least 8 characters).";
    if (!/^[a-z0-9-]{3,90}$/.test(d.slug)) return "The URL slug may only contain lowercase letters, numbers and hyphens.";
    if (!d.authorId) return "Choose a byline.";
    if (d.image && d.image.alt.trim().length < 5) return "Describe the photo in “Photo description” (for blind readers and Google).";
    if (publishing) {
      if (d.dek.trim().length < 20) return "Write a summary of at least 20 characters before publishing.";
      if (textToBlocks(d.body).length === 0) return "The story body is empty.";
    }
    return null;
  }

  async function save(action: "draft" | "review" | "publish" | "unpublish" | "archive") {
    const publishing = action === "publish";
    const problem = validate(publishing || action === "review");
    if (problem) return setMessage({ tone: "error", text: problem });
    setBusy(action);
    setMessage(null);

    const status: StoryStatus =
      action === "publish" ? "published" : action === "review" ? "pending_review" : action === "archive" ? "archived" : "draft";
    let publishedAt = meta.publishedAt;
    if (publishing) publishedAt = d.publishAt ? new Date(d.publishAt).toISOString() : new Date().toISOString();

    const payload: Record<string, unknown> = {
      slug: d.slug,
      title: d.title.trim(),
      dek: d.dek.trim(),
      section_slug: d.section,
      locality_slug: localities.length && d.locality ? d.locality : null,
      topics: d.topics.filter((t) => t !== d.section),
      location: d.location.trim() || null,
      author_id: d.authorId,
      format: d.format,
      priority: d.priority,
      is_developing: d.isDeveloping,
      is_breaking: d.isBreaking,
      hero_image: d.image
        ? { ...d.image, alt: d.image.alt.trim(), caption: d.image.caption?.trim() || undefined, credit: d.image.credit?.trim() || undefined }
        : null,
      body: textToBlocks(d.body),
      key_takeaways: d.takeaways.split("\n").map((s) => s.trim()).filter(Boolean),
      source: d.source.trim() || null,
      status,
      published_at: publishedAt,
    };
    // Editing a story that is already live → show an "Updated" time on the site.
    if (publishing && isLive) payload.updated_at = new Date().toISOString();
    if (correction.trim() && editorRole) {
      payload.corrections = [...meta.corrections, { date: new Date().toISOString(), text: correction.trim() }];
    }

    let storyId = id;
    if (!id) {
      const { data, error } = await db.from("articles").insert({ ...payload, created_by: member.userId }).select("id").single();
      if (error) return fail(error);
      storyId = data.id;
    } else {
      const { error } = await db.from("articles").update(payload).eq("id", id);
      if (error) return fail(error);
    }

    await syncTags(storyId!);

    if (publishing && addToBreaking && liveUrl) {
      await db.from("breaking_news").insert({ headline: d.title.trim(), href: liveUrl, kind: d.isDeveloping ? "developing" : "breaking" });
    }
    if (status === "published" || isPublished) await refreshPublicSite();

    setMeta((m) => ({
      ...m,
      status,
      publishedAt,
      corrections: (payload.corrections as Correction[] | undefined) ?? m.corrections,
    }));
    setCorrection("");
    setAddToBreaking(false);
    setBusy(null);
    const scheduled = publishing && publishedAt && new Date(publishedAt) > new Date();
    setMessage({
      tone: "success",
      text:
        action === "publish"
          ? scheduled
            ? `Scheduled for ${fmt(publishedAt)}.`
            : "Published. It appears on the site within a minute."
          : action === "review"
            ? "Sent to editors for review."
            : action === "unpublish"
              ? "Unpublished — moved back to drafts."
              : action === "archive"
                ? "Archived."
                : "Draft saved.",
    });
    if (!id && storyId) router.replace(`/newsroom/stories/${storyId}`);
  }

  function fail(error: { code?: string; message: string }) {
    setBusy(null);
    setMessage({
      tone: "error",
      text:
        error.code === "23505"
          ? "Another story in this section already uses this URL slug. Change the slug."
          : error.code === "42501" || /row-level security/i.test(error.message)
            ? "You don't have permission for this action."
            : error.message,
    });
  }

  async function syncTags(storyId: string) {
    const names = [...new Set(d.tags.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 12);
    await db.from("article_tags").delete().eq("article_id", storyId);
    if (!names.length) return;
    const rows = names.map((name) => ({ name, slug: slugify(name) }));
    const { data } = await db.from("tags").upsert(rows, { onConflict: "slug", ignoreDuplicates: false }).select("id,slug");
    if (data?.length) await db.from("article_tags").insert(data.map((t) => ({ article_id: storyId, tag_id: t.id })));
  }

  async function remove() {
    if (!id || !confirm("Delete this story permanently? This cannot be undone.")) return;
    setBusy("delete");
    const { error } = await db.from("articles").delete().eq("id", id);
    if (error) return fail(error);
    if (isPublished) await refreshPublicSite();
    router.replace("/newsroom");
  }

  if (!loaded) return <p className="t-meta">Loading story…</p>;

  const topicOptions = sections.filter((s) => s.kind !== "state" && s.slug !== d.section);

  return (
    <>
      <PageTitle
        action={
          <div className="flex items-center gap-3">
            {id ? <StatusBadge status={meta.status} publishedAt={meta.publishedAt} /> : null}
            {isLive && liveUrl ? (
              <a href={liveUrl} target="_blank" className="font-semibold text-cobalt hover:underline">
                View live ↗
              </a>
            ) : null}
          </div>
        }
      >
        {id ? "Edit story" : "New story"}
      </PageTitle>

      {!canEdit ? (
        <div className="mb-4">
          <Notice>This story is {meta.status === "published" ? "published" : "not yours"} — only editors can change it now.</Notice>
        </div>
      ) : null}
      {message ? (
        <div className="mb-4">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      ) : null}

      <fieldset disabled={!canEdit || busy !== null} className="grid gap-5 lg:grid-cols-12">
        {/* ---------------- Main column */}
        <div className="space-y-5 lg:col-span-8">
          <Panel>
            <div className="space-y-4">
              <div>
                <Label htmlFor="s-title">Headline</Label>
                <textarea id="s-title" rows={2} maxLength={180} value={d.title} onChange={(e) => set("title", e.target.value)} className={`${field} py-2 font-serif text-xl font-bold`} />
              </div>
              <div>
                <Label htmlFor="s-dek" hint="(1–2 sentences shown under the headline)">
                  Summary
                </Label>
                <textarea id="s-dek" rows={2} maxLength={320} value={d.dek} onChange={(e) => set("dek", e.target.value)} className={`${field} py-2`} />
              </div>
              <div>
                <Label htmlFor="s-slug" hint="(web address)">
                  URL slug
                </Label>
                <input
                  id="s-slug"
                  value={d.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  className={`${field} h-11 font-mono text-sm`}
                />
                {liveUrl ? <p className="t-meta mt-1 break-all">anjaankhabar.com{liveUrl}</p> : null}
                {isLive ? <p className="mt-1 text-xs text-red">Changing the slug of a live story breaks links already shared.</p> : null}
              </div>
            </div>
          </Panel>

          <Panel title="Photo">
            {d.image ? (
              <div className="space-y-4">
                {/* Plain <img>: a local preview of the uploaded file; the site serves it through next/image. */}
                <img src={d.image.src} alt="" className="aspect-video w-full bg-paper object-cover" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="i-alt" hint="(what the photo shows — required)">
                      Photo description
                    </Label>
                    <input id="i-alt" value={d.image.alt} onChange={(e) => setImage({ alt: e.target.value })} className={`${field} h-11`} />
                  </div>
                  <div>
                    <Label htmlFor="i-cap">Caption</Label>
                    <input id="i-cap" value={d.image.caption ?? ""} onChange={(e) => setImage({ caption: e.target.value })} className={`${field} h-11`} />
                  </div>
                  <div>
                    <Label htmlFor="i-credit" hint="(photographer)">
                      Credit
                    </Label>
                    <input
                      id="i-credit"
                      value={d.image.credit ?? ""}
                      placeholder="Photo: Name / Anjaan Khabar"
                      onChange={(e) => setImage({ credit: e.target.value, source: e.target.value ? undefined : { name: "Anjaan Khabar" } })}
                      className={`${field} h-11`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="i-kind">What is this photo?</Label>
                    <select id="i-kind" value={d.image.kind ?? "event"} onChange={(e) => setImage({ kind: e.target.value as ImageKind })} className={`${field} h-11`}>
                      {KINDS.map((k) => (
                        <option key={k.value} value={k.value}>
                          {k.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="i-focal" hint="(keeps the subject in frame)">
                      Crop focus
                    </Label>
                    <select id="i-focal" value={d.image.focal ?? "50% 50%"} onChange={(e) => setImage({ focal: e.target.value })} className={`${field} h-11`}>
                      <option value="50% 50%">Centre</option>
                      <option value="50% 25%">Top</option>
                      <option value="50% 75%">Bottom</option>
                      <option value="25% 50%">Left</option>
                      <option value="75% 50%">Right</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className={`${btnOutline} cursor-pointer`}>
                    Replace photo
                    <input type="file" accept={IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                  </label>
                  <button type="button" onClick={() => set("image", null)} className={btnOutline}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-line-strong bg-paper px-4 text-center hover:border-ink">
                <span className="font-semibold text-ink">{uploading ? "Uploading…" : "Upload a photo"}</span>
                <span className="t-meta text-xs">JPG, PNG, WebP or AVIF · up to 10 MB · landscape works best</span>
                <input type="file" accept={IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </label>
            )}
          </Panel>

          <Panel title="Story">
            <Label htmlFor="s-body">Body</Label>
            <textarea id="s-body" rows={18} value={d.body} onChange={(e) => set("body", e.target.value)} className={`${field} py-3 font-serif text-[1.0625rem] leading-relaxed`} />
            <p className="t-meta mt-2 text-xs">
              Leave a blank line between paragraphs · <code>## </code>subheading · <code>&gt; </code>quote (next line <code>— Name</code>) ·{" "}
              <code>- </code>bullet list · <code>1. </code>numbered list
            </p>
            <div className="mt-5">
              <Label htmlFor="s-take" hint="(optional, one per line)">
                Key takeaways
              </Label>
              <textarea id="s-take" rows={3} value={d.takeaways} onChange={(e) => set("takeaways", e.target.value)} className={`${field} py-2`} />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="s-tags" hint="(comma separated)">
                  Tags
                </Label>
                <input id="s-tags" value={d.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Traffic, Monsoon" className={`${field} h-11`} />
              </div>
              <div>
                <Label htmlFor="s-source" hint="(optional)">
                  Source
                </Label>
                <input id="s-source" value={d.source} onChange={(e) => set("source", e.target.value)} placeholder="e.g. District administration statement" className={`${field} h-11`} />
              </div>
            </div>
          </Panel>

          {id && isPublished && editorRole ? (
            <Panel title="Correction">
              {meta.corrections.length ? (
                <ul className="mb-3 space-y-1 text-sm text-ink-2">
                  {meta.corrections.map((c) => (
                    <li key={c.date}>
                      <strong>{fmt(c.date)}:</strong> {c.text}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Label htmlFor="s-corr" hint="(shown at the end of the story when you update)">
                Add a correction note
              </Label>
              <textarea id="s-corr" rows={2} value={correction} onChange={(e) => setCorrection(e.target.value)} className={`${field} py-2`} />
            </Panel>
          ) : null}
        </div>

        {/* ---------------- Side column */}
        <div className="space-y-5 lg:col-span-4">
          <Panel title="Placement">
            <div className="space-y-4">
              <div>
                <Label htmlFor="s-section">Section</Label>
                <select
                  id="s-section"
                  value={d.section}
                  onChange={(e) => {
                    set("section", e.target.value);
                    set("locality", "");
                  }}
                  className={`${field} h-11`}
                >
                  {sections.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {localities.length ? (
                <div>
                  <Label htmlFor="s-loc" hint="(optional)">
                    District / city
                  </Label>
                  <select id="s-loc" value={d.locality} onChange={(e) => set("locality", e.target.value)} className={`${field} h-11`}>
                    <option value="">All of {section?.name}</option>
                    {localities.map((l) => (
                      <option key={l.slug} value={l.slug}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <Label htmlFor="s-place" hint="(dateline, e.g. Sakchi, Jamshedpur)">
                  Location
                </Label>
                <input id="s-place" value={d.location} onChange={(e) => set("location", e.target.value)} className={`${field} h-11`} />
              </div>
              <fieldset>
                <legend className="font-semibold text-ink">Also show in</legend>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                  {topicOptions.map((t) => (
                    <label key={t.slug} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-navy-900"
                        checked={d.topics.includes(t.slug)}
                        onChange={(e) => set("topics", e.target.checked ? [...d.topics, t.slug] : d.topics.filter((x) => x !== t.slug))}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </Panel>

          <Panel title="Details">
            <div className="space-y-4">
              <div>
                <Label htmlFor="s-author">Byline</Label>
                <select id="s-author" value={d.authorId} onChange={(e) => set("authorId", e.target.value)} className={`${field} h-11`}>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.is_desk ? " (desk)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="s-format">Type</Label>
                <select id="s-format" value={d.format} onChange={(e) => set("format", e.target.value as ArticleFormat)} className={`${field} h-11`}>
                  <option value="news">News</option>
                  <option value="analysis">Analysis</option>
                  <option value="explainer">Explainer</option>
                  <option value="brief">Brief</option>
                </select>
              </div>
              <div>
                <Label htmlFor="s-priority">Importance</Label>
                <select id="s-priority" value={d.priority} onChange={(e) => set("priority", Number(e.target.value))} className={`${field} h-11`}>
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                  {!PRIORITIES.some((p) => p.value === d.priority) ? <option value={d.priority}>Custom ({d.priority})</option> : null}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" className="size-4 accent-red" checked={d.isDeveloping} onChange={(e) => set("isDeveloping", e.target.checked)} />
                Developing story
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" className="size-4 accent-red" checked={d.isBreaking} onChange={(e) => set("isBreaking", e.target.checked)} />
                Breaking news
              </label>
            </div>
          </Panel>

          <Panel title={editorRole ? "Publish" : "Submit"}>
            <div className="space-y-3">
              {editorRole ? (
                <>
                  <div>
                    <Label htmlFor="s-when" hint="(leave empty for now; a future time schedules it)">
                      Publish time
                    </Label>
                    <input id="s-when" type="datetime-local" value={d.publishAt} onChange={(e) => set("publishAt", e.target.value)} className={`${field} h-11`} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-red" checked={addToBreaking} onChange={(e) => setAddToBreaking(e.target.checked)} />
                    Also add to the breaking news bar
                  </label>
                  <button type="button" onClick={() => save("publish")} className={`${btnPrimary} w-full`}>
                    {busy === "publish" ? "Publishing…" : isLive ? "Update live story" : "Publish"}
                  </button>
                  <button type="button" onClick={() => save(isPublished ? "unpublish" : "draft")} className={`${btnOutline} w-full`}>
                    {busy === "draft" || busy === "unpublish" ? "Saving…" : isPublished ? "Unpublish (back to draft)" : "Save draft"}
                  </button>
                  {id ? (
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => save("archive")} className={`${btnOutline} flex-1 text-sm`}>
                        Archive
                      </button>
                      <button type="button" onClick={remove} className={`${btnOutline} flex-1 text-sm text-red`}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <button type="button" onClick={() => save("review")} className={`${btnNavy} w-full`}>
                    {busy === "review" ? "Sending…" : "Submit for review"}
                  </button>
                  <button type="button" onClick={() => save("draft")} className={`${btnOutline} w-full`}>
                    {busy === "draft" ? "Saving…" : "Save draft"}
                  </button>
                  <p className="t-meta text-xs">An editor reviews and publishes your story.</p>
                </>
              )}
            </div>
          </Panel>

          <p className="text-sm">
            <Link href="/newsroom" className="font-semibold text-cobalt hover:underline">
              ← All stories
            </Link>
          </p>
        </div>
      </fieldset>
    </>
  );
}
