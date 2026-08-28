"use client";

import Link from "next/link";
import { sevas } from "@/data/sevas";
import { useLang } from "@/context/LanguageContext";

const FEATURED_IDS = ["ks-01", "ks-03", "bs-01", "bs-02"];
const featuredSevas = FEATURED_IDS.map((id) => sevas.find((s) => s.id === id)).filter(Boolean) as typeof sevas;

// TODO: Add Kannada translations for seva names/significance in data/sevas.ts when ready

export default function SevaPreview() {
  const { tr } = useLang();

  return (
    <section className="py-16 lg:py-24 bg-[var(--color-cream)]" aria-labelledby="seva-preview-heading">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="mb-10 lg:mb-12">
          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2">
            {tr.seva_label}
          </p>
          <h2
            id="seva-preview-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl lg:text-5xl mb-3"
          >
            {tr.seva_title}
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] text-base lg:text-lg max-w-2xl leading-relaxed">
            {tr.seva_body}
          </p>
        </div>

        {/* Grid — single row of 4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {featuredSevas.map((seva) => (
            <article
              key={seva.id}
              className="bg-white rounded-[18px] p-5 flex flex-col gap-3 border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.10)] hover:shadow-[0_8px_32px_rgba(60,7,83,0.18)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl" aria-hidden="true">{seva.icon}</span>
                {seva.isSpecial && (
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-brand)] bg-[var(--color-saffron-100)] rounded-full px-2.5 py-0.5">
                    {tr.seva_special}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-lg leading-tight mb-1">
                  {seva.name}
                </h3>
                <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-3">
                  {seva.significance}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-saffron-600)]">
                <span className="font-body text-sm font-medium text-[var(--color-text-secondary)]">
                  {tr.seva_from}{" "}
                  <span className="text-[var(--color-text-primary)] font-semibold">₹{seva.price.toLocaleString("en-IN")}</span>
                  {/* TODO: Replace placeholder prices */}
                </span>
                <Link
                  href="/sevas"
                  className="font-body text-xs font-semibold text-white bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-full px-4 py-1.5 hover:shadow-md transition-shadow focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
                >
                  {tr.seva_offer}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/sevas"
            className="inline-flex items-center gap-2 font-body font-semibold text-[var(--color-text-brand)] text-base hover:gap-3 transition-all focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
          >
            {tr.seva_view_all} →
          </Link>
        </div>
      </div>
    </section>
  );
}
