import Link from "next/link";
import type { FeedItem } from "@/app/types/feed";
import { formatDate } from "@/lib/site";

const FALLBACK_THUMB = "/header.jpeg";

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PostCard({ item, index, showCategory }: { item: FeedItem; index: number; showCategory: boolean }) {
  const isLink = item.post_type === "link" && !!item.source_url;
  const href = `/posts/${item.slug}`;
  const category = item.categories[0];
  const thumb = item.featuredImage || FALLBACK_THUMB;

  return (
    <article
      className="rise group relative flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-900/50 sm:gap-5 sm:p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="min-w-0 flex-1">
        {isLink && (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-300">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
            {item.sourceHost}
          </p>
        )}

        <h2 className="text-[17px] font-semibold leading-snug text-gray-900 transition group-hover:text-orange-700 dark:text-gray-100 dark:group-hover:text-orange-300 sm:text-lg">
          {isLink ? (
            <a href={item.source_url!} target="_blank" rel="noopener noreferrer" className="relative z-10">
              {item.title}
            </a>
          ) : (
            <Link href={href} prefetch={index < 3} className="after:absolute after:inset-0 after:content-['']">
              {item.title}
            </Link>
          )}
        </h2>

        {item.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-gray-600 dark:text-gray-400 sm:line-clamp-3 sm:text-[15px]">
            {item.excerpt}
          </p>
        )}

        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-500">
          <time dateTime={item.date}>{formatDate(item.date, { month: "short" })}</time>
          {!isLink && (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.readingMinutes} min read</span>
            </>
          )}
          {showCategory && category && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-orange-700/90 dark:text-orange-300/90">{titleCase(category)}</span>
            </>
          )}
          {isLink && (
            <>
              <span aria-hidden="true">·</span>
              <Link href={href} className="relative z-10 font-medium text-gray-700 hover:text-orange-700 dark:text-gray-300 dark:hover:text-orange-300">
                My take →
              </Link>
            </>
          )}
        </p>
      </div>

      {!isLink && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800 sm:h-28 sm:w-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
    </article>
  );
}
