import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/data';
import { SITE, postUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => post?.slug)
    .map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.updated_at || post.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [
    {
      url: SITE.url,
      lastModified: posts[0] ? new Date(posts[0].updated_at || posts[0].date) : new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postEntries,
  ];
}
