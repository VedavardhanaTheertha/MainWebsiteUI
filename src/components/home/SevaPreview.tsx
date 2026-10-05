"use client";

import Image from "next/image";
import Link from "next/link";
import {
  featuredSevaIds,
  realSevas,
  placeholderSevas,
  type LocalizedSevaText,
  type SevaRecord,
} from "@/gen/sevas/data";
import { useLang } from "@/context/LanguageContext";
import { siteConfig } from "@/gen/content";

function localized(value: LocalizedSevaText, lang: string) {
  return value[lang as keyof LocalizedSevaText] || value.en;
}

export default function SevaPreview() {
  const { lang, contentMode, tr } = useLang();
  const activeSevas = contentMode === "placeholder" ? placeholderSevas : realSevas;
  const featuredSevas = featuredSevaIds
    .map((id) => activeSevas.find((seva) => seva.id === id))
    .filter((seva): seva is SevaRecord => Boolean(seva));

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          {featuredSevas.map((seva) => (
            <article
              key={seva.id}
              className="bg-white rounded-[18px] overflow-hidden flex flex-col border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.10)] hover:shadow-[0_8px_32px_rgba(60,7,83,0.18)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="relative h-32 bg-[var(--color-saffron-100)]">
                <Image src={`${siteConfig.basePath}/icons/seva-placeholder.svg`} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-5 flex flex-1 flex-col gap-3">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-lg leading-tight mb-1">
                    {localized(seva.title, lang)}
                  </h3>
                  <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-3">
                    {localized(seva.significance, lang)}
                  </p>
                </div>
                <div className="flex items-center justify-end pt-2 border-t border-[var(--color-saffron-600)]">
                  <Link
                    href="/sevas"
                    className="font-body text-xs font-semibold text-white bg-[var(--color-saffron-600)] rounded-full px-4 py-1.5 hover:shadow-md transition-shadow focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
                  >
                    {tr.seva_offer}
                  </Link>
                </div>
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
