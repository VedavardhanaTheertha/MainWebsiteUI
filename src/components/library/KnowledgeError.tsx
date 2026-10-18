"use client";

import { useLang } from "@/context/LanguageContext";

export default function KnowledgeError({ reset }: { reset: () => void }) {
  const { tr } = useLang();
  return <div role="alert" className="mx-auto max-w-3xl px-5 py-12">
    <p className="text-base leading-8">{tr.library_browser.error}</p>
    <button type="button" onClick={reset} className="mt-5 min-h-11 rounded-full border border-[var(--color-line)] px-5 py-2 font-semibold">{tr.library_browser.retry}</button>
  </div>;
}
