"use client";

import { useEffect, useRef } from "react";

const FORWARD_SCROLL_STEP = 0.6;
const RETURN_DURATION_MS = 2200;

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function useAutoScrollRail(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || itemCount <= 1) return;

    let rafId: number | null = null;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let paused = false;
    let returningToStart = false;
    let returnStartedAt: number | null = null;
    let returnStartLeft = 0;

    const step = (timestamp: number) => {
      if (!paused) {
        if (returningToStart) {
          if (returnStartedAt === null) {
            returnStartedAt = timestamp;
            returnStartLeft = el.scrollLeft;
          }

          const progress = Math.min((timestamp - returnStartedAt) / RETURN_DURATION_MS, 1);
          el.scrollLeft = returnStartLeft * (1 - easeInOutCubic(progress));

          if (progress === 1) {
            returningToStart = false;
            returnStartedAt = null;
          }
        } else {
          const maxScrollLeft = el.scrollWidth - el.clientWidth;
          if (maxScrollLeft > 0) {
            el.scrollLeft += FORWARD_SCROLL_STEP;
            if (el.scrollLeft >= maxScrollLeft) {
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
      if (resumeTimer !== null) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const resume = () => {
      resumeTimer = setTimeout(() => {
        paused = false;
        resumeTimer = null;
      }, 1500);
    };

    rafId = requestAnimationFrame(step);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    el.addEventListener("mousedown", pause);
    el.addEventListener("mouseup", resume);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resumeTimer !== null) clearTimeout(resumeTimer);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("mouseup", resume);
    };
  }, [itemCount]);

  return scrollRef;
}
