"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPreferenceStore } from "@/lib/browser-preferences";
import {
  content,
  alternateContent,
  defaultContentMode,
  isContentSwitchable,
  languages,
  defaultLang,
  type Lang,
  type ContentShape,
} from "@/gen/content";

export type ContentMode = "real" | "placeholder";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: ContentShape;
  contentMode: ContentMode;
  setContentMode: (mode: ContentMode) => void;
  /** Languages discovered at build time — drives the switcher UI. */
  languages: typeof languages;
}

const LanguageContext = createContext<LangCtx>({
  lang: defaultLang,
  setLang: () => {},
  tr: content[defaultLang],
  contentMode: defaultContentMode,
  setContentMode: () => {},
  languages,
});

const STORAGE_KEY = "shiroor-lang";
const CONTENT_MODE_STORAGE_KEY = "site-content-mode";

/**
 * Narrows an arbitrary stored string to a language this build actually contains.
 * Guards against a stale localStorage value left behind by a language that has
 * since been removed from content/languages/.
 */
function isKnownLang(value: string | null): value is Lang {
  return value !== null && languages.some((l) => l.code === value);
}

const languagePreference = createPreferenceStore(STORAGE_KEY, defaultLang, isKnownLang);
const contentPreference = createPreferenceStore<ContentMode>(
  CONTENT_MODE_STORAGE_KEY, defaultContentMode,
  (value): value is ContentMode => value === "real" || value === "placeholder",
);
const noSubscription = () => () => {};
const defaultModeSnapshot = () => defaultContentMode;

/**
 * Supplies the active language and its content to the whole app. The set of
 * languages comes from the generated content module, which discovers them by
 * scanning content/languages/ — no locale is named here, so adding a language
 * requires no change to this file.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    languagePreference.subscribe,
    languagePreference.getSnapshot,
    languagePreference.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    const fontFamily = languages.find(({ code }) => code === lang)?.font_family;
    if (fontFamily) document.documentElement.style.setProperty("--font-localized", fontFamily);
    else document.documentElement.style.removeProperty("--font-localized");
  }, [lang]);

  const setLang = (l: Lang) => {
    languagePreference.setValue(l);
  };

  const contentMode = useSyncExternalStore<ContentMode>(
    isContentSwitchable ? contentPreference.subscribe : noSubscription,
    isContentSwitchable ? contentPreference.getSnapshot : defaultModeSnapshot,
    defaultModeSnapshot,
  );

  const setContentMode = (nextMode: ContentMode) => {
    if (!isContentSwitchable) return;
    contentPreference.setValue(nextMode);
  };

  const activeContent = contentMode !== defaultContentMode && alternateContent
    ? alternateContent
    : content;

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      tr: activeContent[lang],
      languages,
      contentMode,
      setContentMode,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Reads the active language, the content for it, and the available languages. */
export function useLang() {
  return useContext(LanguageContext);
}
