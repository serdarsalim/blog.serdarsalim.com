"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import type { FeedItem } from "@/app/types/feed";
import PostCard from "./PostCard";

const ALL = "all";
const CATEGORY_STORAGE_KEY = "blogCategoryFilter";

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function HomeFeed({ items }: { items: FeedItem[] }) {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of items) {
      for (const raw of item.categories) {
        const key = raw.toLowerCase().trim();
        if (!key) continue;
        const entry = counts.get(key) || { label: titleCase(key), count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      }
    }
    return [...counts.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [items]);

  // Restore the last chip and honour ?search= after hydration, so the server HTML is deterministic.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_STORAGE_KEY)?.toLowerCase().trim();
      if (saved && categories.some((c) => c.key === saved)) setCategory(saved);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("search")?.trim();
    if (fromUrl) {
      setQuery(fromUrl);
      setSearchOpen(true);
    }
    const wantedCategory = params.get("category")?.toLowerCase().trim();
    if (wantedCategory && categories.some((c) => c.key === wantedCategory)) setCategory(wantedCategory);
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, category);
    } catch {}
  }, [category]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "title", weight: 2 },
          { name: "excerpt", weight: 1 },
          { name: "categories", weight: 1.2 },
          { name: "sourceHost", weight: 0.8 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim();
    if (q) return fuse.search(q).map((r) => r.item);
    const filtered =
      category === ALL
        ? items
        : items.filter((item) => item.categories.some((c) => c.toLowerCase().trim() === category));
    return [...filtered.filter((i) => i.featured), ...filtered.filter((i) => !i.featured)];
  }, [items, fuse, query, category]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[13px] transition ${
      active
        ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
        : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:border-orange-900 dark:hover:text-white"
    }`;

  return (
    <section className="mx-auto max-w-3xl px-4 pb-8 pt-8 sm:px-6" id="posts">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCategory(ALL)} className={chip(category === ALL && !query)}>
          All <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{items.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setCategory(c.key);
              setQuery("");
            }}
            className={chip(category === c.key && !query)}
          >
            {c.label}
          </button>
        ))}

        <div className="ml-auto flex items-center">
          {searchOpen ? (
            <div className="relative">
              <svg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => {
                  if (!query.trim()) setSearchOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                  }
                }}
                placeholder="Search posts"
                aria-label="Search posts"
                className="h-8 w-44 rounded-full border border-gray-200 bg-white pl-8 pr-3 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-orange-200 hover:text-gray-900 dark:border-slate-700 dark:text-gray-400 dark:hover:text-white"
              aria-label="Search posts"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {query.trim() && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {visible.length} result{visible.length === 1 ? "" : "s"} for “{query.trim()}”.{" "}
          <button type="button" onClick={() => setQuery("")} className="font-medium text-orange-700 hover:underline dark:text-orange-300">
            Clear
          </button>
        </p>
      )}

      <div className="mt-5 space-y-3">
        {visible.length === 0 ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">Nothing here yet. Try another category or search.</p>
        ) : (
          visible.map((item, index) => (
            <PostCard key={item.slug} item={item} index={index} showCategory={category === ALL || !!query.trim()} />
          ))
        )}
      </div>
    </section>
  );
}
