"use client";

import { useState, useRef, useEffect } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import type { HomePageCard } from "@/lib/content-types";
import RailMotionControl from "@/components/RailMotionControl";

export default function PageCarousel({
  items,
  dataCarousel = "top_carousel",
  ariaLabel = "Carousel tiles",
}: {
  items: HomePageCard[];
  dataCarousel?: string;
  ariaLabel?: string;
}) {
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const track = useAutoScrollRail(items.length, paused);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafId.current !== null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  if (!items.length) return null;

  const handleScroll = () => {
    if (typeof requestAnimationFrame === "undefined") {
      if (!track.current) return;
      const el = track.current;
      const firstChild = el.firstElementChild as HTMLElement | null;
      const cardWidth = firstChild ? firstChild.offsetWidth + 20 : 320;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(0, idx), items.length - 1));
      return;
    }
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!track.current) return;
      const el = track.current;
      const firstChild = el.firstElementChild as HTMLElement | null;
      const cardWidth = firstChild ? firstChild.offsetWidth + 20 : 320;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(0, idx), items.length - 1));
    });
  };

  const scrollToTile = (idx: number) => {
    if (!track.current) return;
    const el = track.current;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 20 : 320;
    el.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
    setActiveIndex(idx);
  };

  return (
    <section data-carousel={dataCarousel} className="layout-wide layout-section relative mx-auto my-0 max-w-7xl">
      {items.length > 1 && <RailMotionControl className="" paused={paused} onToggle={() => setPaused((value) => !value)} />}
      <div
        ref={track}
        onScroll={handleScroll}
        className="layout-carousel-track flex gap-5 overflow-x-auto px-4 pt-0.5 pb-1 lg:px-8"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <Link key={item.id} href={item.url}
            className="collection-tile visual-tile group relative flex min-h-80 w-[82vw] max-w-[320px] shrink-0 flex-col overflow-hidden rounded-[18px] bg-[var(--color-paper)] border border-[var(--color-line)] shadow-sm hover:shadow-md hover:border-[var(--color-saffron-500)] hover:-translate-y-0.5 transition-all duration-300 lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
          >
            <div className="visual-tile-art relative h-44 w-full shrink-0">
              <ContentImage src={item.image} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 391px) 320px, 82vw" />
            </div>
            <div className="visual-tile-body flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-3.5 text-[var(--color-text-primary)]">
              <p className="layout-tile-category visual-tile-badge mb-1.5 block w-fit max-w-full truncate rounded-full bg-[var(--color-cream-soft)] px-2.5 py-0.5 text-badge font-bold uppercase tracking-wider text-[var(--color-text-brand)]">
                {item.page_type}
              </p>
              <h2 className="layout-tile-title mb-1 line-clamp-2 font-display text-base sm:text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                {item.title}
              </h2>
              <p className="layout-tile-summary line-clamp-2 font-body text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
              {item.footnote && (
                <p className="layout-tile-footer mt-auto pt-1.5 border-t border-[var(--color-line)] text-meta text-[var(--color-text-muted)] line-clamp-1">
                  {item.footnote}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Progress Dots Indicator for Tiles */}
      {items.length > 1 && (
        <div className="flex justify-center mt-1 pb-0.5">
          <div
            role="tablist"
            aria-label={ariaLabel}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-sm"
          >
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`${item.title} (${idx + 1} of ${items.length})`}
                onClick={() => scrollToTile(idx)}
                className="relative flex h-5 min-w-5 items-center justify-center p-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-400)] rounded-full before:absolute before:-inset-2 before:content-['']"
              >
                <span
                  className={`block h-2 transition-all duration-300 rounded-full ${
                    idx === activeIndex
                      ? "w-6 bg-[var(--color-saffron-400)] border border-[var(--color-saffron-300)]/70 shadow-xs"
                      : "w-2 bg-white/40 border border-white/25 shadow-2xs hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
