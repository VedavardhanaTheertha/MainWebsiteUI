"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const overrideKey = "site_motion_override";

function getStoredOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(overrideKey);
    if (item === "force_motion") return false;
    if (item === "reduce") return true;
  } catch {}
  return null;
}

function subscribe(listener: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return () => {};
  const media = window.matchMedia(query);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === overrideKey) listener();
  };
  if (media && typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
  }
  if (typeof window.addEventListener === "function") {
    window.addEventListener("storage", handleStorage);
    window.addEventListener("motion-preference-change", listener);
  }
  return () => {
    if (media && typeof media.removeEventListener === "function") {
      media.removeEventListener("change", listener);
    }
    if (typeof window.removeEventListener === "function") {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("motion-preference-change", listener);
    }
  };
}

const snapshot = () => {
  const override = getStoredOverride();
  if (override !== null) return override;
  return window.matchMedia(query).matches;
};

export function getStoredMotionOverride(): "system" | "force_motion" | "reduce" {
  if (typeof window === "undefined") return "system";
  try {
    const item = localStorage.getItem(overrideKey);
    if (item === "force_motion" || item === "reduce") return item;
  } catch {}
  return "system";
}

export function setMotionOverride(override: "system" | "force_motion" | "reduce") {
  if (typeof window === "undefined") return;
  try {
    if (override === "system") {
      localStorage.removeItem(overrideKey);
    } else {
      localStorage.setItem(overrideKey, override);
    }
    window.dispatchEvent(new Event("motion-preference-change"));
  } catch {}
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
