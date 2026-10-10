import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">That page is not here.</h1>
      <p className="mt-3 max-w-prose text-gray-600 dark:text-gray-400">
        The link may be old, or the post was taken down. The latest writing is on the home page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500"
      >
        ← All posts
      </Link>
    </main>
  );
}
