-- Performance (Supabase advisor): cover foreign keys, evaluate auth.uid() once per query.

create index if not exists article_tags_tag_id_idx on public.article_tags (tag_id);
create index if not exists article_views_article_id_idx on public.article_views (article_id);
create index if not exists articles_author_id_idx on public.articles (author_id);
create index if not exists articles_created_by_idx on public.articles (created_by);
create index if not exists authors_member_id_idx on public.authors (member_id);
create index if not exists media_created_by_idx on public.media (created_by);
create index if not exists videos_section_slug_idx on public.videos (section_slug);

drop policy "members read self" on public.newsroom_members;
create policy "members read self" on public.newsroom_members for select
  using (user_id = (select auth.uid()) or private.has_role('{admin}'));

drop policy "reporters edit own drafts" on public.articles;
create policy "reporters edit own drafts" on public.articles for update
  using (created_by = (select auth.uid()) and status in ('draft', 'pending_review'))
  with check (status in ('draft', 'pending_review'));
