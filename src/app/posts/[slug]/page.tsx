import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlugServer, getPrimaryAuthorProfile, getRelatedPosts } from "@/lib/data";
import { processContent, extractTableOfContents } from "@/lib/contentProcessor";
import { SITE, formatDate, hostOf, postUrl, readingMinutes, stripHtml, summarize } from "@/lib/site";
import JsonLd from "@/app/components/JsonLd";
import TableOfContents from "@/app/components/blog/TableOfContents";
import ShareButtons from "@/app/components/blog/ShareButtons";
import CommentSection from "@/app/components/blog/CommentSection";
import ArticleBody from "@/app/components/post/ArticleBody";
import SourceCard from "@/app/components/post/SourceCard";
import RelatedPosts from "@/app/components/post/RelatedPosts";
import AdminEditButton from "@/app/components/post/AdminEditButton";
import BackButton from "@/app/components/post/BackButton";

export const revalidate = 60;

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.filter((p) => p?.slug).map((post) => ({ slug: String(post.slug) }));
}

function describe(post: { excerpt?: string; content: string; title: string }): string {
  return post.excerpt?.trim() || summarize(stripHtml(post.content), 160) || post.title;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPostBySlugServer(params.slug);
  if (!post) {
    return { title: "Post not found", robots: { index: false } };
  }

  const url = postUrl(post.slug);
  const description = describe(post);

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: post.date,
      modifiedTime: post.updated_at || post.date,
      authors: [SITE.website],
      tags: post.categories,
    },
    twitter: {
      card: SITE.twitterCard,
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const post = await getPostBySlugServer(params.slug);
  if (!post) notFound();

  const primaryEmail = process.env.PRIMARY_AUTHOR_EMAIL || "serdar.dom@gmail.com";
  const [related, profile] = await Promise.all([getRelatedPosts(post, 3), getPrimaryAuthorProfile(primaryEmail)]);

  const light = processContent(post.content, false);
  const dark = processContent(post.content, true);
  const toc = extractTableOfContents(post.content);
  const minutes = readingMinutes(post.content);
  const isLink = post.post_type === "link" && !!post.source_url;
  const authorName = profile?.name?.trim() || SITE.name;
  const avatar = profile?.avatar_url?.trim();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl(post.slug)}#article`,
    mainEntityOfPage: postUrl(post.slug),
    headline: post.title,
    description: describe(post),
    datePublished: post.date,
    dateModified: post.updated_at || post.date,
    author: { "@type": "Person", "@id": `${SITE.url}/#person`, name: SITE.fullName, url: SITE.website },
    publisher: { "@id": `${SITE.url}/#person` },
    image: [`${SITE.url}/posts/${post.slug}/opengraph-image`, ...(post.featuredImage ? [post.featuredImage] : [])],
    keywords: post.categories.join(", "),
    wordCount: stripHtml(post.content).split(/\s+/).filter(Boolean).length,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE.url}/#blog` },
    ...(isLink ? { citation: post.source_url } : {}),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <JsonLd data={jsonLd} />

      <article className="mx-auto max-w-[42rem]">
        <header>
          {post.categories.length > 0 && (
            <p className="mb-3 flex flex-wrap gap-x-3 text-xs font-medium uppercase tracking-wide text-orange-700 dark:text-orange-300">
              {post.categories.map((category) => (
                <Link key={category} href={`/?category=${encodeURIComponent(category.toLowerCase())}`} className="hover:underline">
                  {category}
                </Link>
              ))}
            </p>
          )}

          <h1 className="text-[1.9rem] font-bold leading-[1.15] tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {post.title}
          </h1>

          {isLink && (
            <a
              href={post.source_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-700 dark:text-gray-400 dark:hover:text-orange-300"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
              {hostOf(post.source_url)}
            </a>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="flex items-center gap-2 text-gray-800 hover:text-orange-700 dark:text-gray-200 dark:hover:text-orange-300">
              {avatar ? (
                <Image src={avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  {authorName.charAt(0)}
                </span>
              )}
              <span className="font-medium">{authorName}</span>
            </Link>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {!isLink && (
              <>
                <span aria-hidden="true">·</span>
                <span>{minutes} min read</span>
              </>
            )}
            <AdminEditButton post={post} />
          </div>
        </header>

        <div className="mt-8 border-t border-gray-200 dark:border-slate-800" />

        <TableOfContents items={toc} />

        <ArticleBody light={light} dark={dark === light ? null : dark} />

        {isLink && <SourceCard url={post.source_url!} title={post.title} />}

        <footer className="mt-12 border-t border-gray-200 pt-6 dark:border-slate-800">
          {post.socmed && <ShareButtons title={post.title} url={postUrl(post.slug)} />}
        </footer>
      </article>

      <RelatedPosts posts={related} />

      {post.comment && (
        <div className="mx-auto mt-12 max-w-[42rem]">
          <CommentSection slug={post.slug} />
        </div>
      )}

      <BackButton />
    </main>
  );
}
