"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase/server";
import { TIP_LIMITS, cleanText, normalisePhone, validateFiles, validateTip, type TipErrors, type TipFields } from "@/lib/tips";

export type TipState =
  | { status: "idle" }
  | { status: "invalid"; errors: TipErrors }
  | { status: "success" }
  | { status: "not-configured" }
  | { status: "rate-limited" }
  | { status: "error" };

/* Best-effort per-IP limiter (single VPS instance). Use a shared store if horizontally scaled. */
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 8; // an upload + submit counts twice
const hits = new Map<string, number[]>();

async function clientKey() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "ak"}`).digest("hex").slice(0, 32);
}

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};
const PATH_RE = /^\d{4}-\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|heic|mp4|mov)$/;

/**
 * Step 1 (only when attaching media): issue short-lived signed upload URLs for the
 * private `tips` bucket. The browser uploads directly, so large videos never pass
 * through this server.
 */
export async function createTipUploads(
  files: Array<{ type: string; size: number }>,
): Promise<{ ok: true; uploads: Array<{ path: string; token: string }> } | { ok: false; error: string }> {
  const db = getServiceClient();
  if (!db) return { ok: false, error: "not-configured" };
  const invalid = validateFiles(files);
  if (invalid) return { ok: false, error: invalid };
  if (rateLimited(await clientKey())) return { ok: false, error: "rate-limited" };

  const month = new Date().toISOString().slice(0, 7);
  const uploads: Array<{ path: string; token: string }> = [];
  for (const f of files) {
    const path = `${month}/${randomUUID()}.${EXT[f.type]}`;
    const { data, error } = await db.storage.from("tips").createSignedUploadUrl(path);
    if (error || !data) return { ok: false, error: "upload-unavailable" };
    uploads.push({ path, token: data.token });
  }
  return { ok: true, uploads };
}

/** Step 2: validate and store the tip. */
export async function submitTip(_prev: TipState, form: FormData): Promise<TipState> {
  // Honeypot: real people never fill this hidden field.
  if (cleanText(form.get("website"), 200)) return { status: "success" };

  const fields: TipFields = {
    name: cleanText(form.get("name"), 80),
    phone: cleanText(form.get("phone"), 20),
    location: cleanText(form.get("location"), 120),
    category: cleanText(form.get("category"), 60),
    description: cleanText(form.get("description"), TIP_LIMITS.descriptionMax),
  };
  const errors = validateTip(fields, form.get("consent") === "on");
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const mediaPaths = form
    .getAll("media_paths")
    .map((p) => String(p))
    .filter((p) => PATH_RE.test(p))
    .slice(0, TIP_LIMITS.maxFiles);

  const db = getServiceClient();
  if (!db) return { status: "not-configured" };

  const key = await clientKey();
  if (rateLimited(key)) return { status: "rate-limited" };

  const { error } = await db.from("news_tips").insert({
    name: fields.name || null,
    phone: normalisePhone(fields.phone),
    location: fields.location,
    category: fields.category || null,
    description: fields.description,
    media_paths: mediaPaths,
    ip_hash: key,
  });
  if (error) {
    console.error("[news-tip] insert failed", error.message);
    return { status: "error" };
  }
  return { status: "success" };
}
