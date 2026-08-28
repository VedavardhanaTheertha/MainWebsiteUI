"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  content,
  blogPosts,
  isContentSwitchable,
  localPlaceholderBlogPosts,
  localPlaceholderContent,
  languages,
  defaultLang,
  type Lang,
  type ContentShape,
} from "@/gen/content";
import type { BlogPost } from "@/lib/content-types";

export type ContentMode = "real" | "placeholder";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: ContentShape;
  contentMode: ContentMode;
  setContentMode: (mode: ContentMode) => void;
  blogPosts: BlogPost[];
  /** Languages discovered at build time — drives the switcher UI. */
  languages: typeof languages;
}

const LanguageContext = createContext<LangCtx>({
  lang: defaultLang,
  setLang: () => {},
  tr: content[defaultLang],
  contentMode: "real",
  setContentMode: () => {},
  blogPosts,
  languages,
});

const STORAGE_KEY = "shiroor-lang";
const LANGUAGE_EVENT = "site-language-change";
const CONTENT_MODE_STORAGE_KEY = "site-content-mode";
const CONTENT_MODE_EVENT = "site-content-mode-change";

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

  const contentMode = useSyncExternalStore<ContentMode>(
    (notify) => {
      if (!isContentSwitchable) return () => {};
      window.addEventListener("storage", notify);
      window.addEventListener(CONTENT_MODE_EVENT, notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener(CONTENT_MODE_EVENT, notify);
      };
    },
    () => {
      if (!isContentSwitchable) return "real";
      return window.localStorage.getItem(CONTENT_MODE_STORAGE_KEY) === "placeholder"
        ? "placeholder"
        : "real";
    },
    () => "real",
  );

  const setContentMode = (nextMode: ContentMode) => {
    if (!isContentSwitchable) return;
    window.localStorage.setItem(CONTENT_MODE_STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event(CONTENT_MODE_EVENT));
  };

  const activeContent = contentMode === "placeholder" && localPlaceholderContent
    ? localPlaceholderContent
    : content;
  const activeBlogPosts = contentMode === "placeholder" && localPlaceholderBlogPosts
    ? localPlaceholderBlogPosts
    : blogPosts;

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      tr: activeContent[lang],
      languages,
      contentMode,
      setContentMode,
      blogPosts: activeBlogPosts,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Reads the active language, the content for it, and the available languages. */
export function useLang() {
  return useContext(LanguageContext);
}
