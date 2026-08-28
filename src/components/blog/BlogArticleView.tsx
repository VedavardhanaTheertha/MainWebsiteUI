"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { defaultLang } from "@/gen/content";
import type { BlogPost } from "@/lib/content-types";
import { useLang } from "@/context/LanguageContext";

/** Renders a post's date in the reader's language, falling back to the raw value. */
function formatDate(iso: string, lang: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(lang === defaultLang ? "en-IN" : `${lang}-IN`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Renders one article in the reader's language, falling back to the default
 * language when that post has not been translated yet.
 *
 * The body is HTML produced from Markdown by the content build step. It is
 * inserted with dangerouslySetInnerHTML after the content build has parsed it
 * with raw HTML disabled and sanitized it through an explicit allowlist.
 */
export default function BlogArticleView({ post }: { post: BlogPost }) {
  const { lang, tr } = useLang();
  const article = post.articles[lang] ?? post.articles[defaultLang];

  return (
    <article className="max-w-2xl mx-auto w-full px-5 py-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 font-body text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-brand)] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        {tr.blog_back}
      </Link>

      <p className="font-body text-[11px] uppercase tracking-widest text-[var(--color-text-brand)] font-semibold">
        {formatDate(post.date, lang)}
      </p>
      <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl leading-tight mt-2 mb-6">
        {article.title}
      </h1>

      {post.hero && (
        <div className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden mb-7">
          <Image src={post.hero} alt="" fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
        </div>
      )}

      <div
        className="blog-body font-body text-[var(--color-text-primary)] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[var(--color-line)]">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-body text-[11px] uppercase tracking-wider text-[var(--color-text-secondary)] bg-[var(--color-saffron-50)] border border-[var(--color-line)] rounded-full px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
