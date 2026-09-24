-- ============================================================================
-- ANJAAN KHABAR — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`) on a fresh project.
--
-- Security model
--   • Every table has Row Level Security enabled.
--   • Anonymous visitors can only READ published, public content.
--   • Newsroom staff authenticate with Supabase Auth; their role lives in
--     `newsroom_members` and is checked server-side by RLS — never in the client.
--   • Reader news tips are inserted by the Next.js server using the service
--     role key after validation; anon users cannot read or write tips.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Newsroom roles
-- ---------------------------------------------------------------------------
create type newsroom_role as enum ('admin', 'editor', 'reporter', 'ad_manager');

create table newsroom_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role newsroom_role not null default 'reporter',
  created_at timestamptz not null default now()
);

create or replace function has_role(roles newsroom_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from newsroom_members m where m.user_id = auth.uid() and m.role = any(roles)
  );
$$;

-- ---------------------------------------------------------------------------
-- Taxonomy (mirrors src/config/taxonomy.ts)
-- ---------------------------------------------------------------------------
create type section_kind as enum ('state', 'national', 'topic');

create table sections (
  slug text primary key,
  name text not null,
  short_name text,
  kind section_kind not null,
  description text not null default '',
  is_home boolean not null default false,
  sort_order int not null default 100
);

create table localities (
  section_slug text not null references sections(slug) on update cascade,
  slug text not null,
  name text not null,
  type text not null check (type in ('city', 'district')),
  district text,
  featured boolean not null default false,
  description text,
  sort_order int not null default 100,
  primary key (section_slug, slug)
);

-- ---------------------------------------------------------------------------
-- People & media
-- ---------------------------------------------------------------------------
create table authors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text not null default 'Reporter',
  is_desk boolean not null default false,
  bio text,
  member_id uuid references newsroom_members(user_id)
);

create table media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,          -- path inside the public `media` bucket
  alt text not null,
  caption text,
  credit text,
  width int not null,
  height int not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
create type article_status as enum ('draft', 'pending_review', 'scheduled', 'published', 'archived');
create type article_format as enum ('news', 'analysis', 'explainer', 'brief');

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  dek text not null default '',
  section_slug text not null references sections(slug) on update cascade,
  locality_slug text,
  topics text[] not null default '{}',
  location text,
  author_id uuid not null references authors(id),
  status article_status not null default 'draft',
  format article_format not null default 'news',
  priority int not null default 50 check (priority between 0 and 100),
  is_breaking boolean not null default false,
  is_developing boolean not null default false,
  -- MediaImage JSON: {src, alt, width, height, caption, credit}
  hero_image jsonb not null,
  -- ArticleBlock[] JSON — structured blocks, never raw HTML (prevents stored XSS)
  body jsonb not null default '[]',
  key_takeaways text[],
  source text,
  corrections jsonb not null default '[]',
  published_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  fts tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(dek, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(location, '')), 'C')
  ) stored,
  unique nulls not distinct (section_slug, locality_slug, slug),
  foreign key (section_slug, locality_slug) references localities(section_slug, slug)
);

create index articles_published_idx on articles (published_at desc) where status = 'published';
create index articles_section_idx on articles (section_slug, published_at desc);
create index articles_topics_idx on articles using gin (topics);
create index articles_fts_idx on articles using gin (fts);

create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- Public read view: only published, already-live articles.
create view published_articles with (security_invoker = true) as
  select a.*, to_jsonb(au) - 'member_id' - 'bio' as author,
         coalesce((select array_agg(t.name order by t.name) from article_tags at join tags t on t.id = at.tag_id where at.article_id = a.id), '{}') as tag_names
  from articles a
  join authors au on au.id = a.author_id
  where a.status = 'published' and a.published_at <= now();

-- ---------------------------------------------------------------------------
-- Views / trending (no counts are ever shown publicly)
-- ---------------------------------------------------------------------------
create table article_views (
  id bigint generated always as identity primary key,
  article_id uuid not null references articles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);
create index article_views_recent_idx on article_views (viewed_at desc, article_id);

-- Aggregated trend scores (runs as owner so raw view rows stay private).
-- Recent views weigh 3x; the window is 48 hours. Scores are for ordering only
-- and are never displayed.
create view article_trends as
  select article_id,
         count(*) filter (where viewed_at > now() - interval '6 hours') * 3 + count(*) as trend_score
  from article_views
  where viewed_at > now() - interval '48 hours'
  group by article_id;

create view most_read with (security_invoker = true) as
  select pa.*, t.trend_score
  from published_articles pa
  join article_trends t on t.article_id = pa.id
  order by t.trend_score desc;

-- ---------------------------------------------------------------------------
-- Breaking news, videos, homepage, ads, social
-- ---------------------------------------------------------------------------
create table breaking_news (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  href text not null,
  kind text not null default 'breaking' check (kind in ('breaking', 'developing')),
  active boolean not null default true,
  published_at timestamptz not null default now(),
  expires_at timestamptz
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null default '',
  section_slug text not null references sections(slug),
  locality_slug text,
  duration_seconds int not null default 0,
  thumbnail jsonb not null,
  youtube_id text,
  status article_status not null default 'draft',
  published_at timestamptz
);

-- Editor-controlled homepage layout, including time-of-day ordering.
create table homepage_sections (
  id text primary key,
  type text not null,
  title text,
  sections text[],
  placement text,
  tone text check (tone in ('plain', 'paper', 'navy')),
  layout text check (layout in ('lead-list', 'four-up')),
  dayparts text[],
  sort_order int not null,
  daypart_order jsonb,                -- {"morning": 20, "night": 15}
  pinned_article_ids uuid[] not null default '{}',
  active boolean not null default true
);

create table advertisements (
  id uuid primary key default gen_random_uuid(),
  placement text not null,
  advertiser text not null,
  campaign text,
  kind text not null default 'direct' check (kind in ('direct', 'government', 'local')),
  image jsonb not null,
  mobile_image jsonb,
  href text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  weight int not null default 1
);

create table social_links (
  id text primary key,
  label text not null,
  href text not null,
  sort_order int not null default 100
);

-- ---------------------------------------------------------------------------
-- Reader news tips (private)
-- ---------------------------------------------------------------------------
create table news_tips (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  location text not null,
  category text,
  description text not null check (char_length(description) between 20 and 5000),
  media_paths text[] not null default '{}',   -- private `tips` bucket
  status text not null default 'new' check (status in ('new', 'reviewing', 'assigned', 'closed')),
  created_at timestamptz not null default now(),
  ip_hash text
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table newsroom_members enable row level security;
alter table sections enable row level security;
alter table localities enable row level security;
alter table authors enable row level security;
alter table media enable row level security;
alter table articles enable row level security;
alter table tags enable row level security;
alter table article_tags enable row level security;
alter table article_views enable row level security;
alter table breaking_news enable row level security;
alter table videos enable row level security;
alter table homepage_sections enable row level security;
alter table advertisements enable row level security;
alter table social_links enable row level security;
alter table news_tips enable row level security;

-- Public reads
create policy "public read sections" on sections for select using (true);
create policy "public read localities" on localities for select using (true);
create policy "public read authors" on authors for select using (true);
create policy "public read media" on media for select using (true);
create policy "public read tags" on tags for select using (true);
create policy "public read article_tags" on article_tags for select using (true);
create policy "public read social" on social_links for select using (true);
create policy "public read published articles" on articles for select
  using (status = 'published' and published_at <= now());
create policy "public read published videos" on videos for select
  using (status = 'published' and published_at <= now());
create policy "public read active breaking" on breaking_news for select
  using (active and (expires_at is null or expires_at > now()));
create policy "public read homepage" on homepage_sections for select using (active);
create policy "public read live ads" on advertisements for select
  using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));

-- Anonymous page-view logging (insert only; nobody can read raw rows publicly)
create policy "anyone logs a view" on article_views for insert with check (true);

-- Newsroom access
create policy "members read self" on newsroom_members for select using (user_id = auth.uid() or has_role('{admin}'));
create policy "admins manage members" on newsroom_members for all using (has_role('{admin}')) with check (has_role('{admin}'));

create policy "staff read all articles" on articles for select using (has_role('{admin,editor,reporter}'));
create policy "reporters create drafts" on articles for insert
  with check (has_role('{admin,editor,reporter}') and (status in ('draft', 'pending_review') or has_role('{admin,editor}')));
create policy "reporters edit own drafts" on articles for update
  using (created_by = auth.uid() and status in ('draft', 'pending_review'))
  with check (status in ('draft', 'pending_review'));
create policy "editors manage articles" on articles for all using (has_role('{admin,editor}')) with check (has_role('{admin,editor}'));

create policy "editors manage breaking" on breaking_news for all using (has_role('{admin,editor}')) with check (has_role('{admin,editor}'));
create policy "editors manage videos" on videos for all using (has_role('{admin,editor}')) with check (has_role('{admin,editor}'));
create policy "editors manage homepage" on homepage_sections for all using (has_role('{admin,editor}')) with check (has_role('{admin,editor}'));
create policy "editors manage taxonomy" on sections for all using (has_role('{admin}')) with check (has_role('{admin}'));
create policy "editors manage localities" on localities for all using (has_role('{admin}')) with check (has_role('{admin}'));
create policy "editors manage authors" on authors for all using (has_role('{admin,editor}')) with check (has_role('{admin,editor}'));
create policy "staff manage media" on media for all using (has_role('{admin,editor,reporter}')) with check (has_role('{admin,editor,reporter}'));
create policy "staff manage tags" on tags for all using (has_role('{admin,editor,reporter}')) with check (has_role('{admin,editor,reporter}'));
create policy "staff manage article_tags" on article_tags for all using (has_role('{admin,editor,reporter}')) with check (has_role('{admin,editor,reporter}'));
create policy "ad managers manage ads" on advertisements for all using (has_role('{admin,ad_manager}')) with check (has_role('{admin,ad_manager}'));
create policy "admins manage social" on social_links for all using (has_role('{admin}')) with check (has_role('{admin}'));
create policy "editors read tips" on news_tips for select using (has_role('{admin,editor}'));
create policy "editors update tips" on news_tips for update using (has_role('{admin,editor}'));
create policy "editors read views" on article_views for select using (has_role('{admin,editor}'));

-- Realtime for the breaking-news bar
alter publication supabase_realtime add table breaking_news;

-- ---------------------------------------------------------------------------
-- Storage buckets
--   media — public, newsroom photography
--   tips  — PRIVATE, reader uploads; only reachable through signed URLs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tips', 'tips', false, 52428800, array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime'])
on conflict do nothing;

create policy "staff upload media" on storage.objects for insert
  with check (bucket_id = 'media' and has_role('{admin,editor,reporter}'));
create policy "editors read tips files" on storage.objects for select
  using (bucket_id = 'tips' and has_role('{admin,editor}'));
