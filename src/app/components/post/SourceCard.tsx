import { hostOf } from "@/lib/site";

export default function SourceCard({ url, title }: { url: string; title: string }) {
  const host = hostOf(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-10 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-orange-300 hover:bg-orange-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-900 dark:hover:bg-slate-900"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
        alt=""
        width={32}
        height={32}
        loading="lazy"
        className="h-8 w-8 shrink-0 rounded-md bg-white object-contain p-1 ring-1 ring-gray-200 dark:ring-slate-700"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Read the original on {host}
        </span>
        <span className="mt-0.5 block truncate text-[15px] font-semibold text-gray-900 group-hover:text-orange-700 dark:text-gray-100 dark:group-hover:text-orange-300">
          {title}
        </span>
      </span>
      <svg className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}
