// src/app/api/latest-posts/route.ts
// Public feed of the newest published posts, consumed by serdarsalim.com.
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseInt(searchParams.get('limit') ?? '3', 10);
  const limit = Math.min(Math.max(Number.isNaN(parsed) ? 3 : parsed, 1), 10);
  const includeContent = searchParams.get('include') === 'content';

  const fields = 'slug, title, excerpt, date, categories, featuredImage';
  const { data, error } = await supabase
    .from('posts')
    .select(includeContent ? `${fields}, content` : fields)
    .or('published.eq.true,published.is.null')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching latest posts:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }

  return NextResponse.json(
    { posts: data ?? [] },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
