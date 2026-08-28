"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isKnownLang(stored)) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
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
