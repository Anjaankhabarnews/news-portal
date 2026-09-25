# Anjaan Khabar

**Khabar Wahi, Jo Sahi.** A digital-first Indian news platform from Jharkhand, covering Jamshedpur, Ranchi, all 24 districts, Bihar, Odisha, West Bengal, Uttar Pradesh and India.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. It has a Supabase-ready data layer and deploys to a Hostinger VPS.

> **Status: connected to Supabase, awaiting first stories.** With `CONTENT_SOURCE=demo` (or without Supabase), the site runs on clearly labelled **demo content**:
> - Stories are fictional, attributed to newsroom desks, and name no real people.
> - Images are abstract illustrations marked "DEMO IMAGE".
> - A notice bar sits on every page.
> - `robots.txt` blocks indexing.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (also type-checks)
npm run start        # serve the production build
```

Requires Node.js 22+ (`@supabase/supabase-js` 2.117 requires it; see `.nvmrc`). Developed on Node 24.

## ⚠️ Add the official logo

The logo is **never redrawn or recreated in code**. Put the official file in **`public/brand/`**: SVG, or a PNG at least 800px wide.

- Any filename containing `logo` is picked up automatically. Its real dimensions are read from the file, so it is never stretched.
- Optional variants in the same folder: `*mobile*` (compact header) and `*footer*` or `*light*` (dark footer).
- The favicon (`/icon`) and the default social share image (`/og-default.png`) are generated from the same file.

Until the file exists, a dashed placeholder wordmark shows, so the gap stays obvious.

## Project structure

```
src/
  app/                      Routes (App Router)
    page.tsx                Homepage: editorial modules, time-of-day aware
    [section]/              State / national / topic landing pages
    [section]/[slug]/       Jharkhand locality page OR non-locality article
    [section]/[slug]/[article]/  Locality article (/jharkhand/jamshedpur/<slug>)
    video/, search/, latest/, news-tip/
    about, contact, advertise, editorial-policy, corrections, privacy, terms, cookies
    api/view                Page-view logging (feeds Most Read)
    api/articles            "Load more" on section pages
    sitemap.ts, robots.ts, news-sitemap.xml/, icon.tsx, og-default.png/
  config/
    site.ts                 Brand, WhatsApp, official social links, policy flags
    taxonomy.ts             States, Jharkhand localities, topics, navigation
  lib/
    data/                   ContentSource interface + demo and Supabase adapters
    homepage.ts             Resolves homepage modules and allocates stories
    daypart.ts              Morning / midday / evening / night (IST)
    tips.ts                 News-tip validation (shared by client and server)
    supabase/               Server, browser and realtime clients
    demo/                   Demo content (delete when live)
  components/
    layout/                 Header, nav, mobile drawer, search, breaking bar, footer
    news/                   Card system, rails, section template, video, tip CTA
    home/                   Homepage modules
    article/                Article view, body renderer, share, view beacon
    ads/                    <AdSlot/>, placement specs, AdSense unit
    seo/                    JSON-LD (NewsArticle, BreadcrumbList, Organization, WebSite, VideoObject)
supabase/migrations/        Schema, RLS, storage buckets, seed data (applied in order)
scripts/generate-demo-images.mjs
```

## Design system

- All tokens live in `src/app/globals.css` (`@theme`): colours, type roles, breakpoints, radii and shadows.
  - The default Tailwind palette is disabled, so only brand colours can be used.
  - Type roles: `t-display`, `t-h1`, `t-h-lg`, `t-h-md`, `t-h-sm`, `t-kicker`, `t-meta`, `t-dek`, `prose-article`.
  - Layout primitives: `container-page`, `scroll-rail`, `stretched-link`.
- Typefaces are Source Serif 4 (headlines, article body) and Source Sans 3 (UI).
  - Devanagari fallbacks (Noto) are already in the font stacks.
  - `:lang(hi)` adjusts line-heights, so a Hindi edition doesn't need a redesign.
- The card system (`components/news/story-cards.tsx`) runs from heaviest to lightest: `LeadStory`, `FeatureStory`, `StoryCard`, `HorizontalStory`, `TextStory`, `TimelineStory`, `RankedStory`, `VideoCard`.

## Content and Supabase

Pages never query a database directly. They call `src/lib/data`, which uses **Supabase** when it is configured and the built-in **demo stories** otherwise. Set `CONTENT_SOURCE=demo` to preview the design with demo stories at any time. With an empty database, the homepage shows a "newsroom is getting ready" launch state.

**Live project:** `anjaan-khabar`, in the Mumbai region (`ap-south-1`), URL `https://wibghxlzcksqcujolddr.supabase.co`. Migrations `0001`–`0004` in `supabase/migrations/` are already applied:

