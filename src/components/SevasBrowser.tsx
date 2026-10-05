"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  featuredSevaIds,
  realSevas,
  placeholderSevas,
  type LocalizedSevaText,
  type SevaRecord,
} from "@/gen/sevas/data";
import { loadSevasSearchIndex } from "@/gen/sevas/loaders";
import { useLazyMiniSearch } from "@/hooks/useMiniSearch";

function localized(value: LocalizedSevaText, lang: string) {
  return value[lang as keyof LocalizedSevaText] || value.en;
}

function amountLabel(seva: SevaRecord, lang: string, anyAmount: string) {
  if (seva.amount <= 0) return anyAmount;
  const configured = localized(seva.formattedAmount, lang);
  return configured || new Intl.NumberFormat(lang === "kn" ? "kn-IN" : "en-IN", {
    style: "currency",
    currency: seva.currency,
    maximumFractionDigits: 0,
  }).format(seva.amount);
}

function SevaImage({ title, featured = false }: { title: string; featured?: boolean }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-[var(--color-saffron-100)] ${featured ? "h-40 w-full" : "h-20 w-20 rounded-lg"}`}>
      <Image
        src="/icons/seva-placeholder.svg"
        alt=""
        fill
        sizes={featured ? "(max-width: 768px) 85vw, 33vw" : "80px"}
        className="object-cover"
      />
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
      className="w-full bg-white border border-[var(--color-saffron-600)] rounded-xl p-3 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-3">
        <SevaImage title={title} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-[var(--color-text-primary)] leading-snug">{title}</h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-1">{localized(seva.deity, lang)}</p>
          {amount && <p className="mt-2 font-body font-bold text-[var(--color-text-brand)]">{amount}</p>}
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
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[var(--color-text-primary)] shadow"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto">
          <SevaImage title={title} featured />
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
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{localized(seva.description, lang)}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{tr.sevas_significance}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{localized(seva.significance, lang)}</p>
            </div>

            <div
              className="mt-5 max-w-none border-t border-[var(--color-line)] pt-5 text-sm leading-relaxed text-[var(--color-text-secondary)] [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--color-text-primary)] [&_li]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selectedSeva, setSelectedSeva] = useState<SevaRecord | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [prevFilter, setPrevFilter] = useState({ cat: categoryFilter, query });

  if (prevFilter.cat !== categoryFilter || prevFilter.query !== query) {
    setPrevFilter({ cat: categoryFilter, query });
    setVisibleCount(6);
  }
  const searchId = useId();

  const activeSevas = contentMode === "placeholder" ? placeholderSevas : realSevas;

  const featured = useMemo(
    () => featuredSevaIds.map((id) => activeSevas.find((seva) => seva.id === id)).filter((seva): seva is SevaRecord => Boolean(seva)),
    [activeSevas],
  );
  const categories = useMemo(
    () => Array.from(new Map(activeSevas.map((seva) => [seva.category.code, seva.category])).entries())
      .sort((left, right) => localized(left[1], lang).localeCompare(localized(right[1], lang))),
    [activeSevas, lang],
  );
  const searchConfig = useMemo(
    () => ({ fields: ["searchText"] as (keyof SevaRecord)[], boost: { searchText: 1 } }),
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
    return source.filter((seva) => !categoryFilter || seva.category.code === categoryFilter);
  }, [activeSevas, categoryFilter, query, searchResults]);

  const displayedSevas = useMemo(
    () => visibleSevas.slice(0, visibleCount),
    [visibleSevas, visibleCount],
  );

  return (
    <>
      <section className="bg-[var(--color-cream)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="featured-sevas-title">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[var(--color-text-brand)]">{tr.sevas_featured_label}</p>
          <h2 id="featured-sevas-title" className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)]">{tr.sevas_featured_title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {featured.map((seva) => {
              const title = localized(seva.title, lang);
              const amount = amountLabel(seva, lang, tr.sevas_any_amount);
              return (
                <button
                  type="button"
                  key={seva.id}
                  onClick={() => setSelectedSeva(seva)}
                  className="overflow-hidden rounded-xl border border-[var(--color-saffron-600)] bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <SevaImage title={title} featured />
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{localized(seva.description, lang)}</p>
                    {amount && <p className="mt-3 font-bold text-[var(--color-text-brand)]">{amount}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12" aria-labelledby="all-sevas-title">
        <h2 id="all-sevas-title" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">{tr.sevas_all_title}</h2>

        <div className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-parchment)] p-4">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            <span className="mb-1.5 block">{tr.sevas_filter_category}</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-saffron-600)] bg-white px-3 py-2.5 font-normal text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-saffron-600)]/20"
            >
              <option value="">{tr.sevas_all_categories}</option>
              {categories.map(([key, label]) => <option key={key} value={key}>{localized(label, lang)}</option>)}
            </select>
          </label>
          {categoryFilter && (
            <button
              type="button"
              onClick={() => setCategoryFilter("")}
              className="mt-3 text-xs font-semibold text-[var(--color-text-brand)] underline"
            >
              {tr.sevas_clear_filters}
            </button>
          )}
        </div>

        <div className="relative mt-5">
          <label htmlFor={searchId} className="sr-only">{tr.sevas_search}</label>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            id={searchId}
            type="search"
            value={query}
            onFocus={ensureLoaded}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr.sevas_search}
            className="w-full rounded-full border border-[var(--color-saffron-600)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-saffron-600)]/20"
          />
        </div>

        <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
          {tr.sevas_results_template.replace("{n}", String(visibleSevas.length))}
        </p>
        {visibleSevas.length > 0 ? (
          <>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedSevas.map((seva) => (
                <SevaCard key={seva.id} seva={seva} lang={lang} anyAmount={tr.sevas_any_amount} onOpen={() => setSelectedSeva(seva)} />
              ))}
            </div>
            {visibleSevas.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="rounded-full border border-[var(--color-saffron-600)] bg-white px-6 py-2.5 font-body text-sm font-semibold text-[var(--color-text-brand)] shadow-xs transition hover:bg-[var(--color-saffron-50)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  {tr.sevas_show_more || tr.show_more}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <h3 className="font-display text-xl text-[var(--color-text-primary)]">{tr.sevas_empty_title}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{tr.sevas_empty_sub}</p>
          </div>
        )}
      </section>

      {selectedSeva && <SevaModal seva={selectedSeva} lang={lang} onClose={() => setSelectedSeva(null)} />}
    </>
  );
}
