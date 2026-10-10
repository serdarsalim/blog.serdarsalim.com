-- Link posts: Serdar's commentary on something he read, with a "Read the original" card.
-- Run once in the Supabase SQL editor (the service key cannot run DDL through PostgREST).
alter table public.posts
  add column if not exists post_type text not null default 'article',
  add column if not exists source_url text;

alter table public.posts
  drop constraint if exists posts_post_type_check;
alter table public.posts
  add constraint posts_post_type_check check (post_type in ('article', 'link'));

-- /api/publish upserts by slug; make that a real guarantee.
create unique index if not exists posts_slug_key on public.posts (slug);
