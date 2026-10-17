"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useLazyMiniSearch } from "@/hooks/useMiniSearch";
import { getSearchProfile } from "@/lib/search";
import { bhaktiReaderSettings, collectionPagination } from "@/gen/settings/ui-elements";
import { bhaktiContentLoaders, bhaktiPresentation, loadBhaktiSearchIndex } from "@/gen/bhakti/loaders";
import { localized, localizedText } from "@/lib/localization";
import { copyReaderLink, matchesBhaktiFilter } from "@/lib/reader-utils";
import "./bhakti-print.css";
import AdvancedFilters from "@/components/AdvancedFilters";

export interface BhaktiItem {
  id: string;
  title: string;
  kruti: string;
  ankita: string;
  localized: Record<string, { title: string; kruti: string; ankita: string }>;
  searchFields?: Record<string, string>;
  compositionType?: string;
  searchText?: string;
  html?: string;
  localizedHtml?: Record<string, string>;
}

interface SongContent {
  html: string;
  localizedHtml?: Record<string, string>;
}

export default function BhaktiBrowser({ items }: { items: BhaktiItem[] }) {
  const { lang, tr } = useLang();
  const copy = tr.library.bhakti.page;
  const controls = tr.bhakti_controls;
  const presentation = localized(bhaktiPresentation, lang);
  const display = (item: BhaktiItem) => localized(item.localized, lang) ?? item;
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [ankita, setAnkita] = useState("");
  const [compositionType, setCompositionType] = useState("");
  const [readingSize, setReadingSize] = useState<number>(bhaktiReaderSettings.initialSize);
  const [linkStatus, setLinkStatus] = useState("");
  const [loadFailures, setLoadFailures] = useState<Record<string, boolean>>({});
  const pendingLoads = useRef(new Map<string, Promise<void>>());
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const filterKey = JSON.stringify([deferredQuery, composer, ankita, compositionType]);
  const [prevQuery, setPrevQuery] = useState(filterKey);

  if (prevQuery !== filterKey) {
    setPrevQuery(filterKey);
    setVisibleCount(collectionPagination.initialVisible);
  }
  const [expanded, setExpanded] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadedContent, setLoadedContent] = useState<Record<string, SongContent>>({});

  const bhaktiSearchConfig = useMemo(
    () => ({
      ...getSearchProfile("bhakti"),
      extractField: (item: BhaktiItem, field: string) => {
        const val = item.searchFields?.[field] ?? item[field as keyof BhaktiItem];
        return val != null ? String(val) : "";
      },
    }),
    []
  );

  const { results: searched, ensureLoaded } = useLazyMiniSearch(
    items,
    deferredQuery,
    loadBhaktiSearchIndex,
    bhaktiSearchConfig
  );

  const filtered = searched.filter((item) => matchesBhaktiFilter(item, composer, ankita, compositionType));
  const composers = useMemo(() => [...new Set(items.map((item) => item.kruti).filter(Boolean))].sort(), [items]);
  const ankitas = useMemo(() => [...new Set(items.map((item) => item.ankita).filter(Boolean))].sort(), [items]);
  const compositionTypes = useMemo(() => [...new Set(items.map((item) => item.compositionType).filter((value): value is string => Boolean(value)))].sort(), [items]);
  const visible = filtered.slice(0, visibleCount);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const selectedContent = selected ? loadedContent[selected.id] : null;
  const currentHtml = selected
    ? localizedText(selected.localizedHtml, lang) || localizedText(selectedContent?.localizedHtml, lang) ||
      selected.html || selectedContent?.html || null
    : null;

  const loadSongContent = useCallback((id: string) => {
    if (pendingLoads.current.has(id)) return;
    const item = items.find((candidate) => candidate.id === id);
    const inlineContent = item && (item.html || Object.values(item.localizedHtml ?? {}).some(Boolean));
    const loader = bhaktiContentLoaders[id];
    setLoadFailures((current) => ({ ...current, [id]: false }));
    const pending = Promise.resolve().then(async () => {
      const content = inlineContent
        ? { html: item.html || "", localizedHtml: item.localizedHtml }
        : loader ? await loader() : null;
      if (!content || !(content.html || Object.values(content.localizedHtml ?? {}).some(Boolean))) throw new Error();
      setLoadedContent((current) => ({ ...current, [id]: content }));
    }).catch(() => {
      setLoadFailures((current) => ({ ...current, [id]: true }));
      pendingLoads.current.delete(id);
    });
    pendingLoads.current.set(id, pending);
  }, [items]);

  useEffect(() => {
    const selectFromHash = () => {
      let id = "";
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { /* Ignore malformed external links. */ }
      setLinkStatus("");
      if (id && items.some((item) => item.id === id)) {
        setSelectedId(id);
        setExpanded(false);
        loadSongContent(id);
      } else {
        setSelectedId(null);
      }
    };
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, [items, loadSongContent]);

  const selectItem = (item: BhaktiItem) => {
    setLinkStatus("");
    setSelectedId(item.id);
    setExpanded(false);
    loadSongContent(item.id);
    window.history.replaceState(null, "", `#${encodeURIComponent(item.id)}`);
    window.setTimeout(() => document.getElementById("bhakti-reading")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const prefetchItem = (id: string) => {
    if (!loadedContent[id]) loadSongContent(id);
  };

  const backToResults = () => {
    setSelectedId(null);
    setExpanded(true);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.setTimeout(() => document.getElementById("bhakti-results")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return (
    <div className="bhakti-reader-page bg-[radial-gradient(circle_at_12%_8%,rgba(216,170,77,.1),transparent_28rem),linear-gradient(180deg,#fbf3e5_0%,#f7efe4_70%,#f5ecdf_100%)] px-4 py-4 text-[var(--color-text-primary)] sm:px-6">
      <section className="mx-auto max-w-[820px] text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-text-brand)]">{copy.eyebrow}</p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">{copy.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{copy.description}</p>
        <div className="mx-auto mt-3 max-w-[690px]">
        <AdvancedFilters active={Boolean(composer || ankita || compositionType)} search={
        <label className="flex h-11 items-center gap-3 rounded-full border border-[var(--color-line-strong)] bg-white/80 px-4 shadow-sm focus-within:border-[var(--color-saffron-400)] focus-within:ring-2 focus-within:ring-[var(--color-saffron-100)]">
          <span className="sr-only">{copy.search_label}</span>
          <Search aria-hidden="true" className="size-4 text-[var(--color-text-brand)]" />
          <input
            type="search"
            value={query}
            onFocus={ensureLoaded}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(collectionPagination.initialVisible);
            }}
            placeholder={copy.search_placeholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </label>
        }>
        <div className="flex flex-wrap gap-3 text-left text-sm">
          <label className="flex-1 min-w-40">
            <span className="block mb-1">{controls.composer}</span>
            <select value={composer} onChange={(event) => setComposer(event.target.value)} className="min-h-11 w-full rounded border border-[var(--color-line)] bg-white px-2">
              <option value="">{controls.all}</option>
              {composers.map((value) => <option key={value} value={value}>
                {display(items.find((item) => item.kruti === value)!).kruti || value}
              </option>)}
            </select>
          </label>
          <label className="flex-1 min-w-40">
            <span className="block mb-1">{controls.ankita}</span>
            <select value={ankita} onChange={(event) => setAnkita(event.target.value)} className="min-h-11 w-full rounded border border-[var(--color-line)] bg-white px-2">
              <option value="">{controls.all}</option>
              {ankitas.map((value) => <option key={value} value={value}>
                {display(items.find((item) => item.ankita === value)!).ankita || value}
              </option>)}
            </select>
          </label>
          <label className="flex-1 min-w-40">
            <span className="block mb-1">{controls.composition_type}</span>
            <select value={compositionType} onChange={(event) => setCompositionType(event.target.value)}
              disabled={!compositionTypes.length} aria-describedby={!compositionTypes.length ? "bhakti-type-note" : undefined}
              className="min-h-11 w-full rounded border border-[var(--color-line)] bg-white px-2 disabled:opacity-60">
              <option value="">{controls.all}</option>
              {compositionTypes.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          {!compositionTypes.length && <p id="bhakti-type-note" className="w-full text-xs text-[var(--color-text-secondary)]">{controls.type_unavailable}</p>}
          {(query || composer || ankita || compositionType) && <button type="button" className="min-h-11 px-3 underline" onClick={() => {
            setQuery(""); setComposer(""); setAnkita(""); setCompositionType("");
          }}>{controls.clear_filters}</button>}
        </div>
        </AdvancedFilters>
        </div>
      </section>

      <section id="bhakti-results" className="mx-auto mt-4 max-w-6xl border-t border-[var(--color-line-strong)] pt-3 scroll-mt-28">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">{copy.works}</h2>
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
                {visible.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => prefetchItem(item.id)}
                    onFocus={() => prefetchItem(item.id)}
                    className="group relative min-h-30 overflow-hidden rounded-lg border border-[var(--color-line-strong)] bg-white/75 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-gold-500)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                  >
                    <span className="absolute left-4 top-0 h-[3px] w-8 bg-[var(--color-gold-500)]" />
                    <strong className={`block pr-5 text-sm leading-relaxed ${presentation?.title_class}`}>
                      {display(item).title}
                    </strong>
                    <span className="mt-1.5 block text-[11px] text-[var(--color-text-muted)]">
                      {copy.by}: {display(item).kruti}
                    </span>
                    <span className="mt-2 block pr-6 text-[11px] text-[var(--color-text-brand)]">
                      {copy.ankita}: {display(item).ankita}
                    </span>
                    <span aria-hidden="true" className="absolute bottom-3 right-3 grid size-5 place-items-center rounded-full bg-[var(--color-saffron-600)] text-xs text-white">→</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-[var(--color-line)] bg-white/50 p-8 text-center text-sm text-[var(--color-text-secondary)]">{copy.no_results}</p>
            )}
            {filtered.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + collectionPagination.loadIncrement)}
                className="mx-auto mt-3 block min-h-11 rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-xs font-semibold text-[var(--color-text-brand)] hover:bg-white/60"
              >
                {copy.show_more || copy.show_all}
              </button>
            )}
          </>
        )}
      </section>

      {selected && (
        <section id="bhakti-reading" className="mx-auto mt-4 max-w-6xl scroll-mt-28 pt-2">
          <div className="bhakti-reading-controls flex items-center justify-between border-b border-[var(--color-line-strong)]">
            <button type="button" onClick={backToResults} className="min-h-11 py-3 text-xs font-semibold text-[var(--color-text-brand)] hover:underline">← {copy.back}</button>
            <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-text-brand)]">{copy.reading}</span>
          </div>
          <div className="bhakti-reading-controls flex flex-wrap items-center gap-3 py-3 text-sm">
            <label className="flex min-h-11 items-center gap-2">
              {controls.reading_size}
              <input type="range" min={bhaktiReaderSettings.minSize} max={bhaktiReaderSettings.maxSize} step={bhaktiReaderSettings.step} value={readingSize}
                onChange={(event) => setReadingSize(Number(event.target.value))} className="min-h-11 w-28" />
              <output>{readingSize}%</output>
            </label>
            <button type="button" disabled={!currentHtml} onClick={() => window.print()}
              className="min-h-11 rounded border border-[var(--color-line)] px-3 disabled:opacity-50">{controls.print}</button>
            <button type="button" onClick={async () => setLinkStatus(
              await copyReaderLink(window.location.href) ? controls.copied : controls.copy_failed,
            )} className="min-h-11 rounded border border-[var(--color-line)] px-3">{controls.copy_link}</button>
            <p role="status">{linkStatus}</p>
          </div>
          {currentHtml ? (
            <article
              className={`bhakti-literature-content ${presentation?.reader_class}`}
              lang={lang}
              style={{ fontSize: `${0.95 * readingSize / 100}rem` }}
              dangerouslySetInnerHTML={{ __html: currentHtml }}
            />
          ) : loadFailures[selected.id] ? (
            <div role="alert" className="py-12 text-center">
              <p>{controls.load_failed}</p>
              <button type="button" onClick={() => loadSongContent(selected.id)}
                className="min-h-11 mt-3 rounded border border-[var(--color-line)] px-4">{controls.retry}</button>
            </div>
          ) : (
            <div role="status" className="flex items-center justify-center gap-3 py-16">
              <div aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-saffron-600)] border-t-transparent" />
              {controls.loading}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
