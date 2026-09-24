import { NextResponse, type NextRequest } from "next/server";
import { getLocalityMeta, getSectionMeta } from "@/config/taxonomy";
import { listArticles } from "@/lib/data";

const ID = /^[\w-]{1,64}$/;

/**
 * Paged article summaries for "Load more" on section pages. Keeps section pages
 * statically cached while still letting readers go deeper. Bodies are stripped.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const section = sp.get("section") ?? "";
  const locality = sp.get("locality") ?? undefined;
  const meta = getSectionMeta(section);
  if (!meta || (locality && !getLocalityMeta(section, locality))) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }
  const page = Math.min(Math.max(Number.parseInt(sp.get("page") ?? "2", 10) || 2, 1), 200);
  const excludeIds = (sp.get("exclude") ?? "").split(",").filter((id) => ID.test(id)).slice(0, 20);

  const res = await listArticles({
    section,
    locality,
    strictSection: meta.kind === "state",
    excludeIds,
    sort: "latest",
    page,
    pageSize: 12,
  });

  return NextResponse.json(
    { ...res, items: res.items.map((a) => ({ ...a, body: [] })) },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
