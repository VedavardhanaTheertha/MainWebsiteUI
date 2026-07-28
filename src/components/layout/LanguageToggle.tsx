"use client";

import { useLang } from "@/context/LanguageContext";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Switch language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-[var(--radius-pill)] px-2.5 py-1 transition-colors ${
          lang === "en"
            ? "bg-[var(--color-saffron-600)] text-white"
            : "text-[var(--color-ink-700)]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("kn")}
        aria-pressed={lang === "kn"}
        className={`rounded-[var(--radius-pill)] px-2.5 py-1 transition-colors ${
          lang === "kn"
            ? "bg-[var(--color-saffron-600)] text-white"
            : "text-[var(--color-ink-700)]"
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}
