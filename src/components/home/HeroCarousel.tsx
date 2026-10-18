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
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const current = images.length ? i % images.length : 0;

  useEffect(() => {
    if (reducedMotion || paused || hovered || focused || dialogsOpen || !heroSettings.autoplay || images.length <= 1) return undefined;
    const t = setInterval(() => setI((p) => (p + 1) % images.length), heroSettings.intervalMs);
    return () => clearInterval(t);
  }, [images.length, reducedMotion, paused, hovered, focused, dialogsOpen, heroSettings.autoplay, heroSettings.intervalMs]);

  return (
    <div className="relative"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
    <Link href={href} className="relative block w-full overflow-hidden rounded-b-[22px] bg-[var(--color-paper)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]">
      <div className="relative h-[462px] lg:h-[600px]">
      {images.map((src, k) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity"
          style={{ opacity: k === current ? 1 : 0, transitionDuration: `${reducedMotion || paused ? 0 : heroSettings.fadeDurationMs}ms` }}
        >
          <ContentImage
            src={src}
            alt=""
            fill
            priority={k === 0}
            sizes="100vw"
          />
        </div>
      ))}

      </div>

      <div className={`px-6 py-6 text-center ${heroSettings.autoplay && images.length > 1 && !reducedMotion ? "pr-20" : ""}`}>
        <h1
          className="font-display text-[26px] lg:text-4xl leading-tight text-[var(--color-text-primary)] whitespace-pre-line"
        >
          {title}
        </h1>
      </div>
    </Link>
    {heroSettings.autoplay && images.length > 1 && !reducedMotion && (
      <button type="button" onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? tr.page_controls.resume_motion : tr.page_controls.pause_motion}
        className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-paper)] text-[var(--color-text-brand)] shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
      >
        {paused ? <Play aria-hidden="true" size={20} /> : <Pause aria-hidden="true" size={20} />}
      </button>
    )}
    </div>
  );
}
