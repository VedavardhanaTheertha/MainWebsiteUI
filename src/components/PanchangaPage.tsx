"use client";

import { useLang } from "@/context/LanguageContext";

export default function PanchangaPage() {
  const { tr } = useLang();
  const copy = tr.pages.local_copy;
  return (
    <div className="max-w-2xl mx-auto px-4 pt-3.5 pb-6 sm:pt-4 lg:pb-10">
      <aside className="mb-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-cream-soft)]/50 p-4 text-sm text-[var(--color-text-secondary)]">{copy.panchanga_notice}</aside>
      <header className="mb-6 px-12 text-center sm:px-16 lg:px-0">
        <p className="font-body text-micro tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">{copy.panchanga_date}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-4xl">{copy.panchanga_title}</h1>
      </header>
      <div className="bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl shadow-xs mb-4 overflow-hidden">
        {["tithi", "nakshatra", "sunrise"].map((field) => (
          <div key={field} className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-[var(--color-line-soft)] last:border-0">
            <span className="text-sm text-[var(--color-text-secondary)]">{copy[`panchanga_${field}`]}</span>
            <span className="font-display text-base text-[var(--color-text-primary)]">{copy[`panchanga_${field}_value`]}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <span className="text-sm text-[var(--color-text-secondary)]">{copy.panchanga_rahu}</span>
          <span className="font-body font-semibold text-caption text-[var(--color-danger-500)]">{copy.panchanga_rahu_value}</span>
        </div>
      </div>
      <div className="bg-[var(--color-cream-soft)]/50 border border-[var(--color-line)] rounded-xl p-4 sm:p-5 mb-8">
        <p className="font-body text-micro tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">{copy.panchanga_guidance}</p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-[1.7] mt-2">{copy.panchanga_guidance_body}</p>
      </div>
      <h2 className="font-display text-xl text-[var(--color-text-primary)] mb-3">{copy.panchanga_festivals}</h2>
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center gap-3 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl px-4 py-3 shadow-2xs hover:border-[var(--color-saffron-500)] transition-colors">
            <span className="font-body text-badge font-bold text-[var(--color-text-brand)] bg-[var(--color-saffron-50)] px-2.5 py-1 rounded-lg shrink-0 min-w-[52px] text-center">{copy[`panchanga_festival_${index}_date`]}</span>
            <div>
              <p className="font-body font-semibold text-sm text-[var(--color-text-primary)]">{copy[`panchanga_festival_${index}_name`]}</p>
              <p className="font-body text-meta text-[var(--color-text-muted)]">{copy[`panchanga_festival_${index}_note`]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
