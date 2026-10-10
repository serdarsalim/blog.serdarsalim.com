// What the home page ships to the browser per post: no body HTML, just what the card shows.
export type FeedItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categories: string[];
  featuredImage: string;
  featured: boolean;
  post_type: 'article' | 'link';
  source_url: string | null;
  sourceHost: string;
  readingMinutes: number;
};
