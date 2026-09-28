"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { defaultContentMode, defaultLang } from "@/gen/content";
import {
  alternateParamparaByLanguage,
  paramparaByLanguage,
} from "@/gen/parampara/data";

export default function ParamparaDetailPage({ id }: { id: string }) {
  const { lang, tr, contentMode } = useLang();
  const parampara = contentMode !== defaultContentMode && alternateParamparaByLanguage
    ? alternateParamparaByLanguage
    : paramparaByLanguage;
  const labels = tr.pages.parampara;
  const gurus = parampara[lang] ?? parampara[defaultLang] ?? [];
  const index = gurus.findIndex((guru) => guru.id === id);
  const guru = index >= 0 ? gurus[index] : null;

  if (!guru) return null;

  const positionLabel = guru.officialPosition === null
    ? labels.founder
    : `${labels.position} ${guru.officialPosition}`;
  const previousGuru = gurus[index - 1];
  const nextGuru = gurus[index + 1];

  return (
    <main className="mx-auto max-w-6xl px-4 py-7 lg:px-8 lg:py-12">
      <Link
        href="/history/parampara#parampara-lineage"
        className="mb-8 inline-flex min-h-10 items-center gap-2 font-body text-sm font-semibold text-[var(--color-text-brand)] hover:text-[var(--color-saffron-700)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-saffron-600)]"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        {labels.back_to_lineage}
      </Link>

      <article className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-[var(--color-line)] pb-7 lg:mb-10 lg:pb-9">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)]">
            {positionLabel}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl">
            {guru.name}
          </h1>
          {guru.timePeriod && (
            <p className="mt-2 font-body text-sm text-[var(--color-text-muted)]">
              {guru.timePeriod}
            </p>
          )}
        </header>

        <div className={guru.fullImage ? "grid items-start gap-8 md:grid-cols-[minmax(220px,320px)_1fr] lg:gap-12" : "mx-auto max-w-3xl"}>
          {guru.fullImage && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden bg-[var(--color-saffron-50)]">
              <Image
                src={guru.fullImage}
                alt={guru.name}
                fill
                sizes="(max-width: 767px) min(82vw, 320px), 320px"
                className="object-contain"
              />
            </div>
          )}

          <div className="min-w-0">
            <p className="font-body text-base leading-[1.85] text-[var(--color-text-secondary)]">
              {guru.summary}
            </p>
            <section
              aria-label={labels.details}
              className="mt-8 border-t border-[var(--color-line)] pt-7 font-body text-[15px] leading-[1.85] text-[var(--color-text-secondary)] [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--color-text-primary)] [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_p]:mt-4"
            >
              {guru.detailsHtml ? (
                <div dangerouslySetInnerHTML={{ __html: guru.detailsHtml }} />
              ) : (
                <p className="border-l-2 border-[var(--color-saffron-400)] pl-4 text-[var(--color-text-muted)]">
                  {labels.details_placeholder}
                </p>
              )}
            </section>
          </div>
        </div>

        {(previousGuru || nextGuru) && (
          <nav
            aria-label={labels.guru_navigation}
            className="mt-12 grid grid-cols-2 gap-3 border-t border-[var(--color-line)] pt-5"
          >
            {previousGuru ? (
              <Link
                href={`/history/parampara/${encodeURIComponent(previousGuru.id)}`}
                className="flex min-h-14 items-center gap-2 rounded-[8px] border border-[var(--color-line)] px-4 font-body text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-saffron-400)] hover:text-[var(--color-text-brand)]"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                <span>{labels.previous}</span>
              </Link>
            ) : <span />}
            {nextGuru && (
              <Link
                href={`/history/parampara/${encodeURIComponent(nextGuru.id)}`}
                className="flex min-h-14 items-center justify-end gap-2 rounded-[8px] border border-[var(--color-line)] px-4 text-right font-body text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-saffron-400)] hover:text-[var(--color-text-brand)]"
              >
                <span>{labels.next}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}
      </article>
    </main>
  );
}