type Item = { id: string; text: string; level: string };

export default function TableOfContents({ items }: { items: Item[] }) {
  if (items.length < 3) return null;

  return (
    <details className="group mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200 [&::-webkit-details-marker]:hidden">
        In this post
        <svg className="h-4 w-4 text-gray-400 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ol className="mt-3 space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === "3" ? "pl-4" : ""}>
            <a href={`#${item.id}`} className="text-gray-700 hover:text-orange-700 dark:text-gray-300 dark:hover:text-orange-300">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
