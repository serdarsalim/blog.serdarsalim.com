// src/app/api/publish/route.ts
// Mana Publisher → blog. Bearer MANA_PUBLISH_TOKEN. Contract in docs/publish-api.md.
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedPublisher, unauthorized } from '@/lib/publish-auth';
import { PublishError, SITE_URL, hasLinkColumns, upsertPost, validatePublishInput } from '@/lib/publish';
import { getServiceRoleClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!isAuthorizedPublisher(request)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body must be valid JSON' }, { status: 400 });
  }

  try {
    const input = validatePublishInput(body);
    const result = await upsertPost(input);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof PublishError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('publish failed:', error);
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 });
  }
}

// Inventory for the Publisher: what is on the blog, published or not.
export async function GET(request: NextRequest) {
  if (!isAuthorizedPublisher(request)) return unauthorized();

  const limitParam = parseInt(request.nextUrl.searchParams.get('limit') ?? '50', 10);
  const limit = Math.min(Math.max(Number.isNaN(limitParam) ? 50 : limitParam, 1), 200);
  const linkColumns = await hasLinkColumns();
  const fields = `id, slug, title, excerpt, date, categories, featuredImage, published, featured, updated_at${
    linkColumns ? ', post_type, source_url' : ''
  }`;

  const { data, error } = await getServiceRoleClient()
    .from('posts')
    .select(fields)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = ((data ?? []) as unknown as Record<string, unknown>[]).map((post) => ({
    ...post,
    url: `${SITE_URL}/posts/${post.slug}`,
  }));
  return NextResponse.json({ posts, migration_applied: linkColumns });
}
