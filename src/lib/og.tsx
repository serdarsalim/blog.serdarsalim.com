// src/lib/og.tsx
// Shared pieces for the generated social images (next/og → satori → PNG).
import { SITE } from './site';

export const OG_SIZE = { width: 1200, height: 630 };

let interBold: ArrayBuffer | null | undefined;

/** Inter 700 from Google Fonts, cached per process. Falls back to satori's built-in font when offline. */
export async function loadInterBold(): Promise<ArrayBuffer | null> {
  if (interBold !== undefined) return interBold;
  try {
    const css = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    }).then((r) => r.text());
    const match = css.match(/src: url\(([^)]+\.(?:ttf|woff))\)/);
    if (!match) throw new Error('no ttf url in font css');
    interBold = await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch (error) {
    console.warn('OG font fetch failed, using fallback font:', error);
    interBold = null;
  }
  return interBold;
}

export async function ogFonts() {
  const data = await loadInterBold();
  return data ? [{ name: 'Inter', data, weight: 700 as const, style: 'normal' as const }] : [];
}

type CardProps = {
  title: string;
  eyebrow?: string;
  footer?: string;
};

/** 1200x630 card: dark slate, orange accent, big title. Reads well as a LinkedIn thumbnail. */
export function OgCard({ title, eyebrow, footer }: CardProps) {
  const size = title.length > 90 ? 48 : title.length > 60 ? 56 : 68;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, color: '#fdba74' }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: '#f97316' }} />
        <span>{eyebrow || SITE.name}</span>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#94a3b8' }}>
        <span>{footer || SITE.fullName}</span>
        <span>blog.serdarsalim.com</span>
      </div>
    </div>
  );
}
