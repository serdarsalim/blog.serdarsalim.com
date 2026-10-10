# blog.serdarsalim.com

Serdar Salim's blog: long-form posts and curated links, published from Mana's Publisher. Next.js 14 (App Router), Tailwind, Supabase, deployed on Vercel from `main` (a push deploys).

## Run

```bash
npm install
npm run dev
```

Env vars (`.env.local`, same names on Vercel):

| Var | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public reads |
| `SUPABASE_SERVICE_ROLE_KEY` | admin and publish writes (legacy `SUPABASE_SERVICE_KEY` still read) |
| `MANA_PUBLISH_TOKEN` | bearer token for `/api/publish` (see `docs/publish-api.md`) |
| `REVALIDATION_SECRET` | `/api/revalidate` |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | admin sign-in |
| `PRIMARY_AUTHOR_EMAIL` | which `authors` row is shown on the home page (defaults to Serdar's) |

## Database

Posts live in the Supabase table `posts` (body as HTML). Migrations in `supabase/migrations/` are applied by hand in the Supabase SQL editor; `20261010120000_post_type.sql` adds link posts and the unique slug index.

## Publishing

`POST /api/publish` with the bearer token upserts a post and revalidates the pages. Contract and curl examples: `docs/publish-api.md`. The admin editor at `/posts/<slug>` (Edit, after Google sign-in) still works for touch-ups.

## What the site serves

- `/` home: profile, category chips, search, the stream of posts and links (server-rendered).
- `/posts/<slug>`: article with reading time, table of contents, share row, related posts, comments; link posts add a "Read the original" card.
- `/feed.xml` RSS, `/sitemap.xml`, `/robots.txt`, generated OG images at `/opengraph-image` and `/posts/<slug>/opengraph-image`.
- `/api/latest-posts` public JSON for serdarsalim.com.

---

Copyright © 2025 Serdar Domurcuk. All rights reserved.
