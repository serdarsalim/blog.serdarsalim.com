"use client";

import { useEffect, useState } from "react";

type Props = { title: string; url: string };

const btn =
  "inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-orange-300 hover:text-orange-700 dark:border-slate-700 dark:text-gray-300 dark:hover:border-orange-800 dark:hover:text-orange-300";

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=560");
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">Share</span>
      <button type="button" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)} className={btn}>
        LinkedIn
      </button>
      <button type="button" onClick={() => open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)} className={btn}>
        X
      </button>
      <button type="button" onClick={() => open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`)} className={btn}>
        WhatsApp
      </button>
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? "Copied" : "Copy link"}
      </button>
      {canShare && (
        <button type="button" onClick={() => navigator.share({ title, url }).catch(() => {})} className={btn}>
          More…
        </button>
      )}
    </div>
  );
}
