"use client";

import { useEffect, useRef } from "react";
import { railAutoScroll } from "@/gen/settings/ui-elements";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDialogsOpen } from "@/hooks/useDialog";

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function useAutoScrollRail(itemCount: number, manuallyPaused: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const dialogsOpen = useDialogsOpen();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || itemCount <= 1 || !railAutoScroll.enabled || manuallyPaused || reducedMotion || dialogsOpen) return;

    let rafId: number | null = null;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let paused = false;
    let inView = true;
    let focused = el.contains(document.activeElement);
    let returningToStart = false;
    let returnStartedAt: number | null = null;
    let returnStartLeft = 0;
    let previousTimestamp: number | null = null;
    let forwardPosition: number | null = null;
    let lastScrollLeft = 0;

    const canAnimate = () => !paused && !focused && inView && !document.hidden &&
      el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1;
    const stop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      previousTimestamp = null;
      returnStartedAt = null;
      returningToStart = false;
      forwardPosition = null;
    };
    const refresh = () => {
      if (!canAnimate()) stop();
      else if (rafId === null) rafId = requestAnimationFrame(step);
    };
    const step = (timestamp: number) => {
      rafId = null;
      if (!canAnimate()) { stop(); return; }
      const elapsedMs = previousTimestamp === null ? 0 : Math.min(timestamp - previousTimestamp, 100);
      previousTimestamp = timestamp;
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
      refresh();
    };

    const pause = () => {
      paused = true;
      stop();
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
        refresh();
      }, railAutoScroll.resumeDelayMs);
    };
    const wheel = () => { pause(); resume(); };
    const focusIn = () => { focused = true; refresh(); };
    const focusOut = (event: FocusEvent) => {
      focused = event.relatedTarget instanceof Node && el.contains(event.relatedTarget);
      refresh();
    };
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(el);
    const visibilityObserver = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      refresh();
    });
    visibilityObserver.observe(el);

    refresh();
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    el.addEventListener("touchcancel", resume);
    el.addEventListener("mousedown", pause);
    el.addEventListener("mouseup", resume);
    el.addEventListener("rail-interaction-start", pause);
    el.addEventListener("rail-interaction-end", resume);
    el.addEventListener("wheel", wheel, { passive: true });
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    window.addEventListener("resize", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      stop();
      if (resumeTimer !== null) clearTimeout(resumeTimer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("touchcancel", resume);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("mouseup", resume);
      el.removeEventListener("rail-interaction-start", pause);
      el.removeEventListener("rail-interaction-end", resume);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [itemCount, manuallyPaused, reducedMotion, dialogsOpen]);

  return scrollRef;
}
