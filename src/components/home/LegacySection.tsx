"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "@/context/LanguageContext";

const AUTO_MS = 4000;

const slides = [
  { value: "800+",     label_en: "Years of Legacy",           label_kn: "ಪರಂಪರೆಯ ವರ್ಷಗಳು" },
  { value: "36+",      label_en: "Generations of Swamijis",   label_kn: "ಸ್ವಾಮೀಜಿಗಳ ಪೀಳಿಗೆಗಳು" },
  { value: "10,000+",  label_en: "Devotees Fed Daily",        label_kn: "ಪ್ರತಿದಿನ ಭೋಜನ ಪಡೆಯುವ ಭಕ್ತರು" },
  { value: "97",       label_en: "Seva Offerings",            label_kn: "ಸೇವಾ ಅರ್ಪಣೆಗಳು" },
  { value: "₹2 Cr+",  label_en: "Annadaana in 2024",         label_kn: "೨೦೨೪ರಲ್ಲಿ ಅನ್ನದಾನ" },
  { value: "2026",     label_en: "Current Paryaya Year",      label_kn: "ಪ್ರಸ್ತುತ ಪರ್ಯಾಯ ವರ್ಷ" },
];

export default function LegacySection() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => setActive((p) => (p + 1) % slides.length), []);
  const goPrev = useCallback(() => setActive((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    timerRef.current = setTimeout(goNext, AUTO_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, goNext]);

  const s = slides[active];

  return (
    <section className="w-full bg-[#1e1408] py-14 lg:py-20 px-5 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <p className="font-body text-[11px] tracking-[0.25em] uppercase text-[var(--color-text-brand)] font-semibold mb-3">
            {lang === "kn" ? "ಪರಂಪರೆ ಮತ್ತು ಮುಂದಿನ ದಾರಿ" : "Legacy & What's Next"}
          </p>
          <h2
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)" }}
          >
            {lang === "kn" ? "ಎಂಟು ಶತಮಾನಗಳು. ಒಂದು ಜ್ಯೋತಿ." : "Eight Centuries. One Flame."}
          </h2>
        </div>

        {/* Slideshow */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Prev arrow */}
          <button
            onClick={goPrev}
            aria-label="Previous stat"
            className="shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white hover:bg-white/15 transition-all focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Slide content */}
          <div className="flex-1 relative overflow-hidden">
            <div
              key={active}
              className="text-center py-10 lg:py-16 min-h-[200px] flex flex-col items-center justify-center"
              style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
            >
              <p
                className="font-display font-bold text-[var(--color-text-brand)] leading-none mb-4"
                style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)" }}
              >
                {s.value}
              </p>
              <p className="font-body text-[var(--color-text-brand)]/70 text-lg lg:text-xl tracking-wide">
                {lang === "kn" ? s.label_kn : s.label_en}
              </p>
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={goNext}
            aria-label="Next stat"
            className="shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white hover:bg-white/15 transition-all focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to stat ${i + 1}`}
              className="relative h-[3px] rounded-full overflow-hidden bg-white/20 transition-all duration-300 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
              style={{ width: i === active ? "32px" : "14px" }}
            >
              {i === active && (
                <span
                  className="absolute inset-0 bg-[var(--color-saffron-600)] rounded-full origin-left"
                  style={{ animation: `progress-fill ${AUTO_MS}ms linear forwards` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
