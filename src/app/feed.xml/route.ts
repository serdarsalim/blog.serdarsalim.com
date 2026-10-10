// src/app/feed.xml/route.ts
// RSS 2.0 with full content. Readers, newsletters-from-RSS and aggregators all speak this.
import { loadBlogPostsServer } from '@/lib/data';
import { SITE, postUrl, stripHtml, summarize } from '@/lib/site';

export const revalidate = 600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export async function GET() {
  const posts = (await loadBlogPostsServer()).slice(0, 30);
  const lastBuild = posts[0]?.updated_at || posts[0]?.date || new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = postUrl(post.slug);
      const description = post.excerpt || summarize(stripHtml(post.content), 220);
      const body =
        post.post_type === 'link' && post.source_url
          ? `${post.content}<p><a href="${escapeXml(post.source_url)}">Read the original</a></p>`
          : post.content;
      const categories = post.categories.map((c) => `      <category>${escapeXml(c)}</category>`).join('\n');
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${post.post_type === 'link' && post.source_url ? escapeXml(post.source_url) : url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.author || SITE.name)}</dc:creator>
      <description>${escapeXml(description)}</description>
      <content:encoded>${cdata(body)}</content:encoded>
${categories}${post.featuredImage ? `\n      <enclosure url="${escapeXml(post.featuredImage)}" type="image/jpeg" length="0" />` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE.url}/icon.png</url>
      <title>${escapeXml(SITE.name)}</title>
      <link>${SITE.url}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
