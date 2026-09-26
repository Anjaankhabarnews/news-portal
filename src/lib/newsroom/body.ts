import type { ArticleBlock } from "@/lib/types";

/**
 * Simple writing format for the story editor, converted to structured blocks
 * (never raw HTML, so stored stories cannot inject scripts):
 *
 *   Blank line        → new paragraph
 *   ## Heading        → subheading
 *   > Quote text      → quote   (a following "— Name" line becomes the attribution)
 *   - item            → bullet list
 *   1. item           → numbered list
 */
export function textToBlocks(text: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const chunks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 1 && lines[0].startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].slice(3).trim() });
    } else if (lines.every((l) => /^[-*•]\s+/.test(l))) {
      blocks.push({ type: "list", items: lines.map((l) => l.replace(/^[-*•]\s+/, "")) });
    } else if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      blocks.push({ type: "list", ordered: true, items: lines.map((l) => l.replace(/^\d+[.)]\s+/, "")) });
    } else if (lines[0].startsWith(">")) {
      const citeLine = lines.length > 1 && /^[—–-]\s*/.test(lines[lines.length - 1]) ? lines.pop() : undefined;
      const quote = lines.map((l) => l.replace(/^>\s?/, "")).join(" ").trim();
      blocks.push({ type: "quote", text: quote, cite: citeLine?.replace(/^[—–-]\s*/, "") || undefined });
    } else {
      blocks.push({ type: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}

export function blocksToText(blocks: ArticleBlock[] | null | undefined): string {
  return (blocks ?? [])
    .map((b) => {
      switch (b.type) {
        case "p":
          return b.text;
        case "h2":
          return `## ${b.text}`;
        case "quote":
          return `> ${b.text}${b.cite ? `\n— ${b.cite}` : ""}`;
        case "list":
          return b.items.map((it, i) => (b.ordered ? `${i + 1}. ${it}` : `- ${it}`)).join("\n");
        case "note":
          return b.text;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/** URL slug from a headline. Non-Latin headlines fall back to a dated slug. */
export function slugify(title: string) {
  const s = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  if (s.length >= 3) return s;
  const d = new Date();
  return `story-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7)}`;
}
