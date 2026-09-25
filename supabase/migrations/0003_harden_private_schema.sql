-- Security hardening (Supabase advisor: security definer view, RPC-callable definer function).

-- Private schema: not exposed through the REST API.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- Role check used by RLS policies. Policies reference the function by OID,
-- so moving it keeps every policy working while removing /rpc/has_role.
alter function public.has_role(newsroom_role[]) set schema private;

-- Replace the security-definer trending view with a private function that
-- returns only a rank (never counts).
drop view if exists public.most_read;
drop view if exists public.article_trends;

create or replace function private.article_trends()
returns table (article_id uuid, trend_rank bigint)
language sql stable security definer set search_path = public as $$
  select v.article_id,
         row_number() over (
           order by count(*) filter (where v.viewed_at > now() - interval '6 hours') * 3 + count(*) desc
         ) as trend_rank
  from public.article_views v
  where v.viewed_at > now() - interval '48 hours'
  group by v.article_id;
$$;
revoke all on function private.article_trends() from public;
grant execute on function private.article_trends() to anon, authenticated;

create view public.most_read with (security_invoker = true) as
  select pa.*, t.trend_rank
  from public.published_articles pa
  join private.article_trends() t on t.article_id = pa.id
  order by t.trend_rank;
