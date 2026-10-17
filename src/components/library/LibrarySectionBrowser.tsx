"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import { useMiniSearch } from "@/hooks/useMiniSearch";
import {
  placeholderLibrarySections,
  realLibrarySections,
  type LibraryArticle,
} from "@/gen/library/data";
import { collectionPagination } from "@/gen/settings/ui-elements";

type DisplayArticle = Omit<LibraryArticle, "title" | "summary" | "status" | "tags" | "html"> & {
  title: string;
  summary: string;
  status: string;
  tags: string[];
  html: string;
};

function ArticleModal({
  article,
  closeLabel,
  onClose,
}: {
  article: DisplayArticle;
  closeLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
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
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[var(--color-text-primary)] shadow"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto">
          <div className="relative h-48 overflow-hidden sm:h-64">
            <Image
              src={article.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/80 via-[var(--color-ink-900)]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-saffron-100)]">
                {article.status}
              </p>
              <h2 id="library-article-dialog-title" className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                {article.title}
              </h2>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{article.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--color-saffron-50)] px-3 py-1 text-xs text-[var(--color-text-brand)]">
                  {tag}
                </span>
              ))}
            </div>
            <div
              className="mt-6 max-w-none border-t border-[var(--color-line)] pt-6 font-body text-[var(--color-text-secondary)] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-saffron-400)] [&_blockquote]:pl-4 [&_h1]:hidden [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--color-text-primary)] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--color-text-primary)] [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_p]:text-sm [&_p]:leading-7 [&_strong]:text-[var(--color-text-primary)] [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleTile({
  article,
  viewDetails,
  featured = false,
  onOpen,
}: {
  article: DisplayArticle;
  viewDetails: string;
  featured?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-saffron-600)] hover:shadow-lg ${
        featured ? "h-80" : "h-[360px]"
      } ${
        featured ? "w-[82vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none" : "w-full"
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "h-40" : "h-40"}`}>
        <Image
          src={article.image}
          alt=""
          fill
          sizes={featured ? "(max-width: 768px) 82vw, 320px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/65 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-brand)]">
          {article.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-lg font-bold text-[var(--color-text-primary)]">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {article.summary}
        </p>
        <span className="mt-auto inline-block pt-3 text-xs font-semibold text-[var(--color-text-brand)]">
          {viewDetails}
        </span>
      </div>
    </button>
  );
}

export default function LibrarySectionBrowser({ sectionId }: { sectionId: string }) {
  const { lang, contentMode, tr } = useLang();
  const copy = tr.library_browser;
  const sections = contentMode === "placeholder"
    ? placeholderLibrarySections
    : realLibrarySections;
  const section = sections.find((entry) => entry.id === sectionId);
  const sectionCopy = tr.library_sections[sectionId];
  const articleLanguage = lang === "kn" ? "kn" : "en";
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const [previousQuery, setPreviousQuery] = useState(deferredQuery);
  const [selectedArticle, setSelectedArticle] = useState<DisplayArticle | null>(null);

  if (previousQuery !== deferredQuery) {
    setPreviousQuery(deferredQuery);
    setVisibleCount(collectionPagination.initialVisible);
  }

  const localizedItems = useMemo(
    () => section?.items.map((item) => ({
      ...item,
      title: item.title[articleLanguage],
      summary: item.summary[articleLanguage],
      status: item.status[articleLanguage],
      tags: item.tags.map((tag) => tag[articleLanguage]),
      html: item.html[articleLanguage],
    })) ?? [],
    [articleLanguage, section],
  );
  const searchConfig = useMemo(
    () => ({
      fields: ["title", "summary", "status", "tags", "searchText"],
      boost: { title: 3, tags: 2, summary: 1.5, status: 1, searchText: 1 },
      extractField: (item: DisplayArticle, field: string) => {
        const value = item[field as keyof DisplayArticle];
        return Array.isArray(value) ? value.join(" ") : String(value ?? "");
      },
    }),
    [],
  );
  const filtered = useMiniSearch(localizedItems, deferredQuery, searchConfig);
  const visible = filtered.slice(0, visibleCount);
  const featured = useMemo(
    () => section?.featuredItemIds
      .map((id) => localizedItems.find((item) => item.id === id))
      .filter((item): item is DisplayArticle => Boolean(item)) ?? [],
    [localizedItems, section],
  );
  const featuredScrollRef = useAutoScrollRail(featured.length);

  if (!section || !sectionCopy) return null;

  return (
    <>
      <header className="bg-[var(--color-parchment)] px-5 py-7 text-center lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
          {sectionCopy.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          {sectionCopy.title}
        </h1>
        <p className="mx-auto mt-3 flex min-h-10 max-w-2xl items-center justify-center text-sm text-[var(--color-text-brand)]/75 lg:min-h-12 lg:text-base">
          {sectionCopy.description}
        </p>
      </header>

      <section className="bg-[var(--color-cream)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="featured-library-title">
        <div className="mx-auto max-w-7xl">
          <h2 id="featured-library-title" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.featured_title}
          </h2>
          <div
            ref={featuredScrollRef}
            className="-mx-5 mt-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
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
                viewDetails={copy.view_details}
                featured
                onOpen={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
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
                className="w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label={copy.search_label}
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>

          <p className="my-4 text-xs text-[var(--color-text-secondary)]">
            {copy.showing_template
              .replace("{shown}", String(visible.length))
              .replace("{total}", String(filtered.length))}
          </p>

          {visible.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((article) => (
                <ArticleTile
                  key={article.id}
                  article={article}
                  viewDetails={copy.view_details}
                  onOpen={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-sm text-[var(--color-text-secondary)]">
              {copy.no_results}
            </p>
          )}

          {filtered.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + collectionPagination.loadIncrement)}
              className="mx-auto mt-7 block rounded-full border border-[var(--color-line-strong)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--color-text-brand)] hover:border-[var(--color-saffron-600)]"
            >
              {copy.show_more}
            </button>
          )}
        </section>
      </main>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          closeLabel={copy.close_article}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
