import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import BlogArticleView from "@/components/blog/BlogArticleView";
import { blogPosts, content, defaultLang } from "@/gen/content";

/**
 * Tells the static export which article pages to build — one per folder found
 * under content/blog/. Adding a post folder adds its page automatically.
 */
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

/** Per-article title and description, using the default language for crawlers. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  const siteTitle = content[defaultLang].meta_title;
  if (!post) return { title: siteTitle };

  const title = post.articles[defaultLang]?.title ?? slug;
  return {
    title: `${title} | ${siteTitle}`,
    alternates: { canonical: `/blog/${slug}` },
  };
}

/** Renders one article, or a 404 when the slug does not match a known post. */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <BlogArticleView post={post} />
      <SiteFooter />
    </>
  );
}
