// src/app/page.tsx
import { loadBlogPostsServer, getPrimaryAuthorProfile } from "@/lib/data";
import { SITE, hostOf, postUrl, readingMinutes, stripHtml, summarize } from "@/lib/site";
import type { FeedItem } from "@/app/types/feed";
import ProfileHeader from "@/app/components/home/ProfileHeader";
import HomeFeed from "@/app/components/home/HomeFeed";
import JsonLd from "@/app/components/JsonLd";

// ISR: a publish revalidates this page explicitly; this is the safety net.
export const revalidate = 60;

export default async function HomePage() {
  const primaryEmail = process.env.PRIMARY_AUTHOR_EMAIL || "serdar.dom@gmail.com";
  const [posts, authorProfile] = await Promise.all([
    loadBlogPostsServer(),
    getPrimaryAuthorProfile(primaryEmail),
  ]);

  const items: FeedItem[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.trim() || summarize(stripHtml(post.content), 200),
    date: post.date,
    categories: post.categories,
    featuredImage: post.featuredImage || "",
    featured: post.featured,
    post_type: post.post_type === "link" ? "link" : "article",
    source_url: post.source_url ?? null,
    sourceHost: hostOf(post.source_url),
    readingMinutes: readingMinutes(post.content),
  }));

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/#blog`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    author: { "@id": `${SITE.url}/#person` },
    blogPost: items.slice(0, 20).map((item) => ({
      "@type": "BlogPosting",
      headline: item.title,
      url: postUrl(item.slug),
      datePublished: item.date,
      description: item.excerpt,
      ...(item.featuredImage ? { image: item.featuredImage } : {}),
    })),
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={blogJsonLd} />
      <ProfileHeader profile={authorProfile} postCount={items.length} />
      <HomeFeed items={items} />
    </main>
  );
}
