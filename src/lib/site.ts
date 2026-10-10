// src/lib/site.ts
// One place for the facts every page repeats.
export const SITE = {
  url: 'https://blog.serdarsalim.com',
  name: 'Serdar Salim',
  fullName: 'Serdar Salim Domurcuk',
  title: 'Serdar Salim – Essays and notes',
  description:
    'Essays, field notes and curated links from Serdar Salim: automation engineering, building products that scale, faith, family and leading people.',
  website: 'https://serdarsalim.com',
  locale: 'en_US',
  twitterCard: 'summary_large_image' as const,
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export function postUrl(slug: string): string {
  return `${SITE.url}/posts/${slug}`;
}

export function hostOf(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function formatDate(date: string | Date, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', ...opts });
}

export function stripHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&(l|r)dquo;|&#822[01];/g, '"')
    .replace(/&(l|r)squo;|&#821[67];/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function summarize(text: string, max = 180): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${cut.slice(0, at > max * 0.6 ? at : max).trim()}…`;
}

export function readingMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
