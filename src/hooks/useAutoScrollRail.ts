"use client";

import { useEffect, useRef } from "react";
import { railAutoScroll } from "@/gen/settings/ui-elements";

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function useAutoScrollRail(itemCount: number, manuallyPaused: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || itemCount <= 1 || !railAutoScroll.enabled || manuallyPaused) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let rafId: number | null = null;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let paused = false;
    let returningToStart = false;
    let returnStartedAt: number | null = null;
    let returnStartLeft = 0;
    let previousTimestamp: number | null = null;
    let forwardPosition: number | null = null;
    let lastScrollLeft = 0;

    const step = (timestamp: number) => {
      if (reducedMotion.matches) {
        previousTimestamp = null;
        returnStartedAt = null;
        forwardPosition = null;
        rafId = requestAnimationFrame(step);
        return;
      }
      const elapsedMs = previousTimestamp === null ? 0 : Math.min(timestamp - previousTimestamp, 100);
      previousTimestamp = timestamp;
      if (!paused) {
        if (returningToStart) {
          if (returnStartedAt === null) {
            returnStartedAt = timestamp;
            returnStartLeft = el.scrollLeft;
          }

          const progress = Math.min((timestamp - returnStartedAt) / railAutoScroll.returnDurationMs, 1);
          el.scrollLeft = returnStartLeft * (1 - easeInOutCubic(progress));

          if (progress === 1) {
            returningToStart = false;
            returnStartedAt = null;
            forwardPosition = null;
          }
        } else {
          const maxScrollLeft = el.scrollWidth - el.clientWidth;
          if (maxScrollLeft > 0) {
            // Keep a precise target: browser zoom can round assigned scroll offsets.
            if (forwardPosition === null || el.scrollLeft !== lastScrollLeft) {
              forwardPosition = el.scrollLeft;
            }
            forwardPosition = Math.min(
              forwardPosition + railAutoScroll.pixelsPerSecond * elapsedMs / 1000,
              maxScrollLeft,
            );
            el.scrollLeft = forwardPosition;
            lastScrollLeft = el.scrollLeft;
            if (forwardPosition >= maxScrollLeft) {
              returningToStart = true;
            }
          }
        }
      }

      rafId = requestAnimationFrame(step);
    };

    const pause = () => {
      paused = true;
      returnStartedAt = null;
      forwardPosition = null;
      if (resumeTimer !== null) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const resume = () => {
      if (resumeTimer !== null) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        resumeTimer = null;
      }, railAutoScroll.resumeDelayMs);
    };
    const wheel = () => { pause(); resume(); };

    rafId = requestAnimationFrame(step);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    el.addEventListener("mousedown", pause);
    el.addEventListener("mouseup", resume);
    el.addEventListener("rail-interaction-start", pause);
    el.addEventListener("rail-interaction-end", resume);
    el.addEventListener("wheel", wheel, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resumeTimer !== null) clearTimeout(resumeTimer);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("mouseup", resume);
      el.removeEventListener("rail-interaction-start", pause);
      el.removeEventListener("rail-interaction-end", resume);
      el.removeEventListener("wheel", wheel);
    };
  }, [itemCount, manuallyPaused]);

  return scrollRef;
}
