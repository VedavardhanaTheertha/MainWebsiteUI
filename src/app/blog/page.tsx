import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import BlogIndex from "@/components/blog/BlogIndex";
import { blogPosts, content, defaultLang } from "@/generated/content";

export const metadata: Metadata = {
  title: `${content[defaultLang].blog_title} | ${content[defaultLang].meta_title}`,
  alternates: { canonical: "/blog" },
};

/**
 * Blog landing page. Lists whatever posts the content build discovered under
 * content/blog/, and keeps the original "coming soon" state while none exist —
 * so the page stays presentable before the first article is written.
 */
export default function BlogPage() {
  if (blogPosts.length === 0) {
    return (
      <>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
          {/* Decorative lotus */}
          <div className="w-16 h-16 rounded-full bg-[var(--color-saffron-100)] flex items-center justify-center mb-6">
            <span className="text-3xl" aria-hidden="true">🪔</span>
          </div>

          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
            Coming Soon
          </p>
          <h1 className="font-display font-bold text-[var(--color-text-primary)] text-4xl sm:text-5xl mb-4">
            Blog
          </h1>
          <p className="font-body text-[var(--color-text-secondary)] text-base max-w-md leading-relaxed mb-8">
            Stories of devotion, reflections on the Paryaya, updates from the Matha, and wisdom
            from our Guru Parampara — all coming soon.
          </p>

          {/* Animated loading dots */}
          <div className="flex items-center gap-2" aria-label="Loading" role="status">
            <span className="w-2 h-2 rounded-full bg-[var(--color-saffron-600)] animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-[var(--color-saffron-600)] animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-[var(--color-saffron-600)] animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <div className="px-5 py-8 min-h-[70vh]">
        <div className="max-w-xl mx-auto mb-6">
          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2">
            {content[defaultLang].blog_eyebrow}
          </p>
          <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl">
            {content[defaultLang].blog_title}
          </h1>
        </div>
        <BlogIndex />
      </div>
      <SiteFooter />
    </>
  );
}
