"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUiSettings } from "@/context/UiSettingsContext";
import ContentImage from "@/components/presentation/ContentImage";
import { ChevronLeft, ChevronRight, GitBranch, List, UserRound, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  alternateParamparaByLanguage,
  alternateParamparaIntro,
  paramparaByLanguage,
  paramparaIntro,
  type ParamparaGuru,
} from "@/gen/parampara/data";
import { defaultContentMode, defaultLang } from "@/gen/content";
import { useDialog } from "@/hooks/useDialog";
import { useMiniSearch } from "@/hooks/useMiniSearch";
import ParamparaRelatedLinks, { type ParamparaRelatedContent } from "@/components/ParamparaRelatedLinks";

export interface ParamparaBrowserProps {
  showSearch?: boolean;
  showViewSwitch?: boolean;
  initialView?: "timeline" | "list";
  embedded?: boolean;
}

export default function ParamparaBrowser({
  showSearch = true,
  showViewSwitch = true,
  initialView,
  embedded = false,
}: ParamparaBrowserProps = {}) {
  const { lang, tr, contentMode } = useLang();
  const { browserDefaults } = useUiSettings();
  const parampara = contentMode !== defaultContentMode && alternateParamparaByLanguage
    ? alternateParamparaByLanguage
    : paramparaByLanguage;
  const rawIntro = contentMode !== defaultContentMode && alternateParamparaIntro
    ? alternateParamparaIntro
    : paramparaIntro;

  const activeIntro = useMemo(() => {
    if (!rawIntro) return null;
    return {
      title: rawIntro.title[lang] ?? rawIntro.title[defaultLang] ?? "",
      html: rawIntro.detailsHtml[lang] ?? rawIntro.detailsHtml[defaultLang] ?? "",
    };
  }, [rawIntro, lang]);
  const labels = tr.pages.parampara;
  const lineage = useMemo(() => parampara[lang] ?? parampara[defaultLang] ?? [], [parampara, lang]);
  const gurus = lineage;
  const [view, setView] = useState<"timeline" | "list">(initialView ?? browserDefaults.lineageView);
  const [query, setQuery] = useState("");
  const matches = useMiniSearch(gurus, query, { fields: ["name"] });
  const visibleGurus = useMemo(() => {
    const ids = new Set(matches.map((guru) => guru.id));
    return gurus.filter((guru) => ids.has(guru.id));
  }, [gurus, matches]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIndex = gurus.findIndex((guru) => guru.id === selectedId);
  const selected = selectedIndex >= 0 ? gurus[selectedIndex] : null;
  const previousGuru = selectedIndex > 0 ? gurus[selectedIndex - 1] : null;
  const nextGuru = selectedIndex >= 0 && selectedIndex < gurus.length - 1 ? gurus[selectedIndex + 1] : null;
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedId]);

  useEffect(() => {
    const selectFromHash = () => {
      let id = "";
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { /* Ignore malformed hashes. */ }
      setSelectedId(gurus.some((guru) => guru.id === id) ? id : null);
    };
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => {
      window.removeEventListener("hashchange", selectFromHash);
    };
  }, [gurus]);

  const openGuru = (guru: ParamparaGuru) => {
    setSelectedId(guru.id);
    window.history.replaceState(null, "", `#${encodeURIComponent(guru.id)}`);
  };

  const closeGuru = () => {
    setSelectedId(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const dialogRef = useDialog(Boolean(selected), closeGuru);


  const innerContent = (
    <div className="rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-cream-soft)]/92 p-4 shadow-sm backdrop-blur-md sm:p-6 lg:p-8">
      {!embedded && (
        <header className="mx-auto max-w-3xl mb-7 lg:mb-10 text-center">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-3">
            {labels.title}
          </h1>
          <p className="mx-auto max-w-2xl font-body text-[14px] lg:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            {labels.intro}
          </p>
        </header>
      )}

        {activeIntro && (
          <section className="mb-6 lg:mb-8">
            {activeIntro.title && (
              <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] lg:text-2xl mb-3">
                {activeIntro.title}
              </h2>
            )}
            <div
              className="space-y-3 font-body text-[14px] lg:text-[15px] leading-relaxed text-[var(--color-text-secondary)] [&>p]:mb-3 last:[&>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: activeIntro.html }}
            />
          </section>
        )}

        <section id="parampara-lineage" className="scroll-mt-28">
          <h2 className="mb-4 font-display text-xl font-bold text-[var(--color-text-primary)] lg:text-2xl">
            {labels.lineage}
          </h2>
          {(showSearch || showViewSwitch) && (
            <div className="mb-6 flex items-end gap-2 sm:max-w-md">
              {showSearch && (
                <label className="flex min-w-0 flex-1 flex-col gap-2 font-body text-sm">
                  {labels.search}
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-3" />
                </label>
              )}
              {showViewSwitch && (
                <button
                  type="button"
                  aria-label={view === "list" ? labels.show_timeline : labels.show_list}
                  title={view === "list" ? labels.show_timeline : labels.show_list}
                  aria-pressed={view === "timeline"}
                  onClick={() => setView((current) => current === "list" ? "timeline" : "list")}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-text-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  {view === "list" ? <GitBranch size={20} aria-hidden="true" /> : <List size={20} aria-hidden="true" />}
                </button>
              )}
            </div>
          )}
          {showSearch && !visibleGurus.length && <div role="status" className="py-8"><p>{labels.no_results}</p>{query && <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-11 text-[var(--color-text-brand)] underline">{labels.clear_search}</button>}</div>}
          <ol className={view === "timeline" ? "ml-3 space-y-2 sm:space-y-2.5 border-l-2 border-[var(--color-saffron-400)] pl-4 sm:pl-5" : "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-2.5"}>
          {visibleGurus.map((guru) => (
            <li key={guru.id} className={view === "timeline" ? "relative before:absolute before:-left-[23px] sm:before:-left-[27px] before:top-4 sm:before:top-4.5 before:size-3 before:rounded-full before:bg-[var(--color-saffron-600)]" : ""}>
            <button
              type="button"
              onClick={() => openGuru(guru)}
              aria-pressed={selected?.id === guru.id}
              className="group grid min-h-[72px] sm:min-h-[80px] w-full grid-cols-[64px_1fr] sm:grid-cols-[76px_1fr] overflow-hidden text-left bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl shadow-xs hover:-translate-y-0.5 hover:border-[var(--color-saffron-400)] hover:shadow-md aria-pressed:border-[var(--color-saffron-600)] aria-pressed:bg-[var(--color-saffron-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)] transition-all duration-200"
            >
              <span className="relative block h-full min-h-[72px] sm:min-h-[80px] w-16 sm:w-[76px] shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-gold-100),var(--color-cream-soft))] [&_.content-image-foreground]:transition-transform [&_.content-image-foreground]:duration-500 [&_.content-image-foreground]:ease-out group-hover:[&_.content-image-foreground]:scale-105">
                {guru.thumbnailImage ? (
                  <ContentImage
                    src={guru.thumbnailImage}
                    alt={guru.name}
                    fill
                    sizes={view === "timeline" ? "(max-width: 1280px) 100vw, 1152px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                  />
                ) : (
                  <span className="grid h-full place-items-center text-[var(--color-saffron-400)]">
                    <UserRound size={26} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-col justify-center px-3 py-2 sm:px-3.5 sm:py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="font-display text-[15px] sm:text-[16px] lg:text-[17px] font-bold leading-snug text-[var(--color-text-primary)] group-hover:text-[var(--color-text-brand)] transition-colors truncate">
                    {guru.name}
                  </span>
                  {guru.timePeriod && (
                    <span className="font-body text-xs text-[var(--color-text-muted)] shrink-0">
                      {guru.timePeriod}
                    </span>
                  )}
                </div>
                <span className="mt-1 font-body text-caption sm:text-xs leading-[1.4] sm:leading-[1.45] text-[var(--color-text-secondary)] line-clamp-1 sm:line-clamp-2">
                  {guru.summary}
                </span>
              </span>
            </button>
            </li>
          ))}
          </ol>
        </section>
      </div>
  );

  return (
    <>
      {embedded ? innerContent : (
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-7 lg:py-12">
          {innerContent}
        </div>
      )}

      {selected && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-[var(--color-ink-900)]/70 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="parampara-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeGuru();
          }}
        >
          <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--color-paper)] shadow-[var(--shadow-lg)] sm:h-[min(90dvh,820px)] sm:max-w-5xl sm:rounded-[12px]">
            <header className="shrink-0 border-b border-[var(--color-line)] px-4 pb-3 pt-4 sm:px-6 sm:pt-5 lg:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 id="parampara-dialog-title" className="mt-1 font-display text-xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-2xl lg:text-3xl">
                    {selected.name}
                  </h2>
                  {selected.timePeriod && (
                    <p className="mt-1 font-body text-meta text-[var(--color-text-muted)]">{selected.timePeriod}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeGuru}
                  aria-label={labels.close}
                  title={labels.close}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-cream-soft)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  <X size={21} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div
              ref={modalBodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
            >
              <div className={selected.fullImage ? "mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(220px,300px)_1fr] lg:gap-10" : "mx-auto max-w-3xl"}>
                {selected.fullImage && (
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-xl bg-[var(--color-saffron-50)]">
                    <ContentImage
                      src={selected.fullImage}
                      alt={selected.name}
                      fill
                      sizes="(max-width: 767px) min(76vw, 300px), 300px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-body text-base leading-[1.85] text-[var(--color-text-secondary)]">
                    {selected.summary}
                  </p>
                  <section
                    aria-label={labels.details}
                    className="mt-8 border-t border-[var(--color-line)] pt-7 font-body text-[15px] leading-[1.85] text-[var(--color-text-secondary)] [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--color-text-primary)] [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_p]:mt-4"
                  >
                    {selected.detailsHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: selected.detailsHtml }} />
                    ) : (
                      <p className="border-l-2 border-[var(--color-saffron-400)] pl-4 text-[var(--color-text-muted)]">
                        {labels.details_placeholder}
                      </p>
                    )}
                  </section>
                  <ParamparaRelatedLinks guru={selected as typeof selected & ParamparaRelatedContent} labels={labels} />
                </div>
              </div>

              {(previousGuru || nextGuru) && (
                <nav
                  aria-label={labels.guru_navigation}
                  className="mx-auto mt-10 max-w-4xl grid gap-3 border-t border-[var(--color-line)] pt-6 sm:grid-cols-2"
                >
                  {previousGuru ? (
                    <button
                      type="button"
                      onClick={() => openGuru(previousGuru)}
                      className="flex min-h-14 items-center gap-2 rounded-[8px] border border-[var(--color-line)] px-4 font-body text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-saffron-400)] hover:text-[var(--color-text-brand)] transition-colors text-left"
                    >
                      <ChevronLeft size={18} aria-hidden="true" className="shrink-0" />
                      <span className="min-w-0 truncate">
                        <span className="block text-meta text-[var(--color-text-muted)]">{labels.previous}</span>
                        {previousGuru.name}
                      </span>
                    </button>
                  ) : <span />}
                  {nextGuru && (
                    <button
                      type="button"
                      onClick={() => openGuru(nextGuru)}
                      className="flex min-h-14 items-center justify-end gap-2 rounded-[8px] border border-[var(--color-line)] px-4 text-right font-body text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-saffron-400)] hover:text-[var(--color-text-brand)] transition-colors"
                    >
                      <span className="min-w-0 truncate">
                        <span className="block text-meta text-[var(--color-text-muted)]">{labels.next}</span>
                        {nextGuru.name}
                      </span>
                      <ChevronRight size={18} aria-hidden="true" className="shrink-0" />
                    </button>
                  )}
                </nav>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
