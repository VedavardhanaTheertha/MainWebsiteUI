"use client";

import { Fragment } from "react";
import { useLang } from "@/context/LanguageContext";
import type { Lang } from "@/gen/content";

export default function TopBar() {
  const { lang, setLang, languages, tr } = useLang();

  return (
    <div className="hidden xl:block w-full bg-[#1a1108] text-[var(--color-text-brand)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 min-h-14 flex items-center justify-between gap-4">

        {/* Left — language switcher, rendered from the languages discovered at
            build time so a new content/languages/*.json file appears here on its own */}
        <div className="flex min-w-0 flex-wrap items-center gap-1 border border-[var(--color-saffron-600)]/30 rounded-md px-2 py-1 shrink-0" role="group" aria-label={tr.ui.language_selector}>
          {languages.map((option, index) => (
            <Fragment key={option.code}>
              {index > 0 && (
                <span className="text-[var(--color-text-brand)]/30 text-micro select-none">|</span>
              )}
              <button
                onClick={() => setLang(option.code as Lang)}
                className={`inline-flex min-w-11 min-h-11 items-center justify-center font-body text-ui font-bold px-3 py-1 rounded transition-colors focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 ${
                  lang === option.code ? "text-white bg-[var(--color-saffron-600)]/80" : "text-[var(--color-text-brand)]/70 hover:text-[var(--color-text-brand)]"
                }`}
                aria-pressed={lang === option.code}
                aria-label={option.native_name}
              >
                {option.label}
              </button>
            </Fragment>
          ))}
        </div>

        {/* Sacred sloka — always font-kannada so it renders identically across language switches */}
        <p className="flex-1 text-center font-kannada text-micro sm:text-ui lg:text-sm font-semibold text-[var(--color-text-brand)] tracking-tight select-none whitespace-nowrap">
          {tr.editorial.site_chrome.chant}
        </p>

        {/* Balance spacer for centering */}
        <div className="w-[120px] shrink-0" aria-hidden="true" />

      </div>
    </div>
  );
}
