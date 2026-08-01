"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "@/context/LanguageContext";

const KOTILEKHANA_LINK = "#";
const AUTO_ADVANCE_MS = 5500;

const slides = [
  {
    id: "krishna",
    bg: "/krishna.jpg",
    label_en: "UDUPI SRI KRISHNA MATHA",
    label_kn: "ಉಡುಪಿ ಶ್ರೀ ಕೃಷ್ಣ ಮಠ",
    headline_en: "The Divine Abode of Lord Krishna",
    headline_kn: "ಶ್ರೀ ಕೃಷ್ಣನ ದಿವ್ಯ ನೆಲೆ",
    body_en:
      "A 750-year-old seat of Madhwa philosophy, unbroken worship, and bhakti, established by Jagadguru Sri Madhwacharya.",
    body_kn:
      "ಜಗದ್ಗುರು ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯರಿಂದ ಸ್ಥಾಪಿತವಾದ ೭೫೦ ವರ್ಷಗಳ ಮಧ್ವ ತತ್ತ್ವ ಮತ್ತು ನಿರಂತರ ಆರಾಧನೆಯ ಕೇಂದ್ರ.",
    link_en: "Explore the Matha",
    link_kn: "ಮಠವನ್ನು ಅನ್ವೇಷಿಸಿ",
    href: "/about",
  },
  {
    id: "swamiji",
    bg: "/swamiji.jpg",
    label_en: "HIS HOLINESS SWAMIJI",
    label_kn: "ಪೂಜ್ಯ ಸ್ವಾಮೀಜಿ",
    headline_en: "Wisdom for the Modern Soul",
    headline_kn: "ಆಧುನಿಕ ಆತ್ಮಕ್ಕೆ ಜ್ಞಾನ",
    // TODO: Replace with Swamiji's actual quote from management
    body_en:
      "“True devotion is not in words alone, but in selfless service to God and humanity. May Sri Krishna’s grace illuminate every step.”",
    body_kn:
      "“ನಿಜವಾದ ಭಕ್ತಿ ಕೇವಲ ಮಾತಿನಲ್ಲಿ ಅಲ್ಲ, ನಿಸ್ವಾರ್ಥ ಸೇವೆಯಲ್ಲಿದೆ. ಶ್ರೀ ಕೃಷ್ಣನ ಕೃಪೆ ಪ್ರತಿ ಹೆಜ್ಜೆಯನ್ನೂ ಬೆಳಗಲಿ.”",
    link_en: "Meet Swamiji",
    link_kn: "ಸ್ವಾಮೀಜಿಯ ಬಗ್ಗೆ",
    href: "/about",
    isQuote: true,
  },
  {
    id: "shiroor",
    bg: "/shiroor-mutt.jpg",
    label_en: "PARYAYA 2026–2028",
    label_kn: "ಪರ್ಯಾಯ ೨೦೨೦–೨೦೨೨",
    headline_en: "Shri Shiroor Matha Leads the Sacred Paryaya",
    headline_kn: "ಶ್ರೀ ಶಿರೂರು ಮಠ ಪಾವನ ಪರ್ಯಾಯ ನಡೆಸುತ್ತದೆ",
    body_en:
      "Every 14 years, Shri Shiroor Matha takes the helm — upholding centuries of tradition, scholarship, and devotion to Sri Krishna.",
    body_kn:
      "ಪ್ರತಿ ೧೪ ವರ್ಷಕ್ಕೊಮ್ಮೆ ಶ್ರೀ ಶಿರೂರು ಮಠವು ಶ್ರೀ ಕೃಷ್ಣ ಭಕ್ತಿ ಮತ್ತು ಸಂಪ್ರದಾಯವನ್ನು ಎತ್ತಿ ಹಿಡಿಯುತ್ತದೆ.",
    link_en: "About Paryaya",
    link_kn: "ಪರ್ಯಾಯದ ಬಗ್ಗೆ",
    href: "/about",
  },
];

