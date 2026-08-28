"use client";

import { useLang } from "@/context/LanguageContext";

export default function BottomLinks() {
  const { tr } = useLang();
  const { explore_links: links, guidance_cards: guidanceCards, explore_label, explore_title, guidance_label, guidance_title } = tr.home;

  return (
    <section className="w-full bg-[var(--color-cream)] px-4 lg:px-8 pt-6 pb-6">
      <div className="max-w-7xl mx-auto">

        <p className="font-body text-[10px] tracking-[.25em] uppercase text-[var(--color-text-brand)] font-semibold mb-1 text-center">{explore_label}</p>
        <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl text-center mb-4 lg:mb-8">{explore_title}</h2>

        {/* Mobile: single-line rows, matching the design reference's .m-crow */}
        <div className="lg:hidden flex flex-col gap-2.5 mb-3">
          {links.map((item) => (
            <a key={item.href} href={item.href}
              className="flex items-center justify-between gap-3 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] px-4 py-4 shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--color-saffron-300)]">
              <span className="font-body font-semibold text-[15px] text-[var(--color-text-primary)]">{item.title}</span>
              <svg className="text-[var(--color-saffron-600)] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          ))}
        </div>

        {/* Desktop: 5-column grid with full content */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mb-10">
          {links.map((item) => (
            <a key={item.href} href={item.href}
              className="group flex flex-col gap-3 bg-[var(--color-paper)] hover:bg-[var(--color-cream-soft)] border border-[var(--color-line)] hover:border-[var(--color-saffron-600)]/40 rounded-xl p-5 transition-all duration-200 shadow-[var(--shadow-xs)]">
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-[15px] leading-snug group-hover:text-[var(--color-text-brand)] transition-colors">{item.title}</h3>
              <p className="font-body text-[var(--color-text-secondary)] text-[12px] leading-relaxed flex-1">{item.desc}</p>
              <span className="font-body text-[12px] font-semibold text-[var(--color-text-brand)] group-hover:underline flex items-center gap-1">
                {item.cta}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </a>
          ))}
        </div>

        {/* Guidance cards — "Seeking Answers" (matches .m-shead/.m-seek/.m-skcard) */}
        <div>
          <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold lg:text-center">{guidance_label}</p>
          <h2 className="font-display text-2xl text-[var(--color-text-primary)] mt-1 mb-3 lg:text-center">{guidance_title}</h2>

          {/* Mobile: exact .m-skcard match */}
          <div className="lg:hidden flex flex-col gap-3">
            {guidanceCards.map((card) => (
              <a key={card.href + card.heading} href={card.href}
                className="flex items-center gap-3.5 bg-[var(--color-cream-soft)] border border-[var(--color-line)] rounded-[8px] px-4 py-3.5 transition-colors hover:border-[var(--color-saffron-300)]">
                <span
                  className="w-12 h-12 shrink-0 rounded-[4px] bg-[var(--color-saffron-50)] text-[var(--color-saffron-700)] flex items-center justify-center text-2xl"
                  style={{ fontFamily: "var(--font-sanskrit)" }}
                >
                  {card.symbol}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight">{card.heading}</p>
                  <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{card.sub}</p>
                </div>
                <svg className="text-[var(--color-saffron-600)] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            ))}
          </div>

          {/* Desktop: compact grid */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-3">
            {guidanceCards.map((card) => (
              <a key={card.href + card.heading} href={card.href}
                className="group flex items-center gap-3 bg-[var(--color-cream-soft)] hover:bg-[var(--color-saffron-100)] border border-[var(--color-line)] hover:border-[var(--color-saffron-600)]/50 rounded-xl px-4 py-3 transition-all duration-200">
                <div className="w-9 h-9 rounded-full bg-[var(--color-saffron-100)] flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-[var(--color-text-brand)] text-[13px] leading-none">{card.symbol}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[var(--color-text-primary)] text-[12px] leading-snug group-hover:text-[var(--color-text-brand)] transition-colors">{card.heading}</p>
                  <p className="font-body text-[10px] text-[var(--color-text-muted)] italic mt-0.5 truncate">{card.sub}</p>
                </div>
                <svg className="text-[var(--color-saffron-600)]/60 group-hover:text-[var(--color-saffron-600)] shrink-0 transition-colors" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
