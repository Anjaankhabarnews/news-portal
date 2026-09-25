/**
 * Step 2 of the image pipeline: download reviewed selections from Wikimedia
 * Commons, re-verify each licence, and write the central image library.
 *
 *   node scripts/images/fetch-selected.mjs <candidateRoot>
 *
 * Output:
 *   public/images/news/<key>.jpg
 *   src/data/image-library.json   (licence, author, source — never hand-edited)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const UA = "AnjaanKhabarDev/0.1 (editorial image sourcing; https://github.com/Anjaankhabarnews/news-portal)";
const API = "https://commons.wikimedia.org/w/api.php";
const ALLOWED = /^(cc0|pd|public domain|cc-by-\d|cc-by-sa-\d|cc by \d|cc by-sa \d)/i;
const root = process.argv[2];
const repo = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const outDir = join(repo, "public", "images", "news");
mkdirSync(outDir, { recursive: true });

const selections = JSON.parse(readFileSync(join(repo, "scripts", "images", "selections.json"), "utf8"));
const candidates = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/**
 * Manual author corrections, only where the Commons "Artist" field is a
 * processing note rather than a name. Each is checked against the file page.
 */
const AUTHOR_OVERRIDES = {
  "hea-mosquito": "US Department of Agriculture",
};

const library = {};
for (const [key, sel] of Object.entries(selections)) {
  if (key.startsWith("_")) continue;
  const [batch, slot, index, alt, caption, focal, width = 1600] = sel;
  candidates[batch] ??= JSON.parse(readFileSync(join(root, batch, "candidates.json"), "utf8"));
  const cand = candidates[batch][slot]?.[index - 1];
  if (!cand) throw new Error(`${key}: no candidate ${batch}/${slot}#${index}`);

  // Re-query to get a thumbnail at the target width and re-verify the licence.
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: cand.title,
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: String(width),
  });
  const data = await (await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } })).json();
  const ii = Object.values(data.query.pages)[0].imageinfo[0];
  const m = ii.extmetadata;
  const licence = m.LicenseShortName?.value ?? m.License?.value ?? "";
  if (!ALLOWED.test(licence) && !ALLOWED.test(m.License?.value ?? "")) throw new Error(`${key}: licence not allowed (${licence})`);

  const file = `${key}.jpg`;
  const dest = join(outDir, file);
  if (!existsSync(dest)) {
    const img = await fetch(ii.thumburl, { headers: { "User-Agent": UA } });
    if (!img.ok) throw new Error(`${key}: download ${img.status}`);
    writeFileSync(dest, Buffer.from(await img.arrayBuffer()));
    await sleep(250);
  }

  library[key] = {
    src: `/images/news/${file}`,
    width: ii.thumbwidth,
    height: ii.thumbheight,
    alt,
    caption,
    focal,
    source: {
      name: "Wikimedia Commons",
      title: cand.title.replace(/^File:/, ""),
      url: ii.descriptionurl,
      author: AUTHOR_OVERRIDES[key] ?? (strip(m.Artist?.value) || "Unknown"),
      licence,
      licenceUrl: m.LicenseUrl?.value ?? "",
      attributionRequired: (m.AttributionRequired?.value ?? "true") !== "false",
    },
  };
  console.log(`${key}: ${ii.thumbwidth}x${ii.thumbheight} ${licence}`);
  await sleep(200);
}

mkdirSync(join(repo, "src", "data"), { recursive: true });
writeFileSync(join(repo, "src", "data", "image-library.json"), JSON.stringify(library, null, 2) + "\n");
console.log(`\n${Object.keys(library).length} images written`);
