"use client";

import { useState, useEffect } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { alternateHomeHero, defaultContentMode, homeHero } from "@/gen/content";
import { useUiSettings } from "@/context/UiSettingsContext";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDialogsOpen } from "@/hooks/useDialog";

export default function HeroCarousel() {
  const { lang, contentMode, tr } = useLang();
  const { heroSettings } = useUiSettings();
  const reducedMotion = useReducedMotion();
  const dialogsOpen = useDialogsOpen();
  const hero = contentMode !== defaultContentMode && alternateHomeHero
    ? alternateHomeHero
    : homeHero;
  const title = hero.titles[lang];
  const { href, images } = hero;
  const [i, setI] = useState(0);
  const [maxVisited, setMaxVisited] = useState(1);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const current = images.length ? i % images.length : 0;

  const goToSlide = (idx: number) => {
    setI(idx);
    setMaxVisited((m) => Math.max(m, idx + 1));
  };

  useEffect(() => {
    if (reducedMotion || paused || focused || dialogsOpen || !heroSettings.autoplay || images.length <= 1) return undefined;
    const t = setInterval(() => {
      setI((p) => {
        const next = (p + 1) % images.length;
        setMaxVisited((m) => Math.max(m, next + 1));
        return next;
      });
    }, heroSettings.intervalMs);
    return () => clearInterval(t);
  }, [images.length, reducedMotion, paused, focused, dialogsOpen, heroSettings.autoplay, heroSettings.intervalMs]);

  return (
    <div
      className="layout-wide home-hero relative"
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
    <Link href={href} className="hero-rounded-frame relative block w-full overflow-hidden rounded-b-[22px] bg-[var(--color-paper)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]">
      <div className="home-hero-viewport relative h-[462px] lg:h-[600px]">
      {images.map((src, k) => {
        const isRendered = k <= maxVisited || k === current || k === (current + 1) % images.length;
        return (
          <div
            key={`${src}-${k}`}
            className="absolute inset-0 transition-all ease-out"
            style={{
              opacity: k === current ? 1 : 0,
              transitionDuration: `${reducedMotion || paused ? 0 : heroSettings.fadeDurationMs}ms`,
            }}
          >
            {isRendered && (
              <ContentImage
                src={src}
                alt=""
                fill
                priority={k === 0}
                loading={k === 0 ? "eager" : "lazy"}
                sizes="100vw"
              />
            )}
          </div>
        );
      })}

      </div>

      <div className={`hero-text-overlay absolute inset-x-0 bottom-0 px-6 pb-11 sm:pb-12 pt-8 text-center ${heroSettings.autoplay && images.length > 1 && !reducedMotion ? "pr-20" : ""}`}>
        <h1
          className="font-display text-[26px] lg:text-4xl leading-tight whitespace-pre-line text-[#fff8ed] drop-shadow-md"
        >
          {title}
        </h1>
      </div>
    </Link>

    {/* Accessible Pause / Play Motion Control */}
    {heroSettings.autoplay && images.length > 1 && !reducedMotion && (
      <button type="button" onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? tr.page_controls.resume_motion : tr.page_controls.pause_motion}
        className="absolute right-4 bottom-2 sm:bottom-2.5 grid size-9 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)] z-20"
      >
        {paused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
      </button>
    )}

    {/* Slide Indicator Progress Pills */}
    {!reducedMotion && images.length > 1 && (
      <div
        role="tablist"
        aria-label="Hero slides"
        className="hero-slide-indicators pointer-events-none absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md border border-white/20 shadow-lg"
      >
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === current}
            aria-label={`${tr.media?.photo_label ?? "Slide"} ${idx + 1}`}
            onClick={() => goToSlide(idx)}
            className="pointer-events-auto flex min-h-11 min-w-8 items-center justify-center p-1 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span
              className={`block h-2.5 transition-all duration-300 rounded-full ${
                idx === current ? "w-7 bg-[var(--color-saffron-400)] shadow-sm" : "w-2.5 bg-white/70 hover:bg-white"
              }`}
            />
          </button>
        ))}
      </div>
    )}
    </div>
  );
}
