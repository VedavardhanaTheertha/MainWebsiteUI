"use client";

import { Fragment } from "react";
import { useLang } from "@/context/LanguageContext";
import type { Lang } from "@/gen/content";
import { openVolunteerModal } from "@/hooks/useVolunteerModal";
import { openDonateModal } from "@/hooks/useDonateModal";

const actions = [
  {
    label: "Subscribe",
    href: "#",
    tooltip: "Subscribe",
    svg: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "Donate",
    href: "#",
    tooltip: "Donate Now",
    svg: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    label: "Volunteer",
    href: "#",
    tooltip: "Volunteer",
    svg: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function TopBar() {
  const { lang, setLang, languages } = useLang();

  return (
    <div className="hidden lg:block w-full bg-[#1a1108] text-[var(--color-text-brand)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-9 grid grid-cols-3 items-center">

        {/* Left — language switcher, rendered from the languages discovered at
            build time so a new content/languages/*.json file appears here on its own */}
        <div className="flex items-center gap-1 border border-[var(--color-saffron-600)]/30 rounded-md px-2 py-1" role="group" aria-label="Language selector">
          {languages.map((option, index) => (
            <Fragment key={option.code}>
              {index > 0 && (
                <span className="text-[var(--color-text-brand)]/30 text-[12px] select-none">|</span>
              )}
              <button
                onClick={() => setLang(option.code as Lang)}
                className={`font-body text-[14px] font-bold px-3 py-1 rounded transition-colors focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 ${
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

        {/* Centre — sacred sloka */}
        <p className="text-center font-display text-[9px] sm:text-[12px] lg:text-sm font-semibold text-[var(--color-text-brand)] tracking-tight select-none whitespace-nowrap">
          ॥ ಶ್ರೀ ವಿಠ್ಠಲೋ ವಿಜಯತೇ ॥
        </p>

        {/* Right — action icons with tooltips */}
        <div className="flex items-center gap-4 justify-end">
          {/* YouTube — Subscribe */}
          {actions.filter(a => a.label === "Subscribe").map(({ label, href, tooltip, svg }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="group relative text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors rounded">
              {svg}
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-[#1a1108] text-[var(--color-text-brand)] text-[10px] font-body px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999] border border-[var(--color-saffron-600)]/20">{tooltip}</span>
            </a>
          ))}
          {/* Donate */}
          <button onClick={openDonateModal} aria-label="Donate"
            className="group relative text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors rounded">
            {actions.find(a => a.label === "Donate")?.svg}
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-[#1a1108] text-[var(--color-text-brand)] text-[10px] font-body px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999] border border-[var(--color-saffron-600)]/20">Donate Now</span>
          </button>
          {/* Volunteer */}
          <button onClick={openVolunteerModal} aria-label="Volunteer"
            className="group relative text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors rounded">
            {actions.find(a => a.label === "Volunteer")?.svg}
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-[#1a1108] text-[var(--color-text-brand)] text-[10px] font-body px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999] border border-[var(--color-saffron-600)]/20">Volunteer</span>
          </button>
        </div>

      </div>
    </div>
  );
}
