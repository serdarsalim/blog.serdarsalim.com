import Link from "next/link";
import SignInButton from "./SignInButton";
import { SITE } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50 text-sm text-gray-600 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-400">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          © {year} {SITE.fullName}. Written by a human.
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer">
          <a href={SITE.website} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white">
            serdarsalim.com
          </a>
          <a href="/feed.xml" className="hover:text-gray-900 dark:hover:text-white">
            RSS
          </a>
          <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
            Privacy
          </Link>
          <SignInButton />
        </nav>
      </div>
    </footer>
  );
}
