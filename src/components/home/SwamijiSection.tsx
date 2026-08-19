"use client";

import { useLang } from "@/context/LanguageContext";

// TODO: Replace /swamiji.png with real hi-res asset
// TODO: Confirm Swamiji's exact name and title from management
const SWAMIJI_NAME_EN = "His Holiness Shri Vidyavallabesha Theertha Swamiji";
const SWAMIJI_NAME_KN = "ಪೂಜ್ಯ ಶ್ರೀ ವಿದ್ಯಾವಲ್ಲಭೇಶ ತೀರ್ಥ ಸ್ವಾಮಿಗಳು";

export default function SwamijiSection() {
  const { lang, tr } = useLang();
  const swamijiName = lang === "kn" ? SWAMIJI_NAME_KN : SWAMIJI_NAME_EN;

  return (
    <section
      className="relative w-full min-h-[90svh] lg:min-h-screen flex items-end overflow-hidden bg-[#1a1108]"
      aria-label="Swamiji — Our Revered Pontiff"
    >
      {/* Image with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/swamiji.png"
          alt="His Holiness Swamiji in divine composure"
          className="w-full h-full object-cover object-top animate-kenburns"
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(26,17,8,0.96) 0%, rgba(26,17,8,0.65) 35%, rgba(26,17,8,0.15) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 lg:px-8 pb-16 lg:pb-24">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[var(--color-saffron-600)]/50" />
          <span className="text-[var(--color-text-brand)]/70 text-xs font-body tracking-widest uppercase">
            {tr.swamiji_label}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--color-saffron-600)]/50" />
        </div>

        <h2 className="font-display text-white font-bold text-3xl sm:text-4xl lg:text-6xl leading-tight mb-3">
          {swamijiName}
        </h2>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 font-body text-sm text-[var(--color-text-brand)] font-medium bg-[var(--color-saffron-600)]/10 border border-[var(--color-saffron-600)]/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-saffron-600)]" aria-hidden="true" />
            {tr.swamiji_lineage}
          </span>
          <span className="inline-flex items-center gap-2 font-body text-sm text-[var(--color-text-brand)]/80 font-medium bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            {tr.swamiji_paryaya}
          </span>
        </div>

        {/* TODO: Replace with Swamiji's actual quote once provided by management */}
        <blockquote className="max-w-2xl border-l-2 border-[var(--color-saffron-600)] pl-5">
          <p className="font-display text-[var(--color-text-brand)] text-xl lg:text-2xl font-medium italic leading-relaxed">
            {lang === "kn"
              ? "«ಮಾನವನಲ್ಲಿ ದೈವವನ್ನು ಕಾಣುವುದೇ ಶ್ರೇಷ್ಠ ಸೇವೆ — ಮತ್ತು ಆ ದೈವಕ್ಕೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ಅನ್ನ ಉಣಿಸುವುದೇ ಅನ್ನದಾನ.»"
              : "«The greatest seva one can offer is to see the Divine in every human being — and to feed that Divine, unconditionally, every single day.»"}
            {/* TODO: Replace with confirmed quote from management */}
          </p>
          <cite className="block mt-3 font-body text-sm text-[var(--color-text-brand)]/60 not-italic">
            — {swamijiName}
          </cite>
        </blockquote>
      </div>
    </section>
  );
}
