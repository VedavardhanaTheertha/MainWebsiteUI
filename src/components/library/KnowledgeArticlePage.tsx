"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { useUiSettings } from "@/context/UiSettingsContext";
import { placeholderLibrarySections, realLibrarySections } from "@/gen/library/data";
import { libraryContentLoaders } from "@/gen/library/loaders";
import { Copy, Printer } from "lucide-react";
import { articleHref, localizeArticle, relatedArticles } from "@/lib/knowledge";
import { copyReaderLink } from "@/lib/reader-utils";
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
  const { contentMode, lang, tr, isSectionPageEnabled, isSectionItemsEnabled } = useLang();
  const { readingSettings } = useUiSettings();
  const copy = tr.library_browser;
  const section = (contentMode === "placeholder" ? placeholderLibrarySections : realLibrarySections).find((entry) => entry.id === sectionId);
  const item = section?.items.find((entry) => entry.id === articleId);

  const [loadedHtml, setLoadedHtml] = useState<Record<string, string> | null>(initialHtml ?? item?.html ?? null);
  const [readingSize, setReadingSize] = useState<number>(readingSettings.initialSize);
  const [linkStatus, setLinkStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace(`${section?.route ?? `/library/${sectionId}`}#${articleId}`);
    }
  }, [section, sectionId, articleId]);

  useEffect(() => {
    if (loadedHtml || item?.html) return;
    const loader = libraryContentLoaders[`${sectionId}/${articleId}`];
    if (!loader) return;
    loader().then((mod) => {
      const htmlMap = (contentMode === "placeholder" && mod.placeholderHtml ? mod.placeholderHtml : mod.realHtml) || mod.html;
      setLoadedHtml(htmlMap);
    }).catch(() => {});
  }, [sectionId, articleId, contentMode, loadedHtml, item]);

  const pageEnabled = isSectionPageEnabled ? isSectionPageEnabled(sectionId, section?.enabled ?? false) : true;
  const itemsEnabled = isSectionItemsEnabled ? isSectionItemsEnabled(sectionId, section?.enabled ?? false) : true;

  if (!section || !item || !pageEnabled || (!item.enabled && !itemsEnabled)) {
    return <p role="status" className="mx-auto max-w-3xl px-5 py-10">{copy.unavailable}</p>;
  }
  const activeHtmlMap = loadedHtml ?? item.html;
  const article = localizeArticle({ ...item, html: activeHtmlMap }, lang);
  const related = relatedArticles(section, item);
  return (
    <div className="layout-reading layout-section mx-auto max-w-4xl px-4 pt-3.5 pb-8 sm:px-6 sm:pt-4 sm:pb-12">
      <div className="rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-cream-soft)]/92 p-5 shadow-sm backdrop-blur-md sm:p-8">
        <div className="library-reading-controls flex flex-wrap items-center justify-end gap-3 border-b border-[var(--color-line-soft)] pb-3 mb-5 text-sm">
          <label className="flex min-h-11 items-center gap-2">
            <span className="sr-only sm:not-sr-only text-xs text-[var(--color-text-secondary)]">
              {tr.bhakti_controls?.reading_size}
            </span>
            <input
              type="range"
              min={readingSettings.minSize}
              max={readingSettings.maxSize}
              step={readingSettings.step}
              value={readingSize}
              onChange={(event) => setReadingSize(Number(event.target.value))}
              aria-label={tr.bhakti_controls?.reading_size}
              className="min-h-11 w-24 sm:w-28"
            />
            <output className="text-xs text-[var(--color-text-secondary)]">{readingSize}%</output>
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label={copy.print}
            title={copy.print}
            className="flex min-h-11 min-w-11 items-center justify-center rounded border border-[var(--color-line)] p-2 text-[var(--color-text-brand)] hover:bg-white/60"
          >
            <Printer className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={async () => {
              const copied = await copyReaderLink(window.location.href);
              setLinkStatus(copied ? (tr.bhakti_controls?.copied ?? "") : (tr.bhakti_controls?.copy_failed ?? ""));
            }}
            aria-label={tr.bhakti_controls?.copy_link}
            title={tr.bhakti_controls?.copy_link}
            className="flex min-h-11 min-w-11 items-center justify-center rounded border border-[var(--color-line)] p-2 text-[var(--color-text-brand)] hover:bg-white/60"
          >
            <Copy className="size-4" aria-hidden="true" />
          </button>
          {linkStatus && <p role="status" className="text-xs text-[var(--color-text-secondary)]">{linkStatus}</p>}
        </div>
        <article style={{ fontSize: `${0.95 * readingSize / 100}rem` }}>
          <header className="border-b border-[var(--color-line)] pb-6">
            {article.status ? <p className="mt-2 text-sm font-semibold text-[var(--color-text-brand)]">{article.status}</p> : null}
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">{article.summary}</p>
          </header>
          <KnowledgeBody article={article} sectionId={sectionId} />
        </article>
      </div>
      {related.length > 0 && <section className="mt-8 rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-cream-soft)]/92 p-5 shadow-sm backdrop-blur-md sm:p-8" aria-labelledby="knowledge-related-heading">
        <h2 id="knowledge-related-heading" className="font-display text-2xl font-bold">{copy.related_articles}</h2>
        <ul className="mt-4 space-y-3">{related.map((entry) => {
          const relatedArticle = localizeArticle(entry, lang);
          return <li key={entry.id}><Link href={articleHref(section, entry.id)} className="block min-h-11 rounded-xl border border-[var(--color-line)] bg-white/60 px-4 py-3 font-semibold text-[var(--color-text-brand)] hover:bg-white">{relatedArticle.title}{relatedArticle.status ? <span className="mt-1 block text-xs font-normal text-[var(--color-text-muted)]">{relatedArticle.status}</span> : null}</Link></li>;
        })}</ul>
      </section>}
    </div>
  );
}
