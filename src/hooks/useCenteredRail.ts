"use client";

import { useEffect, type RefObject } from "react";
import { useUiSettings } from "@/context/UiSettingsContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function useCenteredRail(scrollRef: RefObject<HTMLElement | null>) {
  const { layoutSettings } = useUiSettings();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const track = scrollRef.current;
    if (!layoutSettings.centeredCarousel || !track) return;
    let frame: number | null = null;
    const styledCards = new Set<HTMLElement>();
    const clear = () => {
      delete track.dataset.centeredRail;
      for (const property of ["--centered-card-width", "--centered-edge", "--centered-room"]) track.style.removeProperty(property);
      for (const card of styledCards) card.style.removeProperty("--centered-scale");
      styledCards.clear();
    };
    const set = (element: HTMLElement, property: string, value: string) => {
      if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
    };
    const cards = () => Array.from(track.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    const update = () => {
      frame = null;
      const children = cards();
      const style = getComputedStyle(track);
      // Desktop collection grids stay grids, including ones with incidental overflow.
      const usable = style.display === "flex" && /^(auto|scroll)$/.test(style.overflowX) &&
        children.length > 1 && track.clientWidth > 0 && track.scrollWidth > track.clientWidth + 1;
      if (!usable) { clear(); return; }

      const width = track.clientWidth;
      const gap = Number.parseFloat(style.columnGap) || 0;
      const sideScale = 0.85;
      // Reserve visible neighbors even after they shrink toward the edges.
      const mobileWidth = Math.min(width * 0.74, Math.max(1, (width / 2 - gap - 20) / (1 - sideScale / 2)));
      const cardWidth = window.matchMedia("(min-width: 48rem)").matches
        ? Math.max(1, (width - gap * 2) / 3)
        : mobileWidth;
      set(track, "--centered-card-width", `${cardWidth}px`);
      set(track, "--centered-edge", `${Math.max(0, (width - cardWidth) / 2)}px`);
      track.dataset.centeredRail = "active";

      for (const previous of styledCards) {
        if (!children.includes(previous)) {
          previous.style.removeProperty("--centered-scale");
          styledCards.delete(previous);
        }
      }
      const center = track.scrollLeft + width / 2;
      const centers = children.map((card) => card.offsetLeft + card.offsetWidth / 2);
      const nearest = centers.reduce((best, value, index) =>
        Math.abs(value - center) < Math.abs(centers[best] - center) ? index : best, 0);
      children.forEach((card, index) => {
        const distance = Math.min(1, Math.abs(centers[index] - center) / (card.offsetWidth + gap || 1));
        const scale = reducedMotion ? (index === nearest ? 1 : sideScale) : 1 - distance * (1 - sideScale);
        set(card, "--centered-scale", scale.toFixed(5));
        styledCards.add(card);
      });
      const height = Math.max(...children.map((card) => card.offsetHeight));
      set(track, "--centered-room", `${16 + height * 0.025}px`);
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    const observeCards = () => {
      observer.disconnect();
      observer.observe(track);
      for (const card of cards()) observer.observe(card);
      schedule();
    };
    const mutations = new MutationObserver(observeCards);
    mutations.observe(track, { childList: true, subtree: true, characterData: true });
    observeCards();
    track.addEventListener("scroll", schedule, { passive: true });
    track.addEventListener("load", schedule, { capture: true });
    window.addEventListener("resize", schedule);
    document.fonts?.addEventListener("loadingdone", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      track.removeEventListener("scroll", schedule);
      track.removeEventListener("load", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      document.fonts?.removeEventListener("loadingdone", schedule);
      clear();
    };
  }, [layoutSettings.centeredCarousel, reducedMotion, scrollRef]);
}
