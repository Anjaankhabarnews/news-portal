/**
 * Step 1 of the image pipeline: search Wikimedia Commons for candidate photos
 * with VERIFIED free licences, and download small previews for human review.
 *
 *   node scripts/images/search-commons.mjs <queries.json> <outDir>
 *
 * queries.json: { "<slot>": ["search terms", ...], ... }
 * Writes <outDir>/candidates.json and <outDir>/<slot>/<n>.jpg previews.
 *
 * Licence gate: only CC0, public domain, CC BY and CC BY-SA files pass.
 * Files flagged with personality-rights restrictions are rejected.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const UA = "AnjaanKhabarDev/0.1 (editorial image sourcing; https://github.com/Anjaankhabarnews/news-portal)";
const API = "https://commons.wikimedia.org/w/api.php";
const [queriesFile, outDir] = process.argv.slice(2);
const queries = JSON.parse(readFileSync(queriesFile, "utf8"));
const PER_SLOT = 6;

export const ALLOWED = /^(cc0|pd|public domain|cc-by-\d|cc-by-sa-\d|cc by \d|cc by-sa \d)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function search(term) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${term} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "25",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "360",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} for ${term}`);
  const data = await res.json();
  return Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
}

function evaluate(page) {
  const ii = page.imageinfo?.[0];
  if (!ii || ii.mime !== "image/jpeg") return null;
  const m = ii.extmetadata ?? {};
  const licence = m.License?.value ?? "";
  const licenceShort = m.LicenseShortName?.value ?? "";
  const restrictions = m.Restrictions?.value ?? "";
  if (!ALLOWED.test(licence) && !ALLOWED.test(licenceShort)) return null;
  if (/personality/i.test(restrictions)) return null;
  if (ii.width < 1400 || ii.height < 800) return null;
  const ratio = ii.width / ii.height;
  if (ratio < 1.15 || ratio > 2.2) return null; // landscape only, crops cleanly to 16:9 / 3:2
  return {
    title: page.title,
    pageUrl: ii.descriptionurl,
    width: ii.width,
    height: ii.height,
    thumb: ii.thumburl,
    licence: licenceShort || licence,
    licenceUrl: m.LicenseUrl?.value ?? "",
    author: strip(m.Artist?.value),
    credit: strip(m.Credit?.value),
    attributionRequired: (m.AttributionRequired?.value ?? "true") !== "false",
    description: strip(m.ImageDescription?.value).slice(0, 200),
  };
}

const out = {};
for (const [slot, terms] of Object.entries(queries)) {
  const seen = new Set();
  const picks = [];
  for (const term of terms) {
    if (picks.length >= PER_SLOT) break;
    try {
      for (const p of await search(term)) {
        if (picks.length >= PER_SLOT) break;
        if (seen.has(p.title)) continue;
        seen.add(p.title);
        const c = evaluate(p);
        if (c) picks.push({ ...c, term });
      }
    } catch (e) {
      console.error(slot, term, e.message);
    }
    await sleep(300);
  }
  const dir = join(outDir, slot);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < picks.length; i++) {
    try {
      const r = await fetch(picks[i].thumb, { headers: { "User-Agent": UA } });
      writeFileSync(join(dir, `${i + 1}.jpg`), Buffer.from(await r.arrayBuffer()));
    } catch (e) {
      console.error("thumb", slot, i + 1, e.message);
    }
    await sleep(150);
  }
  out[slot] = picks;
  console.log(`${slot}: ${picks.length} candidates`);
}
writeFileSync(join(outDir, "candidates.json"), JSON.stringify(out, null, 2));