- **0001: schema.** Tables for articles, sections, localities, authors, media, tags, breaking_news, videos, homepage_sections, advertisements, social_links, news_tips and article_views. Row Level Security is on every table. Two storage buckets: a public `media` bucket and a private `tips` bucket.
- **0002: reference data.** The 13 sections, 24 Jharkhand localities, 9 newsroom desks and the official social links. It's generated from `taxonomy.ts` by `node --experimental-strip-types scripts/generate-seed.mjs`.
- **0003: security hardening.** Role checks and trending logic move to a `private` schema the API doesn't expose. Only a trending rank is exposed, never view counts.
- **0004: performance.** Foreign-key indexes, and `auth.uid()` is evaluated once per query instead of once per row.

The Supabase security advisor reports no issues.

For a new environment, apply the migrations in order in the SQL editor. Then set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the publishable key. It's safe in the browser because RLS is on.
- `SUPABASE_SERVICE_ROLE_KEY`: **server-only**, used for news-tip inserts and signed uploads. Copy it from Dashboard → Project Settings → API Keys. Never prefix it with `NEXT_PUBLIC_`.

Newsroom staff sign in with Supabase Auth and are added to `newsroom_members` with a role (`admin`, `editor`, `reporter` or `ad_manager`). RLS enforces permissions on the server.

Security notes:

- Article bodies are stored as structured JSON blocks, not HTML, so stored XSS isn't possible.
- News tips are validated on the server and rate-limited. Their media goes straight to the private bucket using short-lived signed upload URLs.

### Editorial control (no code changes needed)

- **Homepage layout** lives in the `homepage_sections` table (the default is `src/lib/demo/misc.ts`):
  - module type, sections, background tone, layout
  - `dayparts` to show a module only at certain times
  - `daypart_order` to reorder modules through the day (IST)
- **Story prominence** comes from `articles.priority` (0–100), gently decayed by age (`src/lib/data/ranking.ts`). The homepage allocates stories top-down and doesn't repeat them between modules.
- **Breaking news** comes from the `breaking_news` table. The bar updates live through Supabase Realtime.
- **Most Read** is ordered by recent views from `article_views`, weighted towards the last 6 hours. View counts are never displayed.
- **Ads** come from the `advertisements` table: placement, advertiser, campaign, date window, weight, active flag. Direct, government and local campaigns are all supported. If none is live, the slot uses AdSense when configured, otherwise a house ad.

## Deploying to Hostinger

**Hostinger Node.js web app (managed):** deploy from GitHub (`main`) with:

- Node.js version: **22**
- Install: `npm ci` (or `npm install`) · Build: `npm run build` · Start: `npm start`
- Environment variables: see `.env.example` (set `NEXT_PUBLIC_SITE_URL=https://anjaankhabar.com`)

**Hostinger VPS:**

```bash
# on the server (Ubuntu), Node 22+ installed
git clone <repo> anjaan-khabar && cd anjaan-khabar
cp .env.example .env.production   # fill in real values; NEXT_PUBLIC_SITE_URL=https://your-domain
npm ci && npm run build
PORT=3000 npm start               # run under pm2 / systemd
```

Put Nginx in front of it: proxy to `127.0.0.1:3000`, enable HTTPS with Let's Encrypt, and point the domain's DNS at the VPS.

Hostinger's basic shared hosting plans (the kind that run WordPress) usually can't run a Next.js server. Use a VPS, or a Hostinger plan that explicitly supports Node.js apps.

## Launch checklist

- [ ] Official logo in `public/brand/`
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain (drives canonical URLs, the sitemap and Open Graph)
- [ ] Supabase connected. Demo content is then unused; delete `src/lib/demo/*` articles and `public/demo/`.
- [ ] Real newsroom photography in the `media` bucket
- [ ] `site.contact.email` and `site.contact.address` in `src/config/site.ts`, if you want them published
- [ ] Privacy, Terms and Cookie policies reviewed by a lawyer, then `legalReviewed: true` in `site.ts`
- [ ] AdSense client and slot IDs in the environment, once AdSense approves the site
- [ ] Submit `/sitemap.xml` and `/news-sitemap.xml` in Google Search Console
- [ ] Test the news-tip form end to end with the Supabase service key set
