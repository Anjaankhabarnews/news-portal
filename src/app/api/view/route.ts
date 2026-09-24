import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Page-view logging for trending. Accepts only a valid article UUID; no personal data is stored. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured) return new NextResponse(null, { status: 204 });
  let id: unknown;
  try {
    ({ id } = await req.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof id !== "string" || !UUID.test(id)) return new NextResponse(null, { status: 400 });

  await getPublicClient().from("article_views").insert({ article_id: id });
  return new NextResponse(null, { status: 204 });
}
