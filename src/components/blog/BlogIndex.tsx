"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { blogPosts, defaultLang } from "@/gen/content";
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
 * Lists every post discovered under content/blog/, newest first. The list comes
 * from the generated content module, so adding a post folder is enough to make
 * it appear here — this component never names a post.
 */
export default function BlogIndex() {
  const { lang } = useLang();

  return (
    <div className="flex flex-col gap-3 max-w-xl mx-auto w-full">
      {blogPosts.map((post) => {
        const article = post.articles[lang] ?? post.articles[defaultLang];
        return (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex items-center gap-3.5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-2.5 shadow-[var(--shadow-xs)] hover:border-[var(--color-saffron-400)] transition-colors"
          >
            {post.hero && (
              <div className="relative w-[62px] h-[62px] shrink-0 rounded-[4px] overflow-hidden">
                <Image src={post.hero} alt="" fill sizes="62px" className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-body text-[11px] uppercase tracking-widest text-[var(--color-text-brand)] font-semibold">
                {formatDate(post.date, lang)}
              </p>
              <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight mt-0.5">
                {article.title}
              </p>
            </div>
            <ChevronRight size={20} className="text-[var(--color-text-secondary)] shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
