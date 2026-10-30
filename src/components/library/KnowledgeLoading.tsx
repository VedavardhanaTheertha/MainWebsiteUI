"use client";

import { useLang } from "@/context/LanguageContext";

export default function KnowledgeLoading() {
  const { tr } = useLang();
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-3xl px-5 py-8 md:py-12"
    >
      <span className="sr-only">{tr.library_browser.loading}</span>

      {/* Back button pill skeleton */}
      <div className="skeleton-shimmer h-9 w-28 rounded-full mb-8" aria-hidden="true" />

      {/* Article Title skeleton */}
      <div className="space-y-3 mb-6" aria-hidden="true">
        <div className="skeleton-shimmer h-8 md:h-10 w-4/5 rounded-lg" />
        <div className="skeleton-shimmer h-8 md:h-10 w-3/5 rounded-lg" />
      </div>

      {/* Meta tags & reading time skeleton */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[var(--color-line)]" aria-hidden="true">
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
        <div className="skeleton-shimmer h-6 w-28 rounded-full" />
      </div>

      {/* Body paragraphs skeleton */}
      <div className="space-y-4" aria-hidden="true">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-11/12 rounded" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        <div className="h-2" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-9/12 rounded" />
        <div className="skeleton-shimmer h-4 w-10/12 rounded" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
