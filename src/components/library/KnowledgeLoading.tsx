"use client";

import { useLang } from "@/context/LanguageContext";

export default function KnowledgeLoading() {
  const { tr } = useLang();
  return <p role="status" aria-live="polite" className="mx-auto max-w-3xl px-5 py-12 text-base leading-8">{tr.library_browser.loading}</p>;
}
