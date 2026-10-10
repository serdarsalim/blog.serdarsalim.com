// src/app/api/latest-posts/route.ts
// Public feed of the newest published posts, consumed by serdarsalim.com.
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BASE_FIELDS = 'slug, title, excerpt, date, categories, featuredImage';
const LINK_FIELDS = ', post_type, source_url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseInt(searchParams.get('limit') ?? '3', 10);
  const limit = Math.min(Math.max(Number.isNaN(parsed) ? 3 : parsed, 1), 10);
  const includeContent = searchParams.get('include') === 'content';

  const query = (fields: string) =>
    supabase
      .from('posts')
      .select(includeContent ? `${fields}, content` : fields)
      .or('published.eq.true,published.is.null')
      .order('date', { ascending: false })
      .limit(limit);

  let { data, error } = await query(BASE_FIELDS + LINK_FIELDS);
  if (error && error.code === '42703') {
    // post_type migration not applied yet
    ({ data, error } = await query(BASE_FIELDS));
  }

  if (error) {
    console.error('❌ Error fetching latest posts:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }

  const posts = ((data ?? []) as unknown as Record<string, unknown>[]).map((post) => ({
    post_type: 'article',
    source_url: null,
    ...post,
    url: `https://blog.serdarsalim.com/posts/${post.slug}`,
  }));

  return NextResponse.json(
    { posts },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
