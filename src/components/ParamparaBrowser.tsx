"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, UserRound, X } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/context/LanguageContext";
import {
  alternateParamparaByLanguage,
  paramparaByLanguage,
  type ParamparaGuru,
} from "@/gen/parampara/data";
import { defaultContentMode } from "@/gen/content";

export default function ParamparaBrowser() {
  const { lang, tr, contentMode } = useLang();
  const parampara = contentMode !== defaultContentMode && alternateParamparaByLanguage
    ? alternateParamparaByLanguage
    : paramparaByLanguage;
  const labels = tr.pages.parampara;
  const lineage = parampara[lang] ?? parampara.en ?? [];
  const founder = lineage.find((guru) => guru.officialPosition === null) ?? null;
  const gurus = lineage.filter((guru) => guru.officialPosition !== null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIndex = gurus.findIndex((guru) => guru.id === selectedId);
  const selected = selectedIndex >= 0 ? gurus[selectedIndex] : null;
  useEffect(() => {
    const selectFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
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

  useEffect(() => {
    if (!selected) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGuru();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  const positionLabel = (guru: ParamparaGuru) => guru.officialPosition === null
    ? labels.founder
    : `${labels.position} ${guru.officialPosition}`;

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-7 lg:py-12">
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
                <div className="relative aspect-square w-36 overflow-hidden rounded-full bg-[var(--color-saffron-50)] sm:w-40 lg:w-[210px]">
                  <Image
                    src={founder.fullImage}
                    alt={founder.name}
                    fill
                    sizes="(max-width: 640px) 144px, (max-width: 1024px) 160px, 210px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-brand)]">
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
          {gurus.map((guru) => (
            <button
              key={guru.id}
              type="button"
              onClick={() => openGuru(guru)}
              aria-pressed={selected?.id === guru.id}
              className="group grid h-32 grid-cols-[80px_1fr] overflow-hidden text-left bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] shadow-[var(--shadow-xs)] hover:border-[var(--color-saffron-400)] hover:shadow-[var(--shadow-md)] aria-pressed:border-[var(--color-saffron-600)] aria-pressed:bg-[var(--color-saffron-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)] transition-[border-color,box-shadow,background-color]"
            >
              <span className="relative block h-32 w-20 overflow-hidden bg-[var(--color-saffron-50)]">
                {guru.thumbnailImage ? (
                  <Image
                    src={guru.thumbnailImage}
                    alt={guru.name}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-[var(--color-saffron-400)]">
                    <UserRound size={34} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-col p-3.5">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)] mb-2">
                  {positionLabel(guru)}
                </span>
                <span className="font-display text-[17px] lg:text-[18px] font-bold leading-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-text-brand)] transition-colors">
                  {guru.name}
                </span>
                {guru.timePeriod && (
                  <span className="font-body text-[11px] text-[var(--color-text-muted)] mt-1">
                    {guru.timePeriod}
                  </span>
                )}
                <span className="mt-auto pt-3 font-body text-[12px] leading-[1.5] text-[var(--color-text-secondary)] line-clamp-2">
                  {guru.summary}
                </span>
              </span>
            </button>
          ))}
          </div>
        </section>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-[9000] flex items-end justify-center bg-[var(--color-ink-900)]/70 sm:items-center sm:p-5"
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
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)]">
                    {positionLabel(selected)}
                  </p>
                  <h2 id="parampara-dialog-title" className="mt-1 truncate font-display text-xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-2xl">
                    {selected.name}
                  </h2>
                  {selected.timePeriod && (
                    <p className="mt-1 font-body text-xs text-[var(--color-text-muted)]">{selected.timePeriod}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeGuru}
                  aria-label={labels.close}
                  title={labels.close}
                  className="grid size-10 shrink-0 place-items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  <X size={21} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
              <div className={selected.fullImage ? "mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(220px,300px)_1fr] lg:gap-10" : "mx-auto max-w-3xl"}>
                {selected.fullImage && (
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-[var(--color-saffron-50)]">
                    <Image
                      src={selected.fullImage}
                      alt={selected.name}
                      fill
                      sizes="(max-width: 767px) min(76vw, 300px), 300px"
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <p className="font-body text-[14px] leading-[1.8] text-[var(--color-text-secondary)] sm:text-[15px]">
                    {selected.summary}
                  </p>
                  <Link
                    href={`/history/parampara/${encodeURIComponent(selected.id)}`}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-saffron-600)] px-5 font-body text-[13px] font-bold text-[var(--color-text-on-brand)] hover:bg-[var(--color-saffron-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
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

      <SiteFooter />
    </>
  );
}
