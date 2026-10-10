import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="w-full">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-gray-900 transition hover:text-orange-700 dark:text-gray-100 dark:hover:text-orange-300"
        >
          {SITE.name}
        </Link>
        <nav className="flex items-center gap-1" aria-label="Site">
          <a
            href={SITE.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white sm:inline-flex"
          >
            serdarsalim.com
          </a>
          <a
            href="/feed.xml"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-orange-300"
            aria-label="RSS feed"
            title="RSS feed"
          >
            <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 4a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4zm0 6a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7v-3zm2 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
            </svg>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
