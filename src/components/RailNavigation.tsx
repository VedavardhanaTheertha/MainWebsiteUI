"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useUiSettings } from "@/context/UiSettingsContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function RailNavigation({
  scrollRef, className = "",
}: {
  scrollRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const { tr } = useLang();
  const { layoutSettings } = useUiSettings();
  const reducedMotion = useReducedMotion();
  const focused = useRef(false);
  const [bounds, setBounds] = useState({ previous: false, next: false });

  useEffect(() => {
    const track = scrollRef.current;
    if (!layoutSettings.carouselNavigation || !track) return;
    const measure = () => {
      const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
      const previous = maximum > 1 && track.scrollLeft > 1;
      const next = maximum > 1 && track.scrollLeft < maximum - 1;
      setBounds((current) => current.previous === previous && current.next === next ? current : { previous, next });
    };
    const observer = new ResizeObserver(measure);
    const observeChildren = () => {
      observer.disconnect();
      observer.observe(track);
      for (const child of track.children) observer.observe(child);
      measure();
    };
    const mutations = new MutationObserver(observeChildren);
    mutations.observe(track, { childList: true, subtree: true, characterData: true });
    const frame = requestAnimationFrame(observeChildren);
    track.addEventListener("scroll", measure, { passive: true });
    track.addEventListener("load", measure, { capture: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      track.removeEventListener("scroll", measure);
      track.removeEventListener("load", measure, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, [layoutSettings.carouselNavigation, scrollRef]);

  if (!layoutSettings.carouselNavigation) return null;
  const interaction = (active: boolean) => {
    scrollRef.current?.dispatchEvent(new Event(active ? "rail-interaction-start" : "rail-interaction-end"));
  };
  const move = (direction: number) => {
    const track = scrollRef.current;
    if (!track) return;
    interaction(true);
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: reducedMotion ? "instant" : "smooth" });
    if (!focused.current) interaction(false);
  };
  return (
    <div
      className={`layout-rail-navigation ${className}`}
      onFocus={() => { focused.current = true; interaction(true); }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focused.current = false;
          interaction(false);
        }
      }}
    >
      <button type="button" aria-label={tr.layout_experiments.previous} disabled={!bounds.previous} onClick={() => move(-1)}>
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button type="button" aria-label={tr.layout_experiments.next} disabled={!bounds.next} onClick={() => move(1)}>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
