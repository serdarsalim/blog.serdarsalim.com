"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import type { BlogPost } from "@/app/types/blogpost";

// The editor is heavy (TinyMCE); only admins ever load it.
const AdminPostManager = dynamic(() => import("@/app/components/AdminPostManager"), { ssr: false });

export default function AdminEditButton({ post }: { post: BlogPost }) {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;
    let cancelled = false;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setIsAdmin(data?.profile?.role === "admin");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  if (!isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-gray-300 px-2.5 py-0.5 text-xs text-gray-600 transition hover:border-orange-400 hover:text-orange-700 dark:border-slate-700 dark:text-gray-300"
      >
        Edit
      </button>
      {open && <AdminPostManager initialPosts={[post]} initialSlug={post.slug} autoOpenEditor hideManagerUI />}
    </>
  );
}
