// src/app/page.tsx
import { Suspense } from "react";
import { getAllPosts, getPrimaryAuthorProfile } from "@/lib/data";
import BlogClientContent from "@/app/components/BlogClientContent";

// ISR: a publish revalidates this page explicitly; this is the safety net.
export const revalidate = 60;

export default async function HomePage() {
  const primaryEmail = process.env.PRIMARY_AUTHOR_EMAIL || "serdar.dom@gmail.com";
  const [posts, authorProfile] = await Promise.all([
    getAllPosts(),
    getPrimaryAuthorProfile(primaryEmail),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden">
      {/* BlogClientContent reads useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={null}>
        <BlogClientContent
          initialPosts={posts}
          authorProfile={authorProfile || undefined}
        />
      </Suspense>
    </div>
  );
}
