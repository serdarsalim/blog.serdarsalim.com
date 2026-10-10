import { ImageResponse } from 'next/og';
import { OG_SIZE, OgCard, ogFonts } from '@/lib/og';
import { SITE } from '@/lib/site';

export const alt = SITE.title;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <OgCard eyebrow="blog.serdarsalim.com" title="Essays and notes on automation, building products, faith and family." footer={SITE.fullName} />,
    { ...OG_SIZE, fonts: await ogFonts() }
  );
}
