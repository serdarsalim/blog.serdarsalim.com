import { ImageResponse } from 'next/og';
import { getPostBySlugServer } from '@/lib/data';
import { OG_SIZE, OgCard, ogFonts } from '@/lib/og';
import { SITE, formatDate, hostOf } from '@/lib/site';

export const revalidate = 3600;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlugServer(params.slug);
  const fonts = await ogFonts();

  if (!post) {
    return new ImageResponse(<OgCard title="Post not found" />, { ...OG_SIZE, fonts });
  }

  const eyebrow =
    post.post_type === 'link' && post.source_url
      ? `Link · ${hostOf(post.source_url)}`
      : post.categories[0] || SITE.name;
  const footer = `${SITE.fullName} · ${formatDate(post.date, { month: 'short' })}`;

  return new ImageResponse(<OgCard title={post.title} eyebrow={eyebrow} footer={footer} />, {
    ...OG_SIZE,
    fonts,
  });
}
