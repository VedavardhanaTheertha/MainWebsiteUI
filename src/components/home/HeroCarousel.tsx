"use client";

import { useState, useEffect } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { alternateHomeHero, defaultContentMode, homeHero } from "@/gen/content";
import { useUiSettings } from "@/context/UiSettingsContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDialogsOpen } from "@/hooks/useDialog";

export default function HeroCarousel() {
  const { lang, contentMode } = useLang();
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
  const [focused, setFocused] = useState(false);
  const current = images.length ? i % images.length : 0;

  useEffect(() => {
    if (reducedMotion || focused || dialogsOpen || !heroSettings.autoplay || images.length <= 1) return undefined;
    const t = setInterval(() => {
      setI((p) => {
        const next = (p + 1) % images.length;
        setMaxVisited((m) => Math.max(m, next + 1));
        return next;
      });
    }, heroSettings.intervalMs);
    return () => clearInterval(t);
  }, [images.length, reducedMotion, focused, dialogsOpen, heroSettings.autoplay, heroSettings.intervalMs]);

  if (!images.length) return null;

  return (
    <div
      className="layout-wide home-hero relative"
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
    >
      <Link href={href} className="hero-rounded-frame relative block w-full overflow-hidden rounded-b-[22px] bg-[var(--color-paper)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]">
        <div className="home-hero-viewport relative h-[462px] lg:h-[600px]">
          {images.map((src, k) => {
            const isRendered = k <= maxVisited || k === current || k === (current + 1) % images.length;
            const isActive = k === current;
            return (
              <div
                key={`${src}-${k}`}
                aria-hidden={!isActive}
                className="absolute inset-0 transition-opacity ease-out will-change-opacity"
                style={{
                  opacity: isActive ? 1 : 0,
                  transitionDuration: `${reducedMotion ? 0 : heroSettings.fadeDurationMs}ms`,
                  pointerEvents: isActive ? "auto" : "none",
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

        <div className="hero-text-overlay pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-6 sm:pb-8 pt-8 text-center">
          <h1
            className="font-display text-[26px] lg:text-4xl leading-tight whitespace-pre-line text-[#fff8ed] drop-shadow-md pointer-events-auto"
          >
            {title}
          </h1>
        </div>
      </Link>
    </div>
  );
}
