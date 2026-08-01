"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const slides = [
  {
    id: "krishna", bg: "/krishna.jpg",
    label: "UDUPI SRI KRISHNA MATHA",
    headline: "The Divine Abode of Lord Krishna",
    body: "A 750-year-old seat of Madhwa philosophy, unbroken worship, and bhakti.",
    link: "Explore the Matha",
    imgPosition: "center",
  },
  {
    id: "swamiji", bg: "/swamiji.jpg",
    label: "HIS HOLINESS SWAMIJI",
    headline: "Wisdom for the Modern Soul",
    body: "True devotion is not in words alone, but in selfless service to God and humanity.",
    link: "Meet Swamiji",
    isQuote: true,
    imgPosition: "center top",
  },
  {
    id: "shiroor", bg: "/shiroor-mutt.jpg",
    label: "PARYAYA 2026–2028",
    headline: "Shri Shiroor Matha Leads the Sacred Paryaya",
    body: "Every 14 years, Shri Shiroor Matha takes the helm — upholding centuries of tradition and devotion.",
    link: "About Paryaya",
    imgPosition: "center",
  },
];

const AUTO_MS = 5500;

export default function HeroV2() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => setActive((p) => (p + 1) % slides.length), []);
  const goPrev = useCallback(() => setActive((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    timerRef.current = setTimeout(goNext, AUTO_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, goNext]);

  return (
    <>
      <style>{`
        @keyframes heroMandala { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes heroProg { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>

      {/* Hero — height leaves room for cards in first screen */}
      <div
        className="relative w-full bg-[var(--color-cream)] overflow-hidden lg:overflow-hidden"
        style={{ height: "calc(100svh - 280px)", minHeight: "400px", maxHeight: "520px" }}
      >
        <style>{`
          /* Desktop: D-shape (flat left, curved right) */
          .hero-photo-wrap {
            width: 100%; height: 100%;
            border-radius: 0 50% 50% 0 / 0 50% 50% 0;
            box-shadow: 4px 0 40px rgba(60,7,83,0.15);
            overflow: hidden;
          }
          /* Mobile: sleeping-D / arch — rounded top, flat bottom */
          @media (max-width: 1023px) {
            .hero-slide-inner {
              flex-direction: column !important;
              align-items: center !important;
            }
            .hero-photo-col {
              width: 100% !important;
              height: 58% !important;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              padding-top: 8px;
            }
            .hero-photo-wrap {
              width: 100%;
              height: 100%;
              border-radius: 0 0 50% 50% / 0 0 18% 18%;
              box-shadow: 0 8px 40px rgba(60,7,83,0.2);
            }
            .hero-text-col {
              flex: 1;
              height: auto !important;
              padding: 12px 20px 0 20px !important;
            }
          }
        `}</style>

      {slides.map((s, i) => {
          const isActive = i === active;
          return (
            <div
              key={s.id}
              className="hero-slide-inner absolute inset-0 flex flex-row items-center"
              style={{ opacity: isActive ? 1 : 0, transition: "opacity 1s ease", zIndex: isActive ? 2 : 1 }}
            >
              {/* LEFT/TOP — D-shape desktop, arch mobile */}
              <div className="hero-photo-col shrink-0 flex justify-center items-center"
                style={{ width: "62%", height: "100%" }}>
                <div className="hero-photo-wrap" style={{ position: "relative" }}>
                  <Image
                    src={s.bg}
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover"
                    priority={i === 0}
                    sizes="(max-width: 1023px) 100vw, 62vw"
                    style={{ transform: isActive ? "scale(1.06)" : "scale(1)", transition: "transform 7s ease-out", objectPosition: s.imgPosition }}
                  />
                </div>
              </div>

              {/* RIGHT/BOTTOM — mandala + text */}
              <div className="hero-text-col flex-1 relative flex flex-col justify-center px-6 lg:px-10 xl:px-12 h-full overflow-visible lg:overflow-hidden">
                {/* Mandala background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                  <Image
                    src="/chakra.png"
                    alt=""
                    width={380}
                    height={380}
                    style={{ opacity: 0.12, animation: "heroMandala 35s linear infinite", objectFit: "contain" }}
                  />
                </div>

                <div
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(18px)",
                    transition: "opacity 0.85s ease 0.4s, transform 0.85s ease 0.4s",
                    position: "relative", zIndex: 1,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="block w-5 h-px bg-[var(--color-saffron-600)]" />
                    <span className="font-body text-[9px] tracking-[0.22em] uppercase text-[var(--color-text-brand)] font-semibold">{s.label}</span>
                  </div>
                  <h2
                    className="font-display font-bold text-[var(--color-text-primary)] leading-tight mb-3"
                    style={{ fontSize: "clamp(1.3rem, 2.2vw, 2rem)" }}
                  >
                    {s.headline}
                  </h2>
                  <p className={`font-body text-[var(--color-text-secondary)] text-[13px] leading-relaxed mb-5 ${s.isQuote ? "italic" : ""}`}>
                    {s.body}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 font-body text-[12px] font-bold text-white bg-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-700)] px-5 py-2.5 rounded-full transition-colors duration-200"
                  >
                    {s.link}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </a>
                </div>

                {/* Progress dots */}
                <div className="absolute bottom-4 left-6 lg:left-10 flex items-center gap-2">
                  {slides.map((sl, idx) => (
                    <button
                      key={sl.id}
                      onClick={() => setActive(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className="relative h-[3px] rounded-full overflow-hidden bg-[var(--color-ink-900)]/15 transition-all duration-300"
                      style={{ width: idx === active ? "28px" : "10px" }}
                    >
                      {idx === active && (
                        <span className="absolute inset-0 bg-[var(--color-saffron-600)] origin-left" style={{ animation: `heroProg ${AUTO_MS}ms linear forwards` }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Prev / Next arrows */}
        <button onClick={goPrev} aria-label="Prev"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 border border-[var(--color-saffron-600)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-all">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={goNext} aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 border border-[var(--color-saffron-600)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-all">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </>
  );
}
