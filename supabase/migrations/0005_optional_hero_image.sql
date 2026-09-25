-- Stories without a photo render a branded placeholder. hero_image stays a
-- MediaImage JSON object when present: {src, alt, width, height, caption,
-- credit, kind: event|representative|file|illustration|ai-illustration,
-- source: {name, url, title, author, licence, licenceUrl, attributionRequired}, focal}.
alter table public.articles alter column hero_image drop not null;
alter table public.articles add constraint articles_hero_image_kind_check
  check (hero_image is null or hero_image->>'kind' is null
         or hero_image->>'kind' in ('event', 'representative', 'file', 'illustration', 'ai-illustration'));
