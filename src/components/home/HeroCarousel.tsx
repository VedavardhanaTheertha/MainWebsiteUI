"use client";

import { useState, useEffect, useRef } from "react";
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
  const viewportRef = useRef<HTMLDivElement>(null);

  const hero = contentMode !== defaultContentMode && alternateHomeHero
    ? alternateHomeHero
    : homeHero;
  const slides = hero.slides ?? [];
  const [i, setI] = useState(0);
  const [maxVisited, setMaxVisited] = useState(1);
  const [focused, setFocused] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const updateOrientation = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setIsLandscape(rect.width > 1.25 * rect.height);
      }
    };
    updateOrientation();
    const observer = new ResizeObserver(updateOrientation);
    observer.observe(el);
    window.addEventListener("resize", updateOrientation);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);
  const imageCount = slides.length || hero.images.length;
  const current = imageCount ? i % imageCount : 0;
  const activeSlide = slides[current];
  const title = activeSlide ? activeSlide.titles[lang] : hero.titles[lang];
  const href = activeSlide ? activeSlide.href : hero.href;

  useEffect(() => {
    if (reducedMotion || focused || dialogsOpen || !heroSettings.autoplay || imageCount <= 1) return undefined;
    const t = setInterval(() => {
      setI((p) => {
        const next = (p + 1) % imageCount;
        setMaxVisited((m) => Math.max(m, next + 1));
        return next;
      });
    }, heroSettings.intervalMs);
    return () => clearInterval(t);
  }, [imageCount, reducedMotion, focused, dialogsOpen, heroSettings.autoplay, heroSettings.intervalMs]);

  if (!imageCount) return null;

  const getImageSrc = (index: number) => {
    const slide = slides[index];
    if (slide?.image) {
      if (typeof slide.image === "string") return slide.image;
      return isLandscape ? slide.image.landscape : slide.image.portrait;
    }
    return hero.images[index] ?? "";
  };

  return (
    <div
      className="layout-wide home-hero relative"
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
    >
      <Link href={href} className="hero-rounded-frame relative block w-full overflow-hidden rounded-b-[22px] bg-[var(--color-paper)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]">
        <div ref={viewportRef} className="home-hero-viewport relative h-[462px] lg:h-[600px]">
          {Array.from({ length: imageCount }).map((_, k) => {
            const src = getImageSrc(k);
            const isRendered = k <= maxVisited || k === current || k === (current + 1) % imageCount;
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

        <div className="hero-text-overlay pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-6 sm:pb-8 pt-16 sm:pt-20 text-center bg-gradient-to-t from-black/75 via-black/35 to-transparent">
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
