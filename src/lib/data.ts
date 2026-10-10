// src/lib/data.ts
import { supabase } from './supabase';
import type { Post } from './supabase';
import type { BlogPost } from '@/app/types/blogpost';
import { getServiceRoleClient } from './auth-config';

export type PrimaryAuthorProfile = {
  id?: string | number | null;
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website_url?: string | null;
  email?: string | null;
};

const PUBLISHED_FILTER = 'published.eq.true,published.is.null';

type QueryBuilder<T> = (filterPublished: boolean) => any;

async function runPostsQuery<T>(build: QueryBuilder<T>) {
  let { data, error } = await build(true);
  if (error && (error.code === '42703' || error.message?.includes('published'))) {
    ({ data, error } = await build(false));
  }
  return { data, error };
}

export async function getPrimaryAuthorProfile(targetEmail?: string): Promise<PrimaryAuthorProfile | null> {
  try {
    if (targetEmail) {
      try {
        const serviceRoleClient = getServiceRoleClient();
        const { data, error } = await serviceRoleClient
          .from('authors')
          .select('id, name, bio, avatar_url, website_url, email')
          .ilike('email', targetEmail)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error fetching author profile by email:', error);
        }

        if (data) {
          return data as PrimaryAuthorProfile;
        }
      } catch (serviceError) {
        console.error('❌ Service-role profile fetch failed, falling back to public view:', serviceError);
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
      console.error('❌ Error fetching primary author profile:', error);
      return null;
    }

    if (data) {
      return data as PrimaryAuthorProfile;
    }

    return null;
  } catch (e) {
    console.error('💥 Unexpected error loading primary author profile:', e);
    return null;
  }
}

/**
 * Fetch all blog posts with enhanced logging
 */
