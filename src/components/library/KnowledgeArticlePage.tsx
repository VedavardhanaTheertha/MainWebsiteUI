"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { placeholderLibrarySections, realLibrarySections } from "@/gen/library/data";
import { libraryContentLoaders } from "@/gen/library/loaders";
import { articleHref, localizeArticle, relatedArticles } from "@/lib/knowledge";
import KnowledgeBody from "./KnowledgeBody";

export default function KnowledgeArticlePage({
  sectionId,
  articleId,
  initialHtml,
}: {
  sectionId: string;
  articleId: string;
  initialHtml?: Record<string, string>;
}) {
  const { contentMode, lang, tr } = useLang();
  const copy = tr.library_browser;
  const section = (contentMode === "placeholder" ? placeholderLibrarySections : realLibrarySections).find((entry) => entry.id === sectionId);
  const item = section?.items.find((entry) => entry.id === articleId);

  const [loadedHtml, setLoadedHtml] = useState<Record<string, string> | null>(initialHtml ?? item?.html ?? null);

  useEffect(() => {
    if (loadedHtml || item?.html) return;
    const loader = libraryContentLoaders[`${sectionId}/${articleId}`];
    if (!loader) return;
    loader().then((mod) => {
      const htmlMap = (contentMode === "placeholder" && mod.placeholderHtml ? mod.placeholderHtml : mod.realHtml) || mod.html;
      setLoadedHtml(htmlMap);
    }).catch(() => {});
  }, [sectionId, articleId, contentMode, loadedHtml, item]);

  if (!section || !item) return <p role="status" className="mx-auto max-w-3xl px-5 py-10">{copy.unavailable}</p>;
  const activeHtmlMap = loadedHtml ?? item.html;
  const article = localizeArticle({ ...item, html: activeHtmlMap }, lang);
  const related = relatedArticles(section, item);
  return (
    <div className="layout-reading layout-section mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={section.route} className="mb-6 inline-flex min-h-11 items-center text-base font-semibold text-[var(--color-text-brand)] underline underline-offset-4">{copy.back_collection}</Link>
      <div className="rounded-2xl border border-[var(--color-line-strong)] bg-[#fceedb]/92 p-5 shadow-sm backdrop-blur-md sm:p-8">
        <article>
          <header className="border-b border-[var(--color-line)] pb-6">
            <p className="mt-2 text-sm font-semibold text-[var(--color-text-brand)]">{article.status}</p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">{article.summary}</p>
          </header>
          <KnowledgeBody article={article} sectionId={sectionId} />
        </article>
      </div>
      {related.length > 0 && <section className="mt-8 rounded-2xl border border-[var(--color-line-strong)] bg-[#fceedb]/92 p-5 shadow-sm backdrop-blur-md sm:p-8" aria-labelledby="knowledge-related-heading">
        <h2 id="knowledge-related-heading" className="font-display text-2xl font-bold">{copy.related_articles}</h2>
        <ul className="mt-4 space-y-3">{related.map((entry) => {
          const relatedArticle = localizeArticle(entry, lang);
          return <li key={entry.id}><Link href={articleHref(section, entry.id)} className="block min-h-11 rounded-xl border border-[var(--color-line)] bg-white/60 px-4 py-3 font-semibold text-[var(--color-text-brand)] hover:bg-white">{relatedArticle.title}<span className="mt-1 block text-xs font-normal text-[var(--color-text-muted)]">{relatedArticle.status}</span></Link></li>;
        })}</ul>
      </section>}
    </div>
  );
}
