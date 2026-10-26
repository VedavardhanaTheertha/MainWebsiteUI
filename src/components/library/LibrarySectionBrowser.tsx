"use client";

import { useDeferredValue, useMemo, useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import { useDialog } from "@/hooks/useDialog";
import RailMotionControl from "@/components/RailMotionControl";
import RailNavigation from "@/components/RailNavigation";
import { useMiniSearch } from "@/hooks/useMiniSearch";
import { getSearchProfile } from "@/lib/search";
import {
  placeholderLibrarySections,
  realLibrarySections,
} from "@/gen/library/data";
import { useUiSettings } from "@/context/UiSettingsContext";
import { articleHref, knowledgeReadingTime, knowledgeText, localizeArticle, type DisplayArticle } from "@/lib/knowledge";
import KnowledgeBody from "./KnowledgeBody";
import CollectionEmptyState from "@/components/presentation/CollectionEmptyState";
import { collectionCardBodyClassName, collectionCardClassName, collectionCardImageClassName } from "@/lib/collection-presentation";

function ArticleModal({
  article,
  closeLabel,
  onClose,
  sectionId,
  href,
  openLabel,
}: {
  article: DisplayArticle;
  closeLabel: string;
  onClose: () => void;
  sectionId: string;
  href: string;
  openLabel: string;
}) {
  const dialogRef = useDialog(true, onClose);

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[var(--color-ink-900)]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-article-dialog-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-[var(--color-line)] p-5 sm:px-7">
          <h2 id="library-article-dialog-title" className="min-w-0 flex-1 font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">{article.title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full bg-[var(--color-cream-soft)] text-[var(--color-text-primary)]">
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto">
          <div className="relative h-48 overflow-hidden sm:h-64">
            <ContentImage
              src={article.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <div className="p-5 sm:p-7">
            <p className="mb-3 text-badge font-bold uppercase tracking-widest text-[var(--color-text-brand)]">{article.status}</p>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{article.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--color-saffron-50)] px-3 py-1 text-badge text-[var(--color-text-brand)]">
                  {tag}
                </span>
              ))}
            </div>
            <Link href={href} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--color-line)] px-5 font-semibold text-[var(--color-text-brand)]">{openLabel}</Link>
            <KnowledgeBody article={article} sectionId={sectionId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleTile({
  article,
  sectionId,
  featured = false,
  onOpen,
}: {
  article: DisplayArticle;
  sectionId: string;
  featured?: boolean;
  onOpen: () => void;
}) {
  const { tr } = useLang();
  const { readingTimeSettings } = useUiSettings();
  const copy = tr.library_browser;
  const projectStatus = article.knowledge?.project?.status;
  const readingTime = sectionId === "stories" || article.knowledge?.readMinutes ? knowledgeReadingTime(article, readingTimeSettings) : undefined;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${collectionCardClassName(featured ? "featured" : "collection", true)} layout-info-tile ${featured ? "" : "layout-compact-card"} ${
        featured ? "w-[82vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none" : "w-full"
      }`}
    >
      <div className={collectionCardImageClassName}>
        <ContentImage
          src={article.image}
          alt=""
          fill
          sizes={featured ? "(max-width: 768px) 82vw, 320px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />
      </div>
      <div className={collectionCardBodyClassName}>
        <span className="layout-tile-category visual-tile-badge mb-2 block w-fit rounded-full bg-[var(--color-cream-soft)] px-2.5 py-1 text-badge font-bold uppercase tracking-wide text-[var(--color-text-brand)]">{projectStatus ? copy.detail_labels[projectStatus] : article.status}</span>
        {projectStatus && <p className="layout-tile-category mb-1 text-meta font-semibold text-[var(--color-text-muted)]">{article.status}</p>}
        <h3 className="layout-tile-title line-clamp-2 font-display text-lg font-bold text-[var(--color-text-primary)]">
          {article.title}
        </h3>
        <p className="layout-tile-summary mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {article.summary}
        </p>
        {readingTime && <p className="layout-tile-footer layout-tile-reading-time mt-2 text-sm text-[var(--color-text-secondary)]">{(readingTime.estimated ? copy.estimated_read_minutes : copy.read_minutes).replace("{count}", String(readingTime.minutes))}</p>}
      </div>
    </button>
  );
}

export default function LibrarySectionBrowser({ sectionId }: { sectionId: string }) {
  const { lang, contentMode, tr } = useLang();
  const { collectionPagination } = useUiSettings();
  const copy = tr.library_browser;
  const sections = contentMode === "placeholder"
    ? placeholderLibrarySections
    : realLibrarySections;
  const section = sections.find((entry) => entry.id === sectionId);
  const sectionCopy = tr.library_sections[sectionId];
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const [previousQuery, setPreviousQuery] = useState(deferredQuery);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  if (previousQuery !== deferredQuery) {
    setPreviousQuery(deferredQuery);
    setVisibleCount(collectionPagination.initialVisible);
  }

  const localizedItems = useMemo(
    () => {
      const items = section?.items.map((item) => localizeArticle(item, lang)) ?? [];
      return sectionId === "jnana" ? items.sort((a, b) => a.title.localeCompare(b.title, lang)) : items;
    },
    [lang, section, sectionId],
  );
  const searchConfig = useMemo(
    () => ({
      ...getSearchProfile("knowledge"),
      extractField: (item: DisplayArticle, field: string) => {
        const value = item[field as keyof DisplayArticle];
        return Array.isArray(value) ? value.join(" ") : String(value ?? "");
      },
    }),
    [],
  );
  const filtered = useMiniSearch(localizedItems, deferredQuery, searchConfig);
  const selectedArticle = localizedItems.find((item) => item.id === selectedArticleId);
  const visible = filtered.slice(0, visibleCount);
  const featured = useMemo(
    () => section?.featuredItemIds
      .map((id) => localizedItems.find((item) => item.id === id))
      .filter((item): item is DisplayArticle => Boolean(item)) ?? [],
    [localizedItems, section],
  );
  const featuredScrollRef = useAutoScrollRail(featured.length, paused || Boolean(selectedArticle));
  const glossary = useMemo(() => localizedItems.flatMap((article) =>
    article.knowledge?.glossary?.map((entry) => ({
      term: knowledgeText(entry.term, lang),
      definition: knowledgeText(entry.definition, lang),
      articleId: article.id,
    })) ?? [],
  ).sort((a, b) => a.term.localeCompare(b.term, lang)), [localizedItems, lang]);

  if (!section || !sectionCopy) return <p role="status" className="mx-auto max-w-3xl p-8 text-base leading-7">{copy.unavailable}</p>;

  return (
    <>
      <header className="bg-[var(--color-parchment)] px-5 py-7 text-center lg:py-10">
        <p className="text-badge font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
          {sectionCopy.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          {sectionCopy.title}
        </h1>
        <p className="mx-auto mt-3 flex min-h-10 max-w-2xl items-center justify-center text-sm text-[var(--color-text-brand)]/75 lg:min-h-12 lg:text-base">
          {sectionCopy.description}
        </p>
      </header>

      {sectionId === "jnana" && <section className="layout-reading layout-section mx-auto max-w-7xl px-5 py-8" aria-labelledby="knowledge-glossary-heading">
        <h2 id="knowledge-glossary-heading" className="font-display text-2xl font-bold">{copy.detail_labels.glossary}</h2>
        {glossary.length ? <dl className="mt-5 grid gap-5 sm:grid-cols-2">{glossary.map((entry, index) => <div key={`${entry.articleId}-${index}`}><dt className="font-semibold"><Link href={articleHref(section, entry.articleId)} className="inline-flex min-h-11 items-center text-[var(--color-text-brand)] underline underline-offset-4">{entry.term}</Link></dt><dd className="text-base leading-8">{entry.definition}</dd></div>)}</dl> : <p role="status" className="mt-4 text-base leading-8">{copy.unavailable}</p>}
      </section>}

      <section className="layout-section bg-[var(--color-cream)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="featured-library-title">
        <div className="layout-wide mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
          <h2 id="featured-library-title" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.featured_title}
          </h2>
          </div>
          <div className="relative mt-5">
          {featured.length > 1 && <RailMotionControl paused={paused} onToggle={() => setPaused((current) => !current)} />}
          {featured.length > 1 && <RailNavigation scrollRef={featuredScrollRef} />}
          <div
            ref={featuredScrollRef}
            className="layout-carousel-track -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {featured.map((article) => (
              <ArticleTile
                key={article.id}
                article={article}
                sectionId={sectionId}
                featured
                onOpen={() => setSelectedArticleId(article.id)}
              />
            ))}
          </div>
          </div>
        </div>
      </section>

      <div className="layout-collection layout-section mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <section aria-labelledby="library-collection-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="library-collection-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
              {copy.all_items}
            </h2>

            <label className="relative block w-full sm:max-w-md">
              <span className="sr-only">{copy.search_label}</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search_placeholder}
                className="min-h-11 w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-2.5 pl-10 pr-12 text-base text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label={copy.clear_search}
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>

          <p role="status" aria-live="polite" className="my-4 text-sm text-[var(--color-text-secondary)]">
            {copy.showing_template
              .replace("{shown}", String(visible.length))
              .replace("{total}", String(filtered.length))}
          </p>

          {visible.length > 0 ? (
            <div className="layout-compact-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((article) => (
                <ArticleTile
                  key={article.id}
                  article={article}
                  sectionId={sectionId}
                  onOpen={() => setSelectedArticleId(article.id)}
                />
              ))}
            </div>
          ) : (
            <CollectionEmptyState>
              {copy.no_results}
            </CollectionEmptyState>
          )}

          {filtered.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + collectionPagination.loadIncrement)}
              className="mx-auto mt-7 block min-h-11 rounded-full border border-[var(--color-line-strong)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-text-brand)] hover:border-[var(--color-saffron-600)]"
            >
              {copy.show_more}
            </button>
          )}
        </section>
      </div>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          sectionId={sectionId}
          href={articleHref(section, selectedArticle.id)}
          openLabel={copy.open_article}
          closeLabel={copy.close_article}
          onClose={() => setSelectedArticleId(null)}
        />
      )}
    </>
  );
}
