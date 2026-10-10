// src/app/api/publish/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedPublisher, unauthorized } from '@/lib/publish-auth';
import { SITE_URL, revalidatePost } from '@/lib/publish';
import { getServiceRoleClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

type Params = { params: { slug: string } };

export async function GET(request: NextRequest, { params }: Params) {
  if (!isAuthorizedPublisher(request)) return unauthorized();

  const { data, error } = await getServiceRoleClient()
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ post: { ...data, url: `${SITE_URL}/posts/${data.slug}` } });
}

// Unpublish by default. ?permanent=1 deletes the row (for test posts).
export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthorizedPublisher(request)) return unauthorized();

  const client = getServiceRoleClient();
  const permanent = request.nextUrl.searchParams.get('permanent') === '1';

  const { data: existing } = await client.from('posts').select('id').eq('slug', params.slug).maybeSingle();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error } = permanent
    ? await client.from('posts').delete().eq('id', existing.id)
    : await client
        .from('posts')
        .update({ published: false, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePost(params.slug);
  return NextResponse.json({ slug: params.slug, published: false, deleted: permanent });
}