export async function getAllPosts(): Promise<Post[]> {
  console.log("🔍 Getting all posts from Supabase");
  
  try {
    // Test connection first
    const { data: countData, error: connectionError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Supabase connection error:', connectionError);
      return [];
    }
    
    // Access the count safely
    const postCount = typeof countData === 'object' && countData !== null ? 
                     (countData as any).count || 0 : 0;
    
    console.log(`✅ Supabase connection successful! Found approximately ${postCount} total posts`);
    
    const publishedFilter = 'published.eq.true,published.is.null';

    // Check what posts we have
    const { data: allPosts, error: allPostsError } = await runPostsQuery((filter) => {
      let query = supabase
        .from('posts')
        .select('id, title, slug')
        .order('position', { ascending: false })
        .order('date', { ascending: false });
      if (filter) {
        query = query.or(PUBLISHED_FILTER);
      }
      return query;
    });
    
    if (allPostsError) {
      console.error('⚠️ Error fetching all posts:', allPostsError);
    } else {
      console.log(`📊 Database contains ${allPosts.length} total posts:`);
      console.log(allPosts.map(p => ({ 
        title: p.title, 
        slug: p.slug 
      })));
    }
    
    // Get all posts (our main query)
    const { data, error } = await runPostsQuery((filter) => {
      let query = supabase
        .from('posts')
        .select('*')
        .order('position', { ascending: false });
      if (filter) {
        query = query.or(PUBLISHED_FILTER);
      }
      return query;
    });
  
  // If no position or as fallback, still keep the date order
  if (data?.length && data.some(post => post.position === null || post.position === undefined)) {
    console.log('⚠️ Some posts missing position values, also using date for ordering');
    data.sort((a, b) => {
      // First by position (if available)
      if (a.position !== null && b.position !== null) {
        return b.position - a.position; // This sorts in descending order
      }
      // Fall back to date for posts without position
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
    
    return data as Post[];
  } catch (e) {
    console.error('💥 Unexpected error in getAllPosts:', e);
    return [];
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function loadBlogPostsServer(): Promise<BlogPost[]> {
  console.log("📚 Loading blog posts via legacy function");
  
  const posts = await getAllPosts();
  
  // Convert Post[] to BlogPost[]
  return posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || '',
    date: post.date,
    categories: post.categories || [],
    featured: post.featured || false,
    author: post.author || 'Anonymous',
    author_handle: post.author_handle, // Add this line
    featuredImage: post.featuredImage || '',
    comment: post.comment !== undefined ? post.comment : true,
    socmed: post.socmed !== undefined ? post.socmed : true,
    published: post.published ?? false,
    position: post.position ?? null,
    post_type: post.post_type ?? 'article',
    source_url: post.source_url ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at
  }));
}

/**
 * Fetch a specific post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  console.log(`🔍 Getting post with slug: "${slug}" from Supabase`);
  
  try {
    // First check if the post exists
    const publishedFilter = 'published.eq.true,published.is.null';

    const { data: existCheck, error: existError } = await runPostsQuery((filter) => {
      let query = supabase
        .from('posts')
        .select('id, title, slug')
        .eq('slug', slug);
      if (filter) {
        query = query.or(PUBLISHED_FILTER);
      }
      return query.maybeSingle();
    });
    
    if (existError) {
      console.error(`❌ Error checking if post "${slug}" exists:`, existError);
    } else if (existCheck) {
      console.log(`📄 Post "${slug}" exists with title: "${existCheck.title}"`);
    } else {
      console.log(`❓ Post with slug "${slug}" not found in database`);
    }
    
    // Now get the full post data
    const { data, error } = await runPostsQuery((filter) => {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('slug', slug);
      if (filter) {
        query = query.or(PUBLISHED_FILTER);
      }
      return query.maybeSingle();
    });
    
    if (error) {
      console.error(`❌ Error loading post "${slug}":`, error);
      return null;
    }
    
    if (!data) {
      console.log(`❌ No post found with slug "${slug}"`);
      return null;
    }
    
    console.log(`✅ Successfully loaded post: ${data.title}`);
    return data as Post;
  } catch (e) {
    console.error(`💥 Unexpected error getting post "${slug}":`, e);
    return null;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
  console.log(`📚 Looking for post "${slug}" via legacy function`);
  
  const post = await getPostBySlug(slug);
  
  if (!post) return null;
  
  // Convert Post to BlogPost
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || '',
    date: post.date,
    categories: post.categories || [],
    featured: post.featured || false,
    author: post.author || 'Anonymous',
    author_handle: post.author_handle, // Add this line
    featuredImage: post.featuredImage || '',
    comment: post.comment !== undefined ? post.comment : true,
    socmed: post.socmed !== undefined ? post.socmed : true,
    published: post.published ?? false,
    position: post.position ?? null,
    post_type: post.post_type ?? 'article',
    source_url: post.source_url ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at
  };
}

/**
 * Fetch featured posts
 */
export async function getFeaturedPosts(): Promise<Post[]> {
  console.log("🌟 Getting featured posts from Supabase");
  const publishedFilter = 'published.eq.true,published.is.null';
  const { data, error } = await runPostsQuery((filter) => {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('featured', true)
      .order('position', { ascending: false })
      .order('date', { ascending: false });
    if (filter) {
      query = query.or(PUBLISHED_FILTER);
    }
    return query;
  });
  
  if (error) {
    console.error('❌ Error loading featured posts:', error);
    return [];
  }
  
  console.log(`✅ Loaded ${data.length} featured posts`);
  return data as Post[];
}

/**
 * Fetch site preferences
 */
export async function getPreferences(): Promise<{ fontStyle: string, [key: string]: any }> {
  console.log("⚙️ Getting site preferences from Supabase");
  try {
    const { data, error } = await supabase
      .from('preferences')
      .select('value')
      .eq('key', 'site')
      .single();
    
    if (error) {
      console.error('❌ Error loading preferences:', error);
      return { fontStyle: 'serif' }; // Default preference
    }
    
    console.log('✅ Loaded site preferences');
    return data.value;
  } catch (e) {
    console.error('💥 Unexpected error getting preferences:', e);
    return { fontStyle: 'serif' };
  }
}
