/**
 * Generates supabase/migrations/0002_seed_reference_data.sql from the taxonomy in src/config/taxonomy.ts so the
 * database reference data never drifts from the code. Idempotent (upserts).
 *
 *   node --experimental-strip-types scripts/generate-seed.mjs
 */
import { writeFileSync } from "node:fs";
import { sections } from "../src/config/taxonomy.ts";

const q = (v) => (v === undefined || v === null ? "null" : `'${String(v).replace(/'/g, "''")}'`);

const lines = ["-- Reference data generated from src/config/taxonomy.ts - re-run safely.", ""];

lines.push("insert into sections (slug, name, short_name, kind, description, is_home, sort_order) values");
lines.push(
  sections
    .map((s) => `  (${q(s.slug)}, ${q(s.name)}, ${q(s.shortName)}, ${q(s.kind)}, ${q(s.description)}, ${s.isHome ? "true" : "false"}, ${s.order})`)
    .join(",\n") +
    "\non conflict (slug) do update set name = excluded.name, short_name = excluded.short_name, kind = excluded.kind, description = excluded.description, is_home = excluded.is_home, sort_order = excluded.sort_order;",
);
lines.push("");

const locs = sections.flatMap((s) => (s.localities ?? []).map((l, i) => ({ ...l, section: s.slug, order: i + 1 })));
lines.push("insert into localities (section_slug, slug, name, type, district, featured, description, sort_order) values");
lines.push(
  locs
    .map((l) => `  (${q(l.section)}, ${q(l.slug)}, ${q(l.name)}, ${q(l.type)}, ${q(l.district)}, ${l.featured ? "true" : "false"}, ${q(l.description)}, ${l.order})`)
    .join(",\n") +
    "\non conflict (section_slug, slug) do update set name = excluded.name, type = excluded.type, district = excluded.district, featured = excluded.featured, description = excluded.description, sort_order = excluded.sort_order;",
);
lines.push("");

// Newsroom desks (institutional bylines). Individual reporters are added by the newsroom.
const desks = [
  ["newsroom", "Anjaan Khabar Newsroom", "Newsroom"],
  ["jharkhand-desk", "Jharkhand Desk", "State desk"],
  ["jamshedpur-desk", "Jamshedpur Desk", "City desk"],
  ["ranchi-desk", "Ranchi Desk", "City desk"],
  ["regional-desk", "Regional Desk", "States desk"],
  ["national-desk", "National Desk", "National desk"],
  ["business-desk", "Business Desk", "Business desk"],
  ["sports-desk", "Sports Desk", "Sports desk"],
  ["explainers-desk", "Explainers Desk", "Explainers"],
];
lines.push("insert into authors (slug, name, role, is_desk) values");
lines.push(desks.map(([s, n, r]) => `  (${q(s)}, ${q(n)}, ${q(r)}, true)`).join(",\n") + "\non conflict (slug) do nothing;");
lines.push("");

lines.push("insert into social_links (id, label, href, sort_order) values");
lines.push(
  [
    `  ('instagram', 'Instagram', 'https://www.instagram.com/anjaan_khabar/', 1)`,
    `  ('facebook', 'Facebook', 'https://www.facebook.com/profile.php?id=61585995166150', 2)`,
  ].join(",\n") + "\non conflict (id) do update set label = excluded.label, href = excluded.href, sort_order = excluded.sort_order;",
);
lines.push("");

writeFileSync(new URL("../supabase/migrations/0002_seed_reference_data.sql", import.meta.url), lines.join("\n"));
console.log(`seed.sql: ${sections.length} sections, ${locs.length} localities, ${desks.length} desks`);
