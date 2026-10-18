"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { alternateHomeHero, defaultContentMode, homeHero } from "@/gen/content";
import { heroSettings } from "@/gen/settings/ui-elements";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDialogsOpen } from "@/hooks/useDialog";

export default function HeroCarousel() {
  const { lang, contentMode, tr } = useLang();
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
  }, [images.length, reducedMotion, paused, hovered, focused, dialogsOpen]);

  return (
    <div className="relative"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
    <Link href={href} className="relative block w-full h-[462px] lg:h-[600px] overflow-hidden rounded-b-[22px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]">
      {images.map((src, k) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity"
          style={{ opacity: k === current ? 1 : 0, transitionDuration: `${reducedMotion || paused ? 0 : heroSettings.fadeDurationMs}ms` }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={k === 0}
            sizes="100vw"
            className="object-cover"
            style={{ transform: reducedMotion || paused || k === current ? "scale(1)" : "scale(1.04)", transition: `transform ${reducedMotion || paused ? 0 : heroSettings.zoomDurationMs}ms ease-out` }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,12,4,.42) 0%, rgba(20,12,4,.05) 22%, rgba(20,12,4,0) 40%, rgba(20,12,4,.55) 70%, rgba(16,9,3,.86) 100%)",
        }}
      />

      <div className="absolute left-0 right-0 bottom-0 px-6 pb-8 text-center">
        <h1
          className="font-display text-[26px] lg:text-4xl leading-tight text-[var(--color-cream-hi)] whitespace-pre-line mb-5"
          style={{ textShadow: "0 1px 20px rgba(0,0,0,.4)" }}
        >
          {title}
        </h1>
      </div>
    </Link>
    {heroSettings.autoplay && images.length > 1 && !reducedMotion && (
      <button type="button" onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? tr.page_controls.resume_motion : tr.page_controls.pause_motion}
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-paper)] text-[var(--color-text-brand)] shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
      >
        {paused ? <Play aria-hidden="true" size={20} /> : <Pause aria-hidden="true" size={20} />}
      </button>
    )}
    </div>
  );
}
