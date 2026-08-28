import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.about;

// TODO: Replace with verified Guru Parampara names from management (30+ names)
const page = content[defaultLang].pages.about;
const guruParampara = page.parampara;

export default function AboutPage() {
  return (
    <>
      {/* Page hero */}
      <div className="relative bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/gopura.png"
            alt=""
            fill
            className="object-cover object-center"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
            Our Heritage
          </p>
          <h1 className="font-display font-bold text-[var(--color-text-primary)] text-4xl sm:text-5xl lg:text-6xl mb-4">
            {page.title}
          </h1>
          <p className="font-body text-[var(--color-text-brand)]/75 text-lg max-w-2xl mx-auto">
            {page.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* Founding Story */}
        <section aria-labelledby="founding-heading" className="mb-16 lg:mb-20">
          <h2
            id="founding-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-6"
          >
            The Founding Story
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/5 shrink-0">
              <div className="rounded-[18px] overflow-hidden">
                <Image
                  src="/Madhwacharya-new.jpg"
                  alt={page.founder_alt}
                  width={500}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
              <p className="font-body text-xs text-[var(--color-text-secondary)] text-center mt-2">
                {page.founder_caption}
              </p>
            </div>

            <div className="flex-1 space-y-4">
              {/* TODO: Replace with approved historical content from management */}
              {page.founding_paragraphs.map((paragraph) => (
                <p key={paragraph} className="font-body text-[var(--color-text-secondary)] leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Swamiji Bio */}
        <section aria-labelledby="swamiji-bio-heading" className="mb-16 lg:mb-20 bg-white rounded-[20px] p-8 shadow-[0_4px_18px_rgba(60,7,83,0.10)]">
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            <div className="rounded-2xl overflow-hidden w-32 h-40 shrink-0 bg-[var(--color-saffron-100)]">
              <Image
                src="/swamiji.png"
                alt={page.pontiff_alt}
                width={128}
                height={160}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <span className="inline-block font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold bg-[var(--color-saffron-100)] rounded-full px-3 py-1 mb-2">
                Current Pontiff
              </span>
              {/* TODO: Confirm Swamiji's full name and title from management */}
              <h2
                id="swamiji-bio-heading"
                className="font-display font-bold text-[var(--color-text-primary)] text-2xl lg:text-3xl mb-1"
              >
                {page.pontiff_name}
              </h2>
              <p className="font-body text-[var(--color-text-secondary)] text-sm">
                {page.pontiff_line}
              </p>
            </div>
          </div>

          {/* TODO: Replace with real biographical content from management */}
          <div className="space-y-4">
            {page.pontiff_paragraphs.map((paragraph) => (
              <p key={paragraph} className="font-body text-[var(--color-text-secondary)] leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Guru Parampara */}
        <section aria-labelledby="parampara-heading">
          <h2
            id="parampara-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-4"
          >
            The Guru Parampara
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] mb-8">
            {page.parampara_intro}
            {/* TODO: Complete and verify all names and dates with management */}
          </p>

          <div className="relative pl-6 border-l-2 border-[var(--color-saffron-600)] space-y-0">
            {guruParampara.map((name, i) => (
              <div key={i} className="relative pb-6">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                    i === guruParampara.length - 1
                      ? "border-[var(--color-saffron-600)] bg-[var(--color-saffron-600)]"
                      : "border-[var(--color-saffron-600)] bg-[var(--color-paper)]"
                  }`}
                  aria-hidden="true"
                />
                <p
                  className={`font-body text-sm leading-relaxed ${
                    i === guruParampara.length - 1
                      ? "text-[var(--color-text-brand)] font-semibold"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <span className="text-[var(--color-text-brand)] mr-2 text-xs">{String(i + 1).padStart(2, "0")}.</span>
                  {name}
                  {i === guruParampara.length - 1 && " ✦ Current Pontiff"}
                </p>
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-[var(--color-text-secondary)]/50 mt-4 italic">
            {page.parampara_note}
          </p>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
