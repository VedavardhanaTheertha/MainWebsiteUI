"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function PanchangaPage() {
  const { tr, lang } = useLang();
  const { panchanga } = tr;
  const rows: [string, string][] = [
    [lang === "kn" ? "ದಿನಾಂಕ" : "Date", panchanga.valid_for_date],
    [lang === "kn" ? "ತಿಥಿ" : "Tithi", panchanga.tithi],
    [lang === "kn" ? "ನಕ್ಷತ್ರ" : "Nakshatra", panchanga.nakshatra],
    [lang === "kn" ? "ಸೂರ್ಯೋದಯ" : "Sunrise", panchanga.sunrise],
    [lang === "kn" ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset", panchanga.sunset],
  ];

  return (
    <div className="pb-10">
      <PageHero heading={panchanga.heading} subheading={panchanga.intro} />
      <section className="px-4 py-6 lg:mx-auto lg:max-w-md lg:px-8">
        <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] shadow-[var(--shadow-card)]">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-[var(--color-line-soft)] px-4 py-3 last:border-0"
            >
              <span className="text-sm text-[var(--color-ink-500)]">{label}</span>
              <span className="text-sm font-semibold text-[var(--color-ink-900)]">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--color-ink-700)]">{panchanga.notes}</p>
      </section>
    </div>
  );
}
