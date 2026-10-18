"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import ContentImage from "@/components/presentation/ContentImage";
import { Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { defaultLang, siteConfig } from "@/gen/content";
import { localizedText as localized } from "@/lib/localization";
import {
  featuredSevaIds,
  realSevas,
  placeholderSevas,
  type SevaRecord,
} from "@/gen/sevas/data";
import { loadSevasSearchIndex } from "@/gen/sevas/loaders";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import { useLazyMiniSearch } from "@/hooks/useMiniSearch";
import { getSearchProfile } from "@/lib/search";
import { useUiSettings } from "@/context/UiSettingsContext";
import { useDialog } from "@/hooks/useDialog";
import { filterAndSortSevas } from "@/lib/seva-filtering";
import RailMotionControl from "./RailMotionControl";
import AdvancedFilters from "./AdvancedFilters";
import CollectionEmptyState from "./presentation/CollectionEmptyState";
import { collectionCardBodyClassName, collectionCardClassName } from "@/lib/collection-presentation";

function amountLabel(seva: SevaRecord, lang: string, anyAmount: string) {
  if (seva.amount <= 0) return anyAmount;
  const configured = localized(seva.formattedAmount, lang);
  return configured || new Intl.NumberFormat(lang, {
    style: "currency",
    currency: seva.currency,
    maximumFractionDigits: 0,
  }).format(seva.amount);
}

function SevaImage({ title, image, featured = false }: { title: string; image: string; featured?: boolean }) {
  const placeholderSrc = `${siteConfig.basePath}/icons/seva-placeholder.svg`;
  const source = image.startsWith("/") ? `${siteConfig.basePath}${image}` : image;
  const [failedSource, setFailedSource] = useState("");
  const showPlaceholder = !source || source === placeholderSrc || failedSource === source;
  const sizes = featured ? "(max-width: 768px) 85vw, 33vw" : "80px";
  return (
    <div className={`relative shrink-0 overflow-hidden bg-[var(--color-saffron-100)] ${featured ? "h-40 w-full" : "h-20 w-20 rounded-lg"}`}>
      {showPlaceholder ? (
        <Image src={placeholderSrc} alt="" fill sizes={sizes} className="object-contain" />
      ) : (
        <ContentImage src={source} onError={() => setFailedSource(source)} alt="" fill sizes={sizes} />
      )}
      <span className="sr-only">{title}</span>
    </div>
  );
}

function SevaCard({
  seva,
  lang,
  anyAmount,
  onOpen,
}: {
  seva: SevaRecord;
  lang: string;
  anyAmount: string;
  onOpen: () => void;
}) {
  const title = localized(seva.title, lang);
  const amount = amountLabel(seva, lang, anyAmount);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${collectionCardClassName("collection")} w-full`}
    >
      <SevaImage title={title} image={seva.image} featured />
      <div className={collectionCardBodyClassName}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-brand)]">
          {localized(seva.deity, lang)}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold leading-snug text-[var(--color-text-primary)]">
          {title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {localized(seva.description, lang)}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          {amount && (
            <p className="font-body font-bold text-[var(--color-text-brand)]">
              {amount}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function SevaModal({
  seva,
  lang,
  onClose,
}: {
  seva: SevaRecord;
  lang: string;
  onClose: () => void;
}) {
  const { tr } = useLang();
  const title = localized(seva.title, lang);
  const amount = amountLabel(seva, lang, tr.sevas_any_amount);

  const dialogRef = useDialog(true, onClose);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[var(--color-ink-900)]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seva-dialog-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={tr.sevas_close}
          className="absolute right-4 top-4 z-10 min-h-11 min-w-11 grid place-items-center rounded-full bg-white/90 p-2 text-[var(--color-text-primary)] shadow"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto">
          <SevaImage title={title} image={seva.image} featured />
          <div className="p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
              {localized(seva.category, lang)}
            </p>
            <h2 id="seva-dialog-title" className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
              {title}
            </h2>
            {amount && <p className="mt-2 text-xl font-bold text-[var(--color-text-brand)]">{amount}</p>}

            <dl className="mt-5 grid gap-3 rounded-xl bg-[var(--color-parchment)] p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-[var(--color-text-secondary)]">{tr.sevas_deity}</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-primary)]">{localized(seva.deity, lang)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[var(--color-text-secondary)]">{tr.sevas_sannidhi}</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-primary)]">{localized(seva.sannidhi, lang)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-[var(--color-text-secondary)]">{tr.sevas_location}</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-primary)]">{localized(seva.location, lang)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{tr.sevas_description}</h3>
              <p className="mt-1 text-base leading-relaxed text-[var(--color-text-secondary)]">{localized(seva.description, lang)}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{tr.sevas_significance}</h3>
              <p className="mt-1 text-base leading-relaxed text-[var(--color-text-secondary)]">{localized(seva.significance, lang)}</p>
            </div>

            <div
              className="mt-5 max-w-none border-t border-[var(--color-line)] pt-5 text-base leading-relaxed text-[var(--color-text-secondary)] [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--color-text-primary)] [&_li]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: localized(seva.detailsHtml, lang) }}
            />
            <div className="h-3" />
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--color-line)] bg-white p-4 shadow-[0_-8px_24px_rgba(60,7,83,0.08)] sm:px-7">
          <a
            href={seva.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full bg-[var(--color-saffron-600)] px-6 py-3 font-semibold text-white hover:bg-[var(--color-saffron-700)]"
          >
            {tr.sevas_offer}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SevasBrowser() {
  const { lang, contentMode, tr } = useLang();
  const { collectionPagination } = useUiSettings();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deityFilter, setDeityFilter] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [amountOrder, setAmountOrder] = useState("");
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSeva, setSelectedSeva] = useState<SevaRecord | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const filterKey = JSON.stringify([categoryFilter, query, deityFilter, minimum, maximum, amountOrder, contentMode]);
  const [prevFilter, setPrevFilter] = useState(filterKey);

  if (prevFilter !== filterKey) {
    setPrevFilter(filterKey);
    setVisibleCount(collectionPagination.initialVisible);
  }
  const activeSevas = contentMode === "placeholder" ? placeholderSevas : realSevas;

  const featured = useMemo(
    () => featuredSevaIds.map((id) => activeSevas.find((seva) => seva.id === id)).filter((seva): seva is SevaRecord => Boolean(seva)),
    [activeSevas],
  );
  const featuredScrollRef = useAutoScrollRail(featured.length, paused);
  const deities = useMemo(() => Array.from(new Map(activeSevas.map((seva) =>
    [localized(seva.deity, defaultLang), seva.deity])).entries()).sort((left, right) =>
    localized(left[1], lang).localeCompare(localized(right[1], lang))), [activeSevas, lang]);
  const clearFilters = () => {
    setCategoryFilter(""); setDeityFilter(""); setMinimum(""); setMaximum(""); setQuery(""); setAmountOrder("");
  };

  const categories = useMemo(
    () => Array.from(new Map(activeSevas.map((seva) => [seva.category.code, seva.category])).entries())
      .sort((left, right) => localized(left[1], lang).localeCompare(localized(right[1], lang))),
    [activeSevas, lang],
  );
  const searchConfig = useMemo(
    () => getSearchProfile("sevas"),
    [],
  );
  const { results: searchResults, ensureLoaded } = useLazyMiniSearch(
    activeSevas,
    query,
    loadSevasSearchIndex,
    searchConfig,
  );

  const visibleSevas = useMemo(() => {
    const source = query.trim() ? searchResults : activeSevas;
    return filterAndSortSevas(source, categoryFilter, deityFilter, minimum, maximum, amountOrder, defaultLang);
  }, [activeSevas, categoryFilter, query, searchResults, deityFilter, minimum, maximum, amountOrder]);

  const displayedSevas = useMemo(
    () => visibleSevas.slice(0, visibleCount),
    [visibleSevas, visibleCount],
  );

  return (
    <>
      <section className="bg-[var(--color-cream)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="featured-sevas-title">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="featured-sevas-title" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">{tr.sevas_featured_title}</h2>
          </div>
          <div className="relative mt-5">
          {featured.length > 1 && <RailMotionControl paused={paused} onToggle={() => setPaused((value) => !value)} />}
          <div
            ref={featuredScrollRef}
            className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {featured.map((seva) => {
              const title = localized(seva.title, lang);
              const amount = amountLabel(seva, lang, tr.sevas_any_amount);
              return (
                <button
                  type="button"
                  key={seva.id}
                  onClick={() => setSelectedSeva(seva)}
                  className={`${collectionCardClassName("featured")} w-[82vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none`}
                >
                  <SevaImage title={title} image={seva.image} featured />
                  <div className={collectionCardBodyClassName}>
                    <h3 className="line-clamp-2 font-display text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{localized(seva.description, lang)}</p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      {amount && <p className="font-bold text-[var(--color-text-brand)]">{amount}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12" aria-labelledby="all-sevas-title">
        <AdvancedFilters
          active={Boolean(categoryFilter || deityFilter || minimum || maximum || amountOrder)}
          heading={
          <h2 id="all-sevas-title" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {tr.sevas_all_title}
          </h2>
          }
          search={
          <label className="relative block w-full">
            <span className="sr-only">{tr.sevas_search}</span>
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search"
              value={query}
              onFocus={ensureLoaded}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr.sevas_search}
              className="min-h-11 w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 min-h-11 min-w-11 grid place-items-center rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label={tr.sevas_clear_search}
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          }
        >
        <div className="grid gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-parchment)] p-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <span className="shrink-0 px-1">{tr.sevas_filter_category}</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--color-line-strong)] bg-white px-3 py-2 font-normal text-[var(--color-text-primary)] outline-none focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)] sm:max-w-sm"
            >
              <option value="">{tr.sevas_all_categories}</option>
              {categories.map(([key, label]) => <option key={key} value={key}>{localized(label, lang)}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">{tr.sevas_filter_deity}
            <select value={deityFilter} onChange={(event) => setDeityFilter(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-[var(--color-line-strong)] bg-white px-3 font-normal">
              <option value="">{tr.sevas_all_deities}</option>
              {deities.map(([key, label]) => <option key={key} value={key}>{localized(label, lang)}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">{tr.sevas_amount_min}
            <input type="number" min="0" step="any" value={minimum} onChange={(event) => setMinimum(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-[var(--color-line-strong)] bg-white px-3 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-semibold">{tr.sevas_amount_max}
            <input type="number" min={minimum || "0"} step="any" value={maximum} onChange={(event) => setMaximum(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-[var(--color-line-strong)] bg-white px-3 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-semibold">{tr.sevas_sort}
            <select value={amountOrder} onChange={(event) => setAmountOrder(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-[var(--color-line-strong)] bg-white px-3 font-normal">
              <option value="">{tr.sevas_sort_default}</option>
              <option value="ascending">{tr.sevas_sort_ascending}</option>
              <option value="descending">{tr.sevas_sort_descending}</option>
            </select>
          </label>
          {(categoryFilter || deityFilter || minimum || maximum || query || amountOrder) && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-11 self-start rounded-full px-3 py-2 text-xs font-semibold text-[var(--color-text-brand)] hover:bg-white sm:self-auto"
            >
              {tr.sevas_clear_filters}
            </button>
          )}
        </div>
        </AdvancedFilters>

        <p role="status" aria-live="polite" className="mt-4 text-xs text-[var(--color-text-secondary)]">
          {tr.sevas_results_template.replace("{n}", String(visibleSevas.length))}
        </p>
        {visibleSevas.length > 0 ? (
          <>
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedSevas.map((seva) => (
                <SevaCard
                  key={seva.id}
                  seva={seva}
                  lang={lang}
                  anyAmount={tr.sevas_any_amount}
                  onOpen={() => setSelectedSeva(seva)}
                />
              ))}
            </div>
            {visibleSevas.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + collectionPagination.loadIncrement)}
                  className="min-h-11 rounded-full border border-[var(--color-saffron-600)] bg-white px-6 py-2.5 font-body text-sm font-semibold text-[var(--color-text-brand)] shadow-xs transition hover:bg-[var(--color-saffron-50)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  {tr.sevas_show_more || tr.show_more}
                </button>
              </div>
            )}
          </>
        ) : (
          <CollectionEmptyState>
            <h3 className="font-display text-xl text-[var(--color-text-primary)]">{tr.sevas_empty_title}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{tr.sevas_empty_sub}</p>
            <button type="button" onClick={clearFilters} className="mt-3 min-h-11 px-4 font-semibold text-[var(--color-text-brand)]">{tr.sevas_clear_filters}</button>
          </CollectionEmptyState>
        )}
      </section>

      {selectedSeva && <SevaModal seva={selectedSeva} lang={lang} onClose={() => setSelectedSeva(null)} />}
    </>
  );
}