export default function HeroSection() {
  const { lang, tr } = useLang();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => {
    setActive((p) => (p + 1) % slides.length);
  }, []);

  const goPrev = useCallback(() => {
    setActive((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((i: number) => setActive(i), []);

  useEffect(() => {
    timerRef.current = setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, goNext]);

  const tabs = [
    { label: tr.qa_volunteer, href: "/volunteer" },
    { label: tr.qa_kotilekhana, href: KOTILEKHANA_LINK },
    { label: tr.qa_events, href: "/events" },
  ];

  return (
    <section
      className="relative flex flex-col bg-[var(--color-cream)] overflow-hidden h-[calc(100svh-156px)] lg:min-h-[560px] lg:max-h-[680px]"
      aria-label="Hero — Shri Shiroor Matha"
    >
      {/* ── Slide area ── */}
      <div className="flex-1 relative overflow-hidden">
        {slides.map((s, i) => {
          const isActive = i === active;
          return (
            <div
              key={s.id}
              aria-hidden={!isActive}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
            >
              {/* ── Desktop: left text + right image ── */}
              <div className="hidden lg:flex h-full">
                {/* Left cream panel — fully clickable */}
                <Link
                  href={s.href}
                  className="w-[43%] bg-[var(--color-cream)] flex flex-col justify-center pl-14 xl:pl-20 pr-6 relative z-10 group hover:bg-[var(--color-cream-soft)] transition-colors duration-300"
                >
                  <div
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(16px)",
                      transition: "opacity 0.8s ease 0.35s, transform 0.8s ease 0.35s",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <span className="block w-7 h-px bg-[var(--color-saffron-600)]" />
                      <span className="font-body text-[10px] tracking-[0.22em] uppercase text-[var(--color-text-brand)] font-semibold">
                        {lang === "kn" ? s.label_kn : s.label_en}
                      </span>
                    </div>
                    <h2
                      className="font-display font-bold text-[var(--color-text-primary)] leading-tight mb-4 group-hover:text-[var(--color-text-brand)] transition-colors duration-200"
                      style={{ fontSize: "clamp(1.75rem, 2.8vw, 2.75rem)" }}
                    >
                      {lang === "kn" ? s.headline_kn : s.headline_en}
                    </h2>
                    <p
                      className={`font-body text-[var(--color-text-secondary)] text-[15px] leading-relaxed max-w-[22rem] ${
                        s.isQuote ? "italic" : ""
                      }`}
                    >
                      {lang === "kn" ? s.body_kn : s.body_en}
                    </p>
                  </div>
                </Link>

                {/* Right image panel — rounded left cut */}
                <div
                  className="w-[57%] relative overflow-hidden"
                  style={{ borderRadius: "45% 0 0 45% / 50% 0 0 50%" }}
                >
                  <img
                    src={s.bg}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    style={{
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      transition: "transform 6s ease-out",
                    }}
                  />
                  <div className="absolute inset-0 bg-[var(--color-ink-900)]/15" aria-hidden="true" />
                </div>
              </div>

              {/* ── Mobile: image top + text bottom ── */}
              <div className="lg:hidden flex flex-col h-full">
                {/* Image — top 52% with rounded bottom */}
                <div
                  className="relative overflow-hidden shrink-0"
                  style={{ height: "52%", borderRadius: "0 0 50% 50% / 0 0 40% 40%" }}
                >
                  <img
                    src={s.bg}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    style={{
                      transform: isActive ? "scale(1.04)" : "scale(1)",
                      transition: "transform 6s ease-out",
                    }}
                  />
                  <div className="absolute inset-0 bg-[var(--color-ink-900)]/15" aria-hidden="true" />
                </div>

                {/* Text — bottom, fully clickable */}
                <Link
                  href={s.href}
                  className="flex-1 bg-[var(--color-cream)] flex flex-col justify-center px-6 pt-2 pb-3 group active:bg-[var(--color-cream-soft)] transition-colors duration-200"
                >
                  <div
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(12px)",
                      transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="block w-5 h-px bg-[var(--color-saffron-600)]" />
                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-brand)] font-semibold">
                        {lang === "kn" ? s.label_kn : s.label_en}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl sm:text-2xl leading-tight mb-2 group-hover:text-[var(--color-text-brand)] transition-colors duration-200">
                      {lang === "kn" ? s.headline_kn : s.headline_en}
                    </h2>
                    <p
                      className={`font-body text-[var(--color-text-secondary)] text-[13px] leading-relaxed ${
                        s.isQuote ? "italic" : ""
                      }`}
                    >
                      {lang === "kn" ? s.body_kn : s.body_en}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}

        {/* ── Navigation: progress bars + arrows (bottom-right) ── */}
        <div className="absolute bottom-4 right-4 lg:right-8 z-10 flex items-center gap-2.5">
          {/* Progress bars */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className="relative h-[3px] rounded-full overflow-hidden bg-[var(--color-ink-900)]/20 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 transition-all duration-300"
                style={{ width: i === active ? "36px" : "18px" }}
              >
                {i === active && (
                  <span
                    className="absolute inset-0 bg-[var(--color-saffron-600)] rounded-full origin-left"
                    style={{ animation: `progress-fill ${AUTO_ADVANCE_MS}ms linear forwards` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="w-8 h-8 rounded-full border border-[var(--color-text-primary)]/25 bg-white/80 flex items-center justify-center text-[var(--color-text-primary)] hover:bg-white hover:border-[var(--color-saffron-600)]/50 transition-all duration-200 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="w-8 h-8 rounded-full border border-[var(--color-text-primary)]/25 bg-white/80 flex items-center justify-center text-[var(--color-text-primary)] hover:bg-white hover:border-[var(--color-saffron-600)]/50 transition-all duration-200 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Quick-action tabs — always at very bottom ── */}
      <div className="shrink-0 border-t border-[var(--color-saffron-600)] bg-[var(--color-cream)] px-4 lg:px-16 py-4 lg:py-7">
        <div className="flex flex-row gap-2 lg:gap-4 max-w-4xl mx-auto" role="list" aria-label="Quick links">
          {tabs.map((tab, i) => (
            <Link
              key={tab.label}
              href={tab.href}
              role="listitem"
              className={`
                group flex-1 flex items-center justify-center
                px-2 lg:px-6 py-2.5 lg:py-4 rounded-xl text-center
                font-body text-[11px] sm:text-[12px] lg:text-[14px] font-semibold leading-tight
                border transition-all duration-300
                hover:-translate-y-0.5 hover:shadow-md active:scale-95
                focus-visible:outline-2 focus-visible:outline-offset-2
                ${i === 0
                  ? "bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] text-white border-transparent shadow-sm focus-visible:outline-[var(--color-saffron-600)]"
                  : "bg-[var(--color-paper)] text-[var(--color-text-brand)] border-[var(--color-saffron-600)]/60 hover:bg-[var(--color-saffron-700)] hover:border-[var(--color-saffron-600)] focus-visible:outline-[var(--color-saffron-600)]"
                }
              `}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes progress-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
