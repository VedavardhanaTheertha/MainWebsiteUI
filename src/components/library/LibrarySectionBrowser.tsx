"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Copy, Printer, Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import AdvancedFilters from "@/components/AdvancedFilters";
import { useLazyMiniSearch } from "@/hooks/useMiniSearch";
import { getSearchProfile } from "@/lib/search";
import {
  placeholderLibrarySections,
  realLibrarySections,
} from "@/gen/library/data";
import {
  libraryContentLoaders,
  librarySearchIndexLoaders,
  type LibraryArticleContent,
} from "@/gen/library/loaders";
import { useUiSettings } from "@/context/UiSettingsContext";
import { knowledgeText, localizeArticle, type DisplayArticle } from "@/lib/knowledge";
import { copyReaderLink } from "@/lib/reader-utils";
import KnowledgeBody from "./KnowledgeBody";
import "./bhakti-print.css";

export default function LibrarySectionBrowser({ sectionId }: { sectionId: string }) {
  const { lang, contentMode, tr, isSectionPageEnabled, isSectionItemsEnabled } = useLang();
  const { readingSettings, collectionPagination } = useUiSettings();
  const reducedMotion = useReducedMotion();
  const copy = tr.library_browser;
  const sections = contentMode === "placeholder"
    ? placeholderLibrarySections
    : realLibrarySections;
  const section = sections.find((entry) => entry.id === sectionId);
  const sectionCopy = tr.library_sections[sectionId];
  const pageEnabled = isSectionPageEnabled ? isSectionPageEnabled(sectionId, section?.enabled ?? false) : true;
  const itemsEnabled = isSectionItemsEnabled ? isSectionItemsEnabled(sectionId, section?.enabled ?? false) : true;

  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [readingSize, setReadingSize] = useState<number>(readingSettings.initialSize);
  const [linkStatus, setLinkStatus] = useState("");
  const [expanded, setExpanded] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [loadedContent, setLoadedContent] = useState<Record<string, LibraryArticleContent>>({});
  const [loadFailures, setLoadFailures] = useState<Record<string, boolean>>({});
  const pendingLoads = useRef(new Map<string, Promise<void>>());

  const returnToId = useRef<string | null>(null);
  const focusFrame = useRef<number | null>(null);
  useEffect(() => () => {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
  }, []);
  const focusAfterRender = (find: () => HTMLElement | null) => {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null;
      const target = find();
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
    });
  };

  const filterKey = JSON.stringify([deferredQuery, selectedTag]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(collectionPagination.initialVisible);
  }

  const localizedItems = useMemo(
    () => {
      if (!pageEnabled || !itemsEnabled) return [];
      const items = (section?.items ?? [])
        .filter((item) => item.enabled || itemsEnabled)
        .map((item) => localizeArticle(item, lang));
      return sectionId === "jnana" ? items.sort((a, b) => a.title.localeCompare(b.title, lang)) : items;
    },
    [lang, section, sectionId, pageEnabled, itemsEnabled],
  );

  const allTags = useMemo(
    () => [...new Set(localizedItems.flatMap((item) => item.tags))].sort(),
    [localizedItems],
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

  const searchLoader = useMemo(
    () => librarySearchIndexLoaders[sectionId] ?? (() => Promise.resolve({ compressedIndex: "" })),
    [sectionId],
  );

  const { results: searched, ensureLoaded } = useLazyMiniSearch(
    localizedItems,
    deferredQuery,
    searchLoader,
    searchConfig,
  );
  const filtered = useMemo(
    () => (selectedTag ? searched.filter((item) => item.tags.includes(selectedTag)) : searched),
    [searched, selectedTag],
  );
  const selectedArticle = localizedItems.find((item) => item.id === selectedArticleId);
  const visible = filtered.slice(0, visibleCount);

  const loadArticleContent = useCallback((id: string) => {
    if (pendingLoads.current.has(id)) return;
    const item = localizedItems.find((candidate) => candidate.id === id);
    const inlineContent = item && item.html;
    const loaderKey = `${sectionId}/${id}`;
    const loader = libraryContentLoaders[loaderKey];
    setLoadFailures((current) => ({ ...current, [id]: false }));
    const pending = Promise.resolve().then(async () => {
      const content = inlineContent
        ? { html: { [lang]: item.html } }
        : loader ? await loader() : null;
      if (!content) throw new Error();
      setLoadedContent((current) => ({ ...current, [id]: content }));
    }).catch(() => {
      setLoadFailures((current) => ({ ...current, [id]: true }));
      pendingLoads.current.delete(id);
    });
    pendingLoads.current.set(id, pending);
  }, [localizedItems, sectionId, lang]);

  const prefetchItem = useCallback((id: string) => {
    if (!loadedContent[id]) loadArticleContent(id);
  }, [loadedContent, loadArticleContent]);

  const glossary = useMemo(() => localizedItems.flatMap((article) =>
    article.knowledge?.glossary?.map((entry) => ({
      term: knowledgeText(entry.term, lang),
      definition: knowledgeText(entry.definition, lang),
      articleId: article.id,
    })) ?? [],
  ).sort((a, b) => a.term.localeCompare(b.term, lang)), [localizedItems, lang]);

  useEffect(() => {
    const selectFromHash = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        /* Ignore malformed external links. */
      }
      setLinkStatus("");
      if (id && localizedItems.some((item) => item.id === id)) {
        setSelectedArticleId(id);
        setExpanded(false);
        loadArticleContent(id);
      } else if (!id) {
        setSelectedArticleId(null);
        setExpanded(true);
      }
    };
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, [localizedItems, loadArticleContent]);

  const selectArticle = (article: DisplayArticle) => {
    returnToId.current = article.id;
    setLinkStatus("");
    setSelectedArticleId(article.id);
    setExpanded(false);
    loadArticleContent(article.id);
    window.history.replaceState(null, "", `#${encodeURIComponent(article.id)}`);
    focusAfterRender(() => document.getElementById("library-reading"));
  };

  const backToResults = () => {
    setSelectedArticleId(null);
    setExpanded(true);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    focusAfterRender(() => Array.from(document.querySelectorAll<HTMLButtonElement>("[data-article-id]"))
      .find((button) => button.dataset.articleId === returnToId.current) ?? document.getElementById("library-results"));
  };

  if (!section || !sectionCopy) return <p role="status" className="mx-auto max-w-3xl p-8 text-base leading-7">{copy.unavailable}</p>;

  return (
    <div className="library-reader-page bg-transparent px-4 pt-3.5 pb-4 text-[var(--color-text-primary)] sm:px-6 sm:pt-4">
      <section className="mx-auto max-w-[820px] px-16 text-center sm:px-20 lg:px-8">
        <p className="text-micro font-bold uppercase tracking-[.18em] text-[var(--color-text-brand)]">
          {sectionCopy.eyebrow}
        </p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
          {sectionCopy.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {sectionCopy.description}
        </p>
        <div className="mx-auto mt-3 max-w-[690px]">
          <AdvancedFilters
            active={Boolean(selectedTag)}
            search={
              <label className="flex h-11 items-center gap-3 rounded-full border border-[var(--color-line-strong)] bg-white/80 px-4 shadow-sm focus-within:border-[var(--color-saffron-400)] focus-within:ring-2 focus-within:ring-[var(--color-saffron-100)]">
                <span className="sr-only">{copy.search_label}</span>
                <Search aria-hidden="true" className="size-4 text-[var(--color-text-brand)]" />
                <input
                  type="search"
                  value={query}
                  onFocus={ensureLoaded}
                  onChange={(event) => {
                    ensureLoaded();
                    setQuery(event.target.value);
                    setVisibleCount(collectionPagination.initialVisible);
                  }}
                  placeholder={copy.search_placeholder}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    aria-label={copy.clear_search}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </label>
            }
          >
            <div className="flex flex-wrap gap-3 text-left text-sm">
              <label className="flex-1 min-w-40">
                <span className="block mb-1">{copy.tag}</span>
                <select
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                  className="min-h-11 w-full rounded border border-[var(--color-line)] bg-white px-2"
                >
                  <option value="">{tr.bhakti_controls?.all ?? ""}</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
              {(query || selectedTag) && (
                <button
                  type="button"
                  className="min-h-11 px-3 underline"
                  onClick={() => {
                    setQuery("");
                    setSelectedTag("");
                  }}
                >
                  {tr.bhakti_controls?.clear_filters ?? ""}
                </button>
              )}
            </div>
          </AdvancedFilters>
        </div>
      </section>

      <section
        id="library-results"
        tabIndex={-1}
        aria-label={copy.all_items}
        className="mx-auto mt-4 max-w-6xl border-t border-[var(--color-line-strong)] pt-3 scroll-mt-28"
      >
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.all_items}
          </h2>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white/50 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-white"
          >
            {expanded ? copy.collapse : copy.expand}
            <ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {expanded && (
          <>
            <p className="my-2 text-xs text-[var(--color-text-secondary)]">
              {copy.showing_template
                .replace("{shown}", String(visible.length))
                .replace("{total}", String(filtered.length))}
            </p>
            {visible.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((article) => {
                  const projectStatus = article.knowledge?.project?.status;
                  return (
                    <button
                      key={article.id}
                      data-article-id={article.id}
                      type="button"
                      onMouseEnter={() => prefetchItem(article.id)}
                      onFocus={() => prefetchItem(article.id)}
                      onClick={() => selectArticle(article)}
                      className="group relative min-h-30 overflow-hidden rounded-lg border border-[var(--color-line-strong)] bg-white/75 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-gold-500)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                    >
                      <span className="absolute left-4 top-0 h-[3px] w-8 bg-[var(--color-gold-500)]" />
                      <strong className="block pr-5 text-sm font-semibold leading-relaxed text-[var(--color-text-primary)]">
                        {article.title}
                      </strong>
                      {(projectStatus || article.status) && (
                        <span className="mt-1.5 block text-caption text-[var(--color-text-muted)]">
                          {projectStatus ? copy.detail_labels[projectStatus] : article.status}
                        </span>
                      )}
                      {projectStatus && article.status ? (
                        <span className="mt-0.5 block text-caption text-[var(--color-text-muted)]">
                          {article.status}
                        </span>
                      ) : null}
                      <span className="mt-1 block line-clamp-2 text-xs text-[var(--color-text-secondary)]">
                        {article.summary}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-[var(--color-line)] bg-white/50 p-8 text-center text-sm text-[var(--color-text-secondary)]">
                {copy.no_results}
              </p>
            )}
            {filtered.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + collectionPagination.loadIncrement)}
                className="mx-auto mt-3 block min-h-11 rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-xs font-semibold text-[var(--color-text-brand)] hover:bg-white/60"
              >
                {copy.show_more}
              </button>
            )}
          </>
        )}
      </section>

      {selectedArticle && (
        <section
          id="library-reading"
          tabIndex={-1}
          aria-label={selectedArticle.title}
          className="mx-auto mt-4 max-w-4xl scroll-mt-28 rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-cream-soft)]/92 p-5 shadow-sm backdrop-blur-md sm:p-8"
        >
          <div className="library-reading-controls flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line-strong)] pb-3 mb-5">
            <button
              type="button"
              onClick={backToResults}
              className="min-h-11 py-2 text-xs font-semibold text-[var(--color-text-brand)] hover:underline"
            >
              ← {copy.back_collection}
            </button>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex min-h-11 items-center gap-2">
                <span className="sr-only sm:not-sr-only text-xs text-[var(--color-text-secondary)]">
                  {tr.bhakti_controls.reading_size}
                </span>
                <input
                  type="range"
                  min={readingSettings.minSize}
                  max={readingSettings.maxSize}
                  step={readingSettings.step}
                  value={readingSize}
                  onChange={(event) => setReadingSize(Number(event.target.value))}
                  aria-label={tr.bhakti_controls.reading_size}
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
                  const origin = window.location.origin;
                  const directUrl = `${origin}${section.route}#${selectedArticle.id}`;
                  const copied = await copyReaderLink(directUrl);
                  setLinkStatus(copied ? tr.bhakti_controls.copied : tr.bhakti_controls.copy_failed);
                }}
                aria-label={tr.bhakti_controls.copy_link}
                title={tr.bhakti_controls.copy_link}
                className="flex min-h-11 min-w-11 items-center justify-center rounded border border-[var(--color-line)] p-2 text-[var(--color-text-brand)] hover:bg-white/60"
              >
                <Copy className="size-4" aria-hidden="true" />
              </button>
              {linkStatus && <p role="status" className="text-xs text-[var(--color-text-secondary)]">{linkStatus}</p>}
            </div>
          </div>
          {(() => {
            const activeChunk = selectedArticle ? loadedContent[selectedArticle.id] : null;
            const chunkHtml = activeChunk
              ? (contentMode === "placeholder" ? activeChunk.placeholderHtml?.[lang] : activeChunk.realHtml?.[lang])
                || activeChunk.realHtml?.[lang]
                || activeChunk.html?.[lang]
                || Object.values(activeChunk.realHtml ?? {})[0]
                || Object.values(activeChunk.html ?? {})[0]
              : null;
            const currentHtml = chunkHtml || selectedArticle.html || "";
            return (
              <article
                className="library-reading-content"
                lang={lang}
                style={{ fontSize: `${(0.95 * readingSize) / 100}rem` }}
              >
                <h2 className="mb-4 font-display text-[1.5em] font-bold text-[var(--color-text-primary)] sm:text-[1.75em]">
                  {selectedArticle.title}
                </h2>
                {loadFailures[selectedArticle.id] ? (
                  <div className="my-6 rounded-lg border border-[var(--color-line)] p-4 text-center">
                    <p className="text-sm text-[var(--color-text-secondary)]">{copy.unavailable}</p>
                    <button
                      type="button"
                      onClick={() => {
                        pendingLoads.current.delete(selectedArticle.id);
                        loadArticleContent(selectedArticle.id);
                      }}
                      className="mt-3 inline-flex min-h-11 items-center rounded-full border border-[var(--color-line-strong)] px-4 text-xs font-semibold text-[var(--color-text-brand)] hover:bg-white/60"
                    >
                      {tr.bhakti_controls.retry}
                    </button>
                  </div>
                ) : (
                  <KnowledgeBody article={{ ...selectedArticle, html: currentHtml }} sectionId={sectionId} />
                )}
              </article>
            );
          })()}
        </section>
      )}

      {sectionId === "jnana" && (
        <section
          className="layout-reading layout-section mx-auto mt-8 max-w-4xl rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-cream-soft)]/92 p-5 shadow-sm backdrop-blur-md sm:p-8"
          aria-labelledby="knowledge-glossary-heading"
        >
          <h2
            id="knowledge-glossary-heading"
            className="font-display text-2xl font-bold"
          >
            {copy.detail_labels.glossary}
          </h2>
          {glossary.length ? (
            <dl className="mt-4 space-y-4">
              {glossary.map((entry, index) => (
                <div key={index}>
                  <dt className="font-bold text-[var(--color-text-primary)]">{entry.term}</dt>
                  <dd className="text-sm text-[var(--color-text-secondary)]">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p role="status" className="mt-4 text-base leading-8">
              {copy.unavailable}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
