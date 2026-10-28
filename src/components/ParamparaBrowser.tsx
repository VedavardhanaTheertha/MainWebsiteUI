"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUiSettings } from "@/context/UiSettingsContext";
import ContentImage from "@/components/presentation/ContentImage";
import { BookOpen, GitBranch, List, UserRound, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  alternateParamparaByLanguage,
  paramparaByLanguage,
  type ParamparaGuru,
} from "@/gen/parampara/data";
import { defaultContentMode, defaultLang } from "@/gen/content";
import { useDialog } from "@/hooks/useDialog";
import { useMiniSearch } from "@/hooks/useMiniSearch";

export default function ParamparaBrowser() {
  const { lang, tr, contentMode } = useLang();
  const { browserDefaults, presentationSettings } = useUiSettings();
  const parampara = contentMode !== defaultContentMode && alternateParamparaByLanguage
    ? alternateParamparaByLanguage
    : paramparaByLanguage;
  const labels = tr.pages.parampara;
  const lineage = useMemo(() => parampara[lang] ?? parampara[defaultLang] ?? [], [parampara, lang]);
  const founder = lineage.find((guru) => guru.officialPosition === null) ?? null;
  const gurus = useMemo(() => lineage.filter((guru) => guru.officialPosition !== null), [lineage]);
  const [view, setView] = useState<"timeline" | "list">(browserDefaults.lineageView);
  const [query, setQuery] = useState("");
  const matches = useMiniSearch(gurus, query, { fields: ["name"] });
  const visibleGurus = useMemo(() => {
    const ids = new Set(matches.map((guru) => guru.id));
    return gurus.filter((guru) => ids.has(guru.id));
  }, [gurus, matches]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIndex = gurus.findIndex((guru) => guru.id === selectedId);
  const selected = selectedIndex >= 0 ? gurus[selectedIndex] : null;
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

  const positionLabel = (guru: ParamparaGuru) => guru.officialPosition === null
    ? labels.founder
    : `${labels.position} ${guru.officialPosition}`;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-7 lg:py-12">
        <header className="max-w-2xl mb-7 lg:mb-10">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-3">
            {labels.title}
          </h1>
          <p className="font-body text-[14px] lg:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            {labels.intro}
          </p>
        </header>

        {founder && (
          <section className="mb-10 border-y border-[var(--color-line-strong)] py-7 lg:mb-14 lg:py-9">
            <div className="grid items-center gap-6 sm:grid-cols-[160px_1fr] lg:grid-cols-[210px_1fr] lg:gap-10">
              {founder.fullImage && (
                <div className="relative aspect-[4/5] w-36 overflow-hidden rounded-2xl bg-[var(--color-saffron-50)] sm:w-40 lg:w-[210px]">
                  <ContentImage
                    src={founder.fullImage}
                    alt={founder.name}
                    fill
                    sizes="(max-width: 640px) 144px, (max-width: 1024px) 160px, 210px"
                  />
                </div>
              )}
              <div>
                <p className="font-body text-badge font-bold uppercase tracking-[0.18em] text-[var(--color-text-brand)]">
                  {labels.founder}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-[var(--color-text-primary)] lg:text-4xl">
                  {founder.name}
                </h2>
                {founder.timePeriod && (
                  <p className="mt-1 font-body text-xs text-[var(--color-text-muted)]">{founder.timePeriod}</p>
                )}
                <p className="mt-4 max-w-3xl font-body text-[14px] leading-[1.75] text-[var(--color-text-secondary)] lg:text-[15px]">
                  {founder.summary}
                </p>
                {founder.detailsHtml && (
                  <div
                    className="mt-4 max-w-3xl space-y-4 font-body text-[14px] leading-[1.75] text-[var(--color-text-secondary)] lg:text-[15px]"
                    dangerouslySetInnerHTML={{ __html: founder.detailsHtml }}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        <section id="parampara-lineage" className="scroll-mt-28">
          <h2 className="mb-4 font-display text-xl font-bold text-[var(--color-text-primary)] lg:text-2xl">
            {labels.lineage}
          </h2>
          <div className="mb-6 flex items-end gap-2 sm:max-w-md">
            <label className="flex min-w-0 flex-1 flex-col gap-2 font-body text-sm">
              {labels.search}
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-3" />
            </label>
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
          </div>
          {!visibleGurus.length && <div role="status" className="py-8"><p>{labels.no_results}</p>{query && <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-11 text-[var(--color-text-brand)] underline">{labels.clear_search}</button>}</div>}
          <ol className={view === "timeline" ? "ml-3 space-y-4 border-l-2 border-[var(--color-saffron-400)] pl-5" : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
          {visibleGurus.map((guru) => (
            <li key={guru.id} className={view === "timeline" ? "relative before:absolute before:-left-[27px] before:top-6 before:size-3 before:rounded-full before:bg-[var(--color-saffron-600)]" : ""}>
            <button
              type="button"
              onClick={() => openGuru(guru)}
              aria-pressed={selected?.id === guru.id}
              className={`${guru.thumbnailImage ? "visual-tile " : ""}group grid min-h-36 w-full grid-cols-[80px_1fr] overflow-hidden text-left bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] shadow-[var(--shadow-xs)] hover:border-[var(--color-saffron-400)] hover:shadow-[var(--shadow-md)] aria-pressed:border-[var(--color-saffron-600)] aria-pressed:bg-[var(--color-saffron-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)] transition-[border-color,box-shadow,background-color]`}
            >
              <span className="visual-tile-art relative block h-full min-h-36 w-20 overflow-hidden bg-[var(--color-saffron-50)]">
                {guru.thumbnailImage ? (
                  <ContentImage
                    src={guru.thumbnailImage}
                    alt={guru.name}
                    fill
                    sizes={presentationSettings.imageBackedTiles
                      ? view === "timeline" ? "(max-width: 1280px) 100vw, 1152px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      : "80px"}
                  />
                ) : (
                  <span className="grid h-full place-items-center text-[var(--color-saffron-400)]">
                    <UserRound size={34} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="visual-tile-body flex min-w-0 flex-col p-3.5">
                <span className="font-body text-badge font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)] mb-2">
                  {positionLabel(guru)}
                </span>
                <span className="font-display text-[17px] lg:text-[18px] font-bold leading-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-text-brand)] transition-colors">
                  {guru.name}
                </span>
                {guru.timePeriod && (
                  <span className="font-body text-meta text-[var(--color-text-muted)] mt-1">
                    {guru.timePeriod}
                  </span>
                )}
                <span className="mt-auto pt-3 font-body text-caption leading-[1.5] text-[var(--color-text-secondary)] line-clamp-2">
                  {guru.summary}
                </span>
              </span>
            </button>
            </li>
          ))}
          </ol>
        </section>
      </div>

      {selected && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-[var(--color-ink-900)]/70 sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="parampara-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeGuru();
          }}
        >
          <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--color-paper)] shadow-[var(--shadow-lg)] sm:h-[min(90dvh,820px)] sm:max-w-5xl sm:rounded-[8px]">
            <header className="shrink-0 border-b border-[var(--color-line)] px-4 pb-0 pt-4 sm:px-6 sm:pt-5 lg:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-body text-badge font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)]">
                    {positionLabel(selected)}
                  </p>
                  <h2 id="parampara-dialog-title" className="mt-1 font-display text-xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-2xl">
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
                  className="grid size-11 shrink-0 place-items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  <X size={21} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
              <div className={selected.fullImage ? "mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(220px,300px)_1fr] lg:gap-10" : "mx-auto max-w-3xl"}>
                {selected.fullImage && (
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-[var(--color-saffron-50)]">
                    <ContentImage
                      src={selected.fullImage}
                      alt={selected.name}
                      fill
                      sizes="(max-width: 767px) min(76vw, 300px), 300px"
                    />
                  </div>
                )}
                <div>
                  <p className="font-body text-[14px] leading-[1.8] text-[var(--color-text-secondary)] sm:text-[15px]">
                    {selected.summary}
                  </p>
                  <Link
                    href={`/history/parampara/${encodeURIComponent(selected.id)}`}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-saffron-600)] px-5 font-body text-action-btn font-bold text-[var(--color-text-on-brand)] hover:bg-[var(--color-saffron-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
                  >
                    <BookOpen size={17} aria-hidden="true" />
                    {labels.see_more}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
