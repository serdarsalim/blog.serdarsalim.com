// src/lib/data.ts
// Read side of the blog. Public (anon) client; only published rows come back.
import { supabase } from './supabase';
import type { Post } from './supabase';
import type { BlogPost } from '@/app/types/blogpost';
import { getServiceRoleClient } from './supabase-admin';
import { getCategoryArray } from '@/app/utils/categoryHelpers';

export type PrimaryAuthorProfile = {
  id?: string | number | null;
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website_url?: string | null;
  email?: string | null;
};

// Rows published before the column existed have published = null.
const PUBLISHED_FILTER = 'published.eq.true,published.is.null';

export async function getPrimaryAuthorProfile(targetEmail?: string): Promise<PrimaryAuthorProfile | null> {
  try {
    if (targetEmail) {
      try {
        const { data, error } = await getServiceRoleClient()
          .from('authors')
          .select('id, name, bio, avatar_url, website_url, email')
          .ilike('email', targetEmail)
          .maybeSingle();
        if (error && error.code !== 'PGRST116') console.error('author profile by email:', error);
        if (data) return data as PrimaryAuthorProfile;
      } catch (serviceError) {
        console.error('service-role profile fetch failed, falling back to public view:', serviceError);
      }
    }

    const { data, error } = await supabase
      .from('authors_public')
      .select('id, name, bio, avatar_url, website_url')
      .eq('listing_status', true)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('primary author profile:', error);
      return null;
    }
    return (data as PrimaryAuthorProfile) ?? null;
  } catch (e) {
    console.error('unexpected error loading primary author profile:', e);
    return null;
  }
}

function toBlogPost(post: Post): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || '',
    date: post.date,
    categories: getCategoryArray(post.categories as unknown as string | string[]),
    featured: post.featured || false,
    author: post.author || 'Serdar Salim',
    author_handle: post.author_handle,
    featuredImage: post.featuredImage || '',
    comment: post.comment !== undefined && post.comment !== null ? post.comment : true,
    socmed: post.socmed !== undefined && post.socmed !== null ? post.socmed : true,
    published: post.published ?? true,
    position: post.position ?? null,
    post_type: post.post_type === 'link' ? 'link' : 'article',
    source_url: post.source_url ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}

/** All published posts, newest first. */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(PUBLISHED_FILTER)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('getAllPosts:', error);
      return [];
    }
    return (data ?? []) as Post[];
  } catch (e) {
    console.error('unexpected error in getAllPosts:', e);
    return [];
  }
}

/** Same as getAllPosts, normalised for rendering (categories as an array, defaults filled). */
export async function loadBlogPostsServer(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.map(toBlogPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .or(PUBLISHED_FILTER)
      .maybeSingle();
    if (error) {
      console.error(`getPostBySlug(${slug}):`, error);
      return null;
    }
    return (data as Post) ?? null;
  } catch (e) {
    console.error(`unexpected error getting post "${slug}":`, e);
    return null;
  }
}

export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const post = await getPostBySlug(slug);
  return post ? toBlogPost(post) : null;
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.featured);
}

/**
 * Posts to read next: same category first, then the newest. Never the post itself.
 */
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const all = (await loadBlogPostsServer()).filter((p) => p.slug !== post.slug);
  const wanted = new Set(post.categories.map((c) => c.toLowerCase().trim()));
  const sameCategory = all.filter((p) => p.categories.some((c) => wanted.has(c.toLowerCase().trim())));
  const rest = all.filter((p) => !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getPreferences(): Promise<{ fontStyle: string; [key: string]: any }> {
  try {
    const { data, error } = await supabase.from('preferences').select('value').eq('key', 'site').single();
    if (error) return { fontStyle: 'sans-serif' };
    return data.value;
  } catch {
    return { fontStyle: 'sans-serif' };
  }
}
