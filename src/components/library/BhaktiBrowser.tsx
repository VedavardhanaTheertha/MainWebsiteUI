"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useLazyMiniSearch } from "@/hooks/useMiniSearch";
import { bhaktiContentLoaders, loadBhaktiSearchIndex } from "@/gen/bhakti/loaders";

export interface BhaktiItem {
  id: string;
  title: string;
  titleKn?: string;
  titleEn?: string;
  kruti: string;
  krutiKn: string;
  ankita: string;
  ankitaKn: string;
  searchText?: string;
  html?: string;
  htmlKn?: string;
  htmlEn?: string;
}

interface SongContent {
  html: string;
  htmlKn?: string;
  htmlEn?: string;
}

export default function BhaktiBrowser({ items }: { items: BhaktiItem[] }) {
  const { lang, tr } = useLang();
  const copy = tr.library.bhakti.page;
  const isKn = lang === "kn";
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState(6);
  const [prevQuery, setPrevQuery] = useState(deferredQuery);

  if (prevQuery !== deferredQuery) {
    setPrevQuery(deferredQuery);
    setVisibleCount(6);
  }
  const [expanded, setExpanded] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadedContent, setLoadedContent] = useState<Record<string, SongContent>>({});

  const bhaktiSearchConfig = useMemo(
    () => ({
      fields: [
        "title",
        "titleKn",
        "titleEn",
        "kruti",
        "krutiKn",
        "ankita",
        "ankitaKn",
        "searchText",
      ],
      boost: {
        title: 3,
        titleKn: 3,
        titleEn: 3,
        ankita: 2,
        ankitaKn: 2,
        kruti: 1.5,
        krutiKn: 1.5,
      },
      extractField: (item: BhaktiItem, field: string) => {
        const val = (item as unknown as Record<string, unknown>)[field];
        return val != null ? String(val) : "";
      },
    }),
    []
  );

  const { results: filtered, ensureLoaded } = useLazyMiniSearch(
    items,
    deferredQuery,
    loadBhaktiSearchIndex,
    bhaktiSearchConfig
  );

  const visible = filtered.slice(0, visibleCount);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const selectedContent = selected ? loadedContent[selected.id] : null;
  const currentHtml = selected
    ? isKn
      ? selected.htmlKn || selectedContent?.htmlKn || selected.html || selectedContent?.html || null
      : selected.htmlEn || selectedContent?.htmlEn || selected.html || selectedContent?.html || null
    : null;

  const loadSongContent = useCallback((id: string) => {
    setLoadedContent((prev) => {
      if (prev[id]) return prev;
      const item = items.find((i) => i.id === id);
      if (item?.html || item?.htmlKn || item?.htmlEn) {
        return {
          ...prev,
          [id]: {
            html: item.html || "",
            htmlKn: item.htmlKn,
            htmlEn: item.htmlEn,
          },
        };
      }
      const loader = bhaktiContentLoaders[id];
      if (loader) {
        loader()
          .then((mod) => {
            setLoadedContent((current) => ({
              ...current,
              [id]: {
                html: mod.html,
                htmlKn: mod.htmlKn,
                htmlEn: mod.htmlEn,
              },
            }));
          })
          .catch((err) => {
            console.error("Failed to load bhakti content:", err);
          });
      }
      return prev;
    });
  }, [items]);

  useEffect(() => {
    const selectFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
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
    setSelectedId(item.id);
    setExpanded(false);
    loadSongContent(item.id);
    window.history.replaceState(null, "", `#${encodeURIComponent(item.id)}`);
    window.setTimeout(() => document.getElementById("bhakti-reading")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const prefetchItem = (id: string) => {
    if (!loadedContent[id] && bhaktiContentLoaders[id]) {
      bhaktiContentLoaders[id]()
        .then((mod) => {
          setLoadedContent((current) =>
            current[id]
              ? current
              : {
                  ...current,
                  [id]: {
                    html: mod.html,
                    htmlKn: mod.htmlKn,
                    htmlEn: mod.htmlEn,
                  },
                },
          );
        })
        .catch(() => {});
    }
  };

  const backToResults = () => {
    setSelectedId(null);
    setExpanded(true);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.setTimeout(() => document.getElementById("bhakti-results")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return (
    <div className="bg-[radial-gradient(circle_at_12%_8%,rgba(216,170,77,.1),transparent_28rem),linear-gradient(180deg,#fbf3e5_0%,#f7efe4_70%,#f5ecdf_100%)] px-4 py-4 text-[var(--color-text-primary)] sm:px-6">
      <section className="mx-auto max-w-[820px] text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-text-brand)]">{copy.eyebrow}</p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">{copy.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{copy.description}</p>
        <label className="mx-auto mt-3 flex h-11 max-w-[690px] items-center gap-3 rounded-full border border-[var(--color-line-strong)] bg-white/80 px-4 shadow-sm focus-within:border-[var(--color-saffron-400)] focus-within:ring-2 focus-within:ring-[var(--color-saffron-100)]">
          <span className="sr-only">{copy.search_label}</span>
          <Search aria-hidden="true" className="size-4 text-[var(--color-text-brand)]" />
          <input
            type="search"
            value={query}
            onFocus={ensureLoaded}
            onChange={(event) => { setQuery(event.target.value); setVisibleCount(6); }}
            placeholder={copy.search_placeholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </label>
      </section>

      <section id="bhakti-results" className="mx-auto mt-4 max-w-6xl border-t border-[var(--color-line-strong)] pt-3 scroll-mt-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-text-brand)]">{copy.collection}</p>
            <h2 className="mt-0.5 font-display text-xl">{copy.works}</h2>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white/50 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-white"
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
                    <strong className={`block pr-5 text-sm leading-relaxed ${isKn ? "font-kannada" : "font-sans font-semibold"}`}>
                      {isKn ? item.titleKn || item.title : item.titleEn || item.title}
                    </strong>
                    <span className="mt-1.5 block text-[11px] text-[var(--color-text-muted)]">
                      {copy.by}: {isKn ? item.krutiKn || item.kruti : item.kruti}
                    </span>
                    <span className="mt-2 block pr-6 text-[11px] text-[var(--color-text-brand)]">
                      {copy.ankita}: {isKn ? item.ankitaKn || item.ankita : item.ankita}
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
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="mx-auto mt-3 block rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-xs font-semibold text-[var(--color-text-brand)] hover:bg-white/60"
              >
                {copy.show_more || copy.show_all}
              </button>
            )}
          </>
        )}
      </section>

      {selected && (
        <section id="bhakti-reading" className="mx-auto mt-4 max-w-6xl scroll-mt-28 pt-2">
          <div className="flex items-center justify-between border-b border-[var(--color-line-strong)]">
            <button type="button" onClick={backToResults} className="py-3 text-xs font-semibold text-[var(--color-text-brand)] hover:underline">← {copy.back}</button>
            <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-text-brand)]">{copy.reading}</span>
          </div>
          {currentHtml ? (
            <article
              className={`bhakti-literature-content ${isKn ? "font-kannada" : "font-sans"}`}
              lang={lang}
              dangerouslySetInnerHTML={{ __html: currentHtml }}
            />
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-saffron-600)] border-t-transparent" />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
