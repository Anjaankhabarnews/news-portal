import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { verifyStaff } from "@/lib/newsroom/verify";
import { CONTENT_TAG } from "@/lib/supabase/server";

/** Called by the newsroom after publishing/editing so the public site updates immediately. */
export async function POST(req: Request) {
  const staff = await verifyStaff(req);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
