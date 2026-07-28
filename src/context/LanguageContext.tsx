"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { content } from "@/generated/content";
import type { ContentShape, Locale } from "@/lib/content-types";

const STORAGE_KEY = "shiroor-lang";
const DEFAULT_LOCALE: Locale = "en";

/**
 * localStorage is an external system the server can't see, so reading it is
 * modeled as an external store (useSyncExternalStore) rather than
 * read-in-effect-then-setState — that avoids both a hydration mismatch and
 * the extra render a plain useEffect+setState would cause on mount.
 */
let currentLang: Locale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "kn") currentLang = stored;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Locale {
  return currentLang;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function commitLang(next: Locale) {
  currentLang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable (private mode, etc.) — in-memory state still works
  }
  listeners.forEach((listener) => listener());
}

interface LanguageContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
  tr: ContentShape;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang: commitLang, tr: content[lang] }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang() must be used within a LanguageProvider");
  }
  return ctx;
}
