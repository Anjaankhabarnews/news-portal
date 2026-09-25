import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CONTENT_TAG } from "@/lib/supabase/server";

/**
 * Instant refresh after an editor publishes (called by the future newsroom
 * dashboard or a Supabase database webhook):
 *
 *   POST /api/revalidate   Authorization: Bearer <REVALIDATE_SECRET>
 *
 * Without it, content still refreshes within about a minute.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok =
    Boolean(secret) &&
    given.length === secret!.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(secret!));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
