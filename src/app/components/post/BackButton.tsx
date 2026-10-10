"use client";

import { useRouter } from "next/navigation";

// Goes back when the reader came from inside the site; otherwise to the home page.
export default function BackButton() {
  const router = useRouter();

  const goBack = () => {
    const cameFromSite = typeof document !== "undefined" && document.referrer.startsWith(window.location.origin);
    if (cameFromSite && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-orange-500 sm:left-6"
      aria-label="Back to all posts"
    >
      <span aria-hidden="true">←</span>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}
