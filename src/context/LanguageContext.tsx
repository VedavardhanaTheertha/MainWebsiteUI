"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  content,
  languages,
  defaultLang,
  type Lang,
  type ContentShape,
} from "@/gen/content";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: ContentShape;
  /** Languages discovered at build time — drives the switcher UI. */
  languages: typeof languages;
}

const LanguageContext = createContext<LangCtx>({
  lang: defaultLang,
  setLang: () => {},
  tr: content[defaultLang],
  languages,
});

const STORAGE_KEY = "shiroor-lang";
const LANGUAGE_EVENT = "site-language-change";

/**
 * Narrows an arbitrary stored string to a language this build actually contains.
 * Guards against a stale localStorage value left behind by a language that has
 * since been removed from content/languages/.
 */
function isKnownLang(value: string | null): value is Lang {
  return value !== null && languages.some((l) => l.code === value);
}

/**
 * Supplies the active language and its content to the whole app. The set of
 * languages comes from the generated content module, which discovers them by
 * scanning content/languages/ — no locale is named here, so adding a language
 * requires no change to this file.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener(LANGUAGE_EVENT, notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener(LANGUAGE_EVENT, notify);
      };
    },
    () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return isKnownLang(stored) ? stored : defaultLang;
    },
    () => defaultLang,
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: content[lang], languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Reads the active language, the content for it, and the available languages. */
export function useLang() {
  return useContext(LanguageContext);
}
