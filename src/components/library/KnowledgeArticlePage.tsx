"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { placeholderLibrarySections, realLibrarySections } from "@/gen/library/data";
import { articleHref, localizeArticle, relatedArticles } from "@/lib/knowledge";
import KnowledgeBody from "./KnowledgeBody";

export default function KnowledgeArticlePage({ sectionId, articleId }: { sectionId: string; articleId: string }) {
  const { contentMode, lang, tr } = useLang();
  const copy = tr.library_browser;
  const section = (contentMode === "placeholder" ? placeholderLibrarySections : realLibrarySections).find((entry) => entry.id === sectionId);
  const item = section?.items.find((entry) => entry.id === articleId);
  if (!section || !item) return <p role="status" className="mx-auto max-w-3xl px-5 py-10">{copy.unavailable}</p>;
  const article = localizeArticle(item, lang);
  const related = relatedArticles(section, item);
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <Link href={section.route} className="inline-flex min-h-11 items-center text-base font-semibold text-[var(--color-text-brand)] underline underline-offset-4">{copy.back_collection}</Link>
      <article>
        <header className="border-b border-[var(--color-line)] pb-6">
          <p className="mt-5 text-sm font-semibold text-[var(--color-text-brand)]">{article.status}</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
          <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">{article.summary}</p>
        </header>
        <KnowledgeBody article={article} sectionId={sectionId} />
      </article>
      {related.length > 0 && <section className="mt-10 border-t border-[var(--color-line)] pt-7" aria-labelledby="knowledge-related-heading">
        <h2 id="knowledge-related-heading" className="font-display text-2xl font-bold">{copy.related_articles}</h2>
        <ul className="mt-4 space-y-3">{related.map((entry) => {
          const relatedArticle = localizeArticle(entry, lang);
          return <li key={entry.id}><Link href={articleHref(section, entry.id)} className="block min-h-11 rounded-xl border border-[var(--color-line)] px-4 py-3 font-semibold text-[var(--color-text-brand)] hover:bg-[var(--color-cream-soft)]">{relatedArticle.title}<span className="mt-1 block text-xs font-normal text-[var(--color-text-muted)]">{relatedArticle.status}</span></Link></li>;
        })}</ul>
      </section>}
    </div>
  );
}
