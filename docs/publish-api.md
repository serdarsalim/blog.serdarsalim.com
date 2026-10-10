# Publish API (for Mana's Publisher)

Base URL: `https://blog.serdarsalim.com`. Every route needs `Authorization: Bearer <MANA_PUBLISH_TOKEN>`. The token is an env var on Vercel; the same value goes in Publisher settings. An unset token closes the API (401 with a message saying so).

Posts are stored as HTML. Publisher converts markdown to HTML before calling.

## POST /api/publish

Create or update a post. Upsert key is `slug`; omit it and the title is slugified. Re-publishing the same slug updates in place (same URL).

```json
{
  "slug": "optional-explicit-slug",
  "title": "Required",
  "html": "<p>Required for articles. Serdar's take for link posts.</p>",
  "excerpt": "Optional. Derived from html on first publish if missing.",
  "categories": ["Automation", "Personal growth"],
  "featuredImage": "https://.../cover.webp",
  "post_type": "article",
  "source_url": "https://... (required when post_type is link)",
  "published": true,
  "featured": false,
  "date": "2026-10-10T08:00:00Z"
}
```

- `published` defaults to true. Send false to stage a draft on the blog.
- `date` is only needed to backdate; on update it is unchanged unless sent.
- Fields left out of an update keep their stored value (`categories`, `featuredImage`, `excerpt`, `featured`).
- Responses: `201` created, `200` updated, `400` validation (`{error}`), `401` token, `503` link post before the migration.

```json
{ "id": "uuid", "slug": "the-slug", "url": "https://blog.serdarsalim.com/posts/the-slug", "published": true, "post_type": "article", "created": true }
```

The route revalidates `/`, `/posts/<slug>`, `/sitemap.xml` and `/feed.xml`, so the post is live when the response returns. `/api/latest-posts` (what serdarsalim.com reads) refreshes within 60 seconds.

## GET /api/publish?limit=50

Inventory: `{ posts: [{id, slug, title, excerpt, date, categories, featuredImage, published, featured, updated_at, post_type, source_url, url}], migration_applied: bool }`.

## GET /api/publish/:slug

Full row including `content` (HTML), plus `url`. 404 if unknown.

## DELETE /api/publish/:slug

Unpublishes (row stays, `published=false`). `?permanent=1` deletes the row. Both revalidate.

## POST /api/publish/image

Two ways in:

- Raw bytes: `Content-Type: image/webp` (jpeg, png, webp, gif, avif, svg), body is the file, optional `X-Filename: cover.webp` or `?name=cover.webp`.
- Multipart: field `file`.

Max 10MB. Stored at Supabase Storage `images/slm/<timestamp>-<name>`. Response `201 { url, path, bytes }`. Put `url` in `featuredImage` or in an `<img>` inside `html`.

## Link posts

`post_type: "link"` + `source_url`. The blog renders Serdar's take (`html`) and a "Read the original" card with the source's domain. The migration `supabase/migrations/20261010120000_post_type.sql` must have run once (Supabase SQL editor); until then link posts return 503 and articles work as before.

## curl smoke test

```bash
curl -s -X POST https://blog.serdarsalim.com/api/publish \
  -H "Authorization: Bearer $MANA_PUBLISH_TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Test from Mana","html":"<p>Hello</p>","published":false}'
```

Then `DELETE /api/publish/test-from-mana?permanent=1`.
