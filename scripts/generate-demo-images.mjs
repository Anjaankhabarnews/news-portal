/**
 * Generates abstract, clearly-labelled placeholder illustrations for demo content.
 * These are NOT photographs and never depict real events. Replace with real
 * newsroom photography (via Supabase Storage) before launch.
 *
 *   node scripts/generate-demo-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "demo");
mkdirSync(OUT, { recursive: true });

const W = 1600;
const H = 900;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const palettes = {
  dusk: ["#0c1f3a", "#173157", "#2c4a78", "#071426", "#d71920"],
  steel: ["#1d2a3a", "#34475e", "#566b85", "#0f1824", "#f2b705"],
  forest: ["#123027", "#1f4a3b", "#2f6a52", "#0b1e18", "#f2b705"],
  earth: ["#3b2a1f", "#5a4030", "#7d5b43", "#241910", "#d71920"],
  river: ["#0e2c3f", "#15435e", "#1f6283", "#0a1e2b", "#19b3e3"],
  slate: ["#22262e", "#353b47", "#4b5363", "#15181e", "#1646c8"],
  crimson: ["#2a0f14", "#471820", "#6b2430", "#1a080c", "#f2b705"],
  pitch: ["#0f2a1a", "#174029", "#1f5637", "#0a1d12", "#ffffff"],
  cobalt: ["#0b1c4d", "#122c73", "#1a3d96", "#07133a", "#19b3e3"],
  sand: ["#3a3322", "#5a4f35", "#7a6c4a", "#231e13", "#d71920"],
};

const motifs = {
  skyline(r, p) {
    let s = "";
    for (let layer = 0; layer < 3; layer++) {
      let x = -20;
      const base = H * (0.55 + layer * 0.12);
      const col = [p[2], p[1], p[3]][layer];
      while (x < W) {
        const w = 60 + r() * 120;
        const h = 80 + r() * (300 - layer * 70);
        s += `<rect x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(H - base + h).toFixed(0)}" fill="${col}"/>`;
        if (layer === 2 && r() > 0.4) {
          for (let wy = base - h + 20; wy < base - 10; wy += 28)
            for (let wx = x + 12; wx < x + w - 14; wx += 22)
              if (r() > 0.55) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="12" fill="${p[4]}" opacity="0.55"/>`;
        }
        x += w + 4;
      }
    }
    return s;
  },
  industry(r, p) {
    let s = `<rect y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="${p[3]}"/>`;
    for (let i = 0; i < 7; i++) {
      const x = 80 + i * 220 + r() * 60;
      const h = 220 + r() * 260;
      s += `<rect x="${x}" y="${H * 0.72 - h}" width="${34 + r() * 20}" height="${h}" fill="${p[2]}"/>`;
      s += `<circle cx="${x + 20}" cy="${H * 0.72 - h - 40}" r="${40 + r() * 50}" fill="${p[1]}" opacity="0.6"/>`;
      s += `<circle cx="${x + 70}" cy="${H * 0.72 - h - 110}" r="${60 + r() * 60}" fill="${p[1]}" opacity="0.35"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const x = r() * W;
      s += `<rect x="${x}" y="${H * 0.58}" width="${180 + r() * 200}" height="${H * 0.14}" fill="${p[1]}"/>`;
    }
    s += `<rect y="${H * 0.72}" width="${W}" height="6" fill="${p[4]}" opacity="0.8"/>`;
    return s;
  },
  hills(r, p) {
    let s = `<circle cx="${W * (0.2 + r() * 0.6)}" cy="${H * 0.3}" r="70" fill="${p[4]}" opacity="0.85"/>`;
    const cols = [p[2], p[1], p[3]];
    cols.forEach((c, i) => {
      const base = H * (0.5 + i * 0.14);
      let d = `M0 ${H} L0 ${base}`;
      for (let x = 0; x <= W; x += 160) d += ` Q ${x + 80} ${base - 80 - r() * 120} ${x + 160} ${base - r() * 40}`;
      d += ` L${W} ${H} Z`;
      s += `<path d="${d}" fill="${c}"/>`;
    });
    return s;
  },
  river(r, p) {
    let s = motifs.hills(r, p);
    s += `<path d="M${W * 0.35} ${H} C ${W * 0.45} ${H * 0.8}, ${W * 0.4} ${H * 0.75}, ${W * 0.55} ${H * 0.68} S ${W * 0.8} ${H * 0.62}, ${W} ${H * 0.64} L ${W} ${H * 0.72} C ${W * 0.8} ${H * 0.7}, ${W * 0.62} ${H * 0.8}, ${W * 0.6} ${H} Z" fill="${p[4]}" opacity="0.5"/>`;
    return s;
  },
  rail(r, p) {
    let s = `<rect y="${H * 0.5}" width="${W}" height="${H * 0.5}" fill="${p[3]}"/>`;
    const vx = W * 0.5;
    const vy = H * 0.5;
    for (const off of [-260, 260, -700, 700]) s += `<line x1="${vx}" y1="${vy}" x2="${vx + off * 2}" y2="${H}" stroke="${p[2]}" stroke-width="${Math.abs(off) > 300 ? 6 : 10}"/>`;
    for (let t = 0.05; t < 1; t += t * 0.35 + 0.02) {
      const y = vy + (H - vy) * t;
      const half = 520 * t + 10;
      s += `<line x1="${vx - half}" y1="${y}" x2="${vx + half}" y2="${y}" stroke="${p[1]}" stroke-width="${2 + t * 14}"/>`;
    }
    s += `<rect x="${vx - 3}" y="${vy - 160}" width="6" height="160" fill="${p[2]}"/><circle cx="${vx}" cy="${vy - 170}" r="16" fill="${p[4]}"/>`;
    return s;
  },
  pitch(r, p) {
    let s = "";
    for (let i = 0; i < 10; i++) s += `<rect x="${i * 160}" width="160" height="${H}" fill="${i % 2 ? p[1] : p[2]}"/>`;
    s += `<g fill="none" stroke="${p[4]}" stroke-opacity="0.75" stroke-width="5"><rect x="60" y="60" width="${W - 120}" height="${H - 120}"/><line x1="${W / 2}" y1="60" x2="${W / 2}" y2="${H - 60}"/><circle cx="${W / 2}" cy="${H / 2}" r="110"/><rect x="60" y="${H / 2 - 190}" width="220" height="380"/><rect x="${W - 280}" y="${H / 2 - 190}" width="220" height="380"/></g>`;
    return s;
  },
  cricket(r, p) {
    let s = `<ellipse cx="${W / 2}" cy="${H * 0.62}" rx="${W * 0.7}" ry="${H * 0.55}" fill="${p[2]}"/>`;
    s += `<ellipse cx="${W / 2}" cy="${H * 0.62}" rx="${W * 0.36}" ry="${H * 0.28}" fill="none" stroke="${p[4]}" stroke-opacity="0.4" stroke-width="4" stroke-dasharray="14 12"/>`;
    s += `<rect x="${W / 2 - 50}" y="${H * 0.35}" width="100" height="${H * 0.52}" fill="${p[1]}" opacity="0.9"/>`;
    s += `<rect x="${W / 2 - 50}" y="${H * 0.42}" width="100" height="4" fill="${p[4]}"/><rect x="${W / 2 - 50}" y="${H * 0.8}" width="100" height="4" fill="${p[4]}"/>`;
    s += `<circle cx="${W * 0.72}" cy="${H * 0.28}" r="22" fill="#d71920"/>`;
    return s;
  },
  chart(r, p) {
    let s = "";
    for (let y = 150; y < H; y += 120) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${p[2]}" stroke-width="2" opacity="0.6"/>`;
    const n = 14;
    const bw = W / n;
    let prev = H * 0.6;
    let d = "";
    for (let i = 0; i < n; i++) {
      const v = Math.max(H * 0.25, Math.min(H * 0.85, prev + (r() - 0.45) * 160));
      s += `<rect x="${i * bw + bw * 0.2}" y="${v}" width="${bw * 0.6}" height="${H - v}" fill="${p[1]}"/>`;
      d += `${i ? "L" : "M"}${i * bw + bw / 2} ${v - 60}`;
      prev = v;
    }
    s += `<path d="${d}" fill="none" stroke="${p[4]}" stroke-width="7" stroke-linejoin="round"/>`;
    return s;
  },
  civic(r, p) {
    let s = `<rect x="${W * 0.18}" y="${H * 0.78}" width="${W * 0.64}" height="${H * 0.22}" fill="${p[3]}"/>`;
    s += `<polygon points="${W * 0.2},${H * 0.36} ${W * 0.5},${H * 0.16} ${W * 0.8},${H * 0.36}" fill="${p[2]}"/>`;
    s += `<rect x="${W * 0.2}" y="${H * 0.36}" width="${W * 0.6}" height="30" fill="${p[1]}"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${W * 0.23 + i * W * 0.075}" y="${H * 0.36 + 30}" width="${W * 0.035}" height="${H * 0.42 - 30}" fill="${p[2]}"/>`;
    s += `<rect x="${W * 0.495}" y="${H * 0.02}" width="6" height="${H * 0.15}" fill="${p[2]}"/><rect x="${W * 0.5}" y="${H * 0.02}" width="70" height="44" fill="${p[4]}" opacity="0.9"/>`;
    return s;
  },
  classroom(r, p) {
    let s = "";
    for (let i = 0; i < 9; i++) {
      const x = 120 + i * 150;
      const h = 360 + r() * 200;
      const tilt = i === 6 ? -12 : 0;
      s += `<rect x="${x}" y="${H - 120 - h}" width="${110 + r() * 20}" height="${h}" fill="${[p[1], p[2], p[4]][i % 3]}" opacity="${i % 3 === 2 ? 0.8 : 1}" transform="rotate(${tilt} ${x} ${H - 120})"/>`;
      s += `<rect x="${x + 20}" y="${H - 120 - h + 40}" width="70" height="8" fill="${p[3]}" opacity="0.5" transform="rotate(${tilt} ${x} ${H - 120})"/>`;
    }
    s += `<rect y="${H - 120}" width="${W}" height="120" fill="${p[3]}"/>`;
    return s;
  },
  health(r, p) {
    let s = "";
    for (let i = 0; i < 26; i++) {
      const x = r() * W;
      const y = r() * H;
      const sz = 20 + r() * 60;
      s += `<g opacity="${0.15 + r() * 0.3}" fill="${p[2]}"><rect x="${x - sz / 6}" y="${y - sz / 2}" width="${sz / 3}" height="${sz}"/><rect x="${x - sz / 2}" y="${y - sz / 6}" width="${sz}" height="${sz / 3}"/></g>`;
    }
    s += `<g fill="${p[4]}"><rect x="${W / 2 - 55}" y="${H / 2 - 170}" width="110" height="340"/><rect x="${W / 2 - 170}" y="${H / 2 - 55}" width="340" height="110"/></g>`;
    return s;
  },
  tech(r, p) {
    let s = "";
    for (let i = 0; i < 40; i++) {
      const x = Math.round((r() * W) / 40) * 40;
      const y = Math.round((r() * H) / 40) * 40;
      const len = 80 + r() * 300;
      const horiz = r() > 0.5;
      s += `<path d="M${x} ${y} ${horiz ? "h" : "v"}${len} ${horiz ? "v" : "h"}${(r() - 0.5) * 160}" stroke="${p[2]}" stroke-width="4" fill="none"/>`;
      s += `<circle cx="${x}" cy="${y}" r="8" fill="${p[4]}" opacity="0.8"/>`;
    }
    s += `<rect x="${W / 2 - 150}" y="${H / 2 - 150}" width="300" height="300" fill="${p[3]}" stroke="${p[4]}" stroke-width="6"/>`;
    return s;
  },
  culture(r, p) {
    let s = "";
    for (let i = 0; i < 7; i++) s += `<circle cx="${W / 2}" cy="${H * 0.95}" r="${900 - i * 120}" fill="${i % 2 ? p[1] : p[2]}"/>`;
    for (let i = 0; i < 5; i++) {
      const x = W * (0.15 + i * 0.18);
      s += `<polygon points="${x},${H * 0.2} ${x - 120},${H} ${x + 120},${H}" fill="${p[4]}" opacity="0.12"/>`;
    }
    return s;
  },
  road(r, p) {
    let s = `<rect y="${H * 0.45}" width="${W}" height="${H * 0.55}" fill="${p[3]}"/>`;
    s += `<polygon points="${W * 0.46},${H * 0.45} ${W * 0.54},${H * 0.45} ${W * 0.9},${H} ${W * 0.1},${H}" fill="${p[1]}"/>`;
    for (let t = 0.08; t < 1; t += 0.16) {
      const y = H * 0.45 + H * 0.55 * t;
      const w = 6 + 30 * t;
      s += `<rect x="${W / 2 - w / 2}" y="${y}" width="${w}" height="${20 + 50 * t}" fill="${p[4]}" opacity="0.85"/>`;
    }
    return s;
  },
  monsoon(r, p) {
    let s = motifs.hills(r, p);
    for (let i = 0; i < 140; i++) {
      const x = r() * W;
      const y = r() * H;
      s += `<line x1="${x}" y1="${y}" x2="${x - 14}" y2="${y + 50}" stroke="#ffffff" stroke-opacity="${0.12 + r() * 0.2}" stroke-width="2"/>`;
    }
    s += `<ellipse cx="${W * 0.3}" cy="${H * 0.14}" rx="340" ry="90" fill="${p[1]}"/><ellipse cx="${W * 0.62}" cy="${H * 0.1}" rx="420" ry="110" fill="${p[2]}"/>`;
    return s;
  },
  market(r, p) {
    let s = `<rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${p[3]}"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 40 + i * 260;
      const c = [p[4], p[2], p[1]][i % 3];
      s += `<polygon points="${x},${H * 0.42} ${x + 230},${H * 0.42} ${x + 250},${H * 0.52} ${x - 20},${H * 0.52}" fill="${c}"/>`;
      for (let k = 0; k < 5; k++) s += `<rect x="${x - 20 + k * 54}" y="${H * 0.42}" width="27" height="${H * 0.1}" fill="#ffffff" opacity="0.12"/>`;
      s += `<rect x="${x}" y="${H * 0.52}" width="230" height="${H * 0.26}" fill="${p[1]}" opacity="0.8"/>`;
      for (let k = 0; k < 6; k++) s += `<circle cx="${x + 25 + k * 36}" cy="${H * 0.7}" r="14" fill="${[p[4], p[2]][k % 2]}"/>`;
    }
    return s;
  },
};

function svg(name, motif, paletteName, seed, variant = "story") {
  const p = palettes[paletteName];
  const r = rng(seed);
  const body = motifs[motif](r, p);
  // Story label sits bottom-centre so it survives 3:2, 4:3 and 1:1 crops.
  // Video thumbnails (always 16:9) carry play/duration bottom-left, so theirs sits top-right.
  const [lx, ly] = variant === "video" ? [W - 228, 32] : [W / 2 - 98, H - 72];
  const label = `<g font-family="Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="3"><rect x="${lx}" y="${ly}" width="196" height="40" fill="#000" opacity="0.45"/><text x="${lx + 16}" y="${ly + 27}" font-size="20" fill="#fff" opacity="0.9">DEMO IMAGE</text></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Demo placeholder illustration">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[3]}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>${body}${label}</svg>`;
}

/** name, motif, palette, seed */
const images = [
  ["jamshedpur-skyline", "skyline", "dusk", 11],
  ["jamshedpur-industry", "industry", "steel", 12],
  ["jamshedpur-river", "river", "river", 13],
  ["jamshedpur-road", "road", "slate", 14],
  ["ranchi-civic", "civic", "cobalt", 21],
  ["ranchi-hills", "hills", "forest", 22],
  ["ranchi-market", "market", "earth", 23],
  ["ranchi-skyline", "skyline", "slate", 24],
  ["jharkhand-hills", "hills", "forest", 31],
  ["jharkhand-monsoon", "monsoon", "river", 32],
  ["jharkhand-rail", "rail", "dusk", 33],
  ["jharkhand-mining", "industry", "earth", 34],
  ["jharkhand-classroom", "classroom", "cobalt", 35],
  ["jharkhand-health", "health", "crimson", 36],
  ["bihar-river", "river", "sand", 41],
  ["bihar-civic", "civic", "sand", 42],
  ["bihar-rail", "rail", "slate", 43],
  ["odisha-coast", "river", "cobalt", 51],
  ["odisha-culture", "culture", "crimson", 52],
  ["bengal-city", "skyline", "crimson", 61],
  ["bengal-market", "market", "dusk", 62],
  ["up-civic", "civic", "earth", 71],
  ["up-road", "road", "sand", 72],
  ["india-civic", "civic", "dusk", 81],
  ["india-rail", "rail", "cobalt", 82],
  ["india-tech", "tech", "cobalt", 83],
  ["india-monsoon", "monsoon", "slate", 84],
  ["business-chart", "chart", "slate", 91],
  ["business-industry", "industry", "slate", 92],
  ["business-market", "market", "sand", 93],
  ["business-chart-2", "chart", "cobalt", 94],
  ["sports-football", "pitch", "pitch", 101],
  ["sports-cricket", "cricket", "pitch", 102],
  ["sports-hockey", "pitch", "forest", 103],
  ["sports-athletics", "road", "crimson", 104],
  ["politics-civic", "civic", "crimson", 111],
  ["education-books", "classroom", "dusk", 121],
  ["health-care", "health", "river", 131],
  ["entertainment-stage", "culture", "dusk", 141],
  ["technology-circuit", "tech", "slate", 151],
];

const videos = [
  ["video-jamshedpur", "skyline", "steel", 201],
  ["video-ranchi", "civic", "forest", 202],
  ["video-monsoon", "monsoon", "river", 203],
  ["video-cricket", "cricket", "pitch", 204],
  ["video-market", "market", "earth", 205],
  ["video-explainer", "chart", "cobalt", 206],
  ["video-culture", "culture", "crimson", 207],
  ["video-rail", "rail", "dusk", 208],
];

for (const [name, motif, pal, seed] of images) writeFileSync(join(OUT, `${name}.svg`), svg(name, motif, pal, seed));
for (const [name, motif, pal, seed] of videos) writeFileSync(join(OUT, `${name}.svg`), svg(name, motif, pal, seed, "video"));

console.log(`Wrote ${images.length + videos.length} demo images to ${OUT}`);
