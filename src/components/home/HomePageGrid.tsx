"use client";

import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import type { HomePageCard } from "@/lib/content-types";
import { useLang } from "@/context/LanguageContext";
import { collectionCardBodyClassName, collectionCardClassName, collectionCardImageClassName } from "@/lib/collection-presentation";

export default function HomePageGrid({
  items,
  showFootnotes = true,
}: {
  items: HomePageCard[];
  showFootnotes?: boolean;
}) {
  const { tr, lang } = useLang();
  const bhaktiCopy = tr?.library?.bhakti?.page;

  return (
    <div className="layout-tile-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isBhakti = item.item_type === "bhakti";
        const isSeva = item.item_type === "seva";
        const isRemedy = item.item_type === "remedies";
        const isLiterature = Boolean(item.item_type && !isBhakti && !isSeva && !isRemedy);
        const isCompactTile = isBhakti || isLiterature || isRemedy || isSeva;

        if (isCompactTile) {
          return (
            <Link
              key={item.id}
              href={item.url}
              className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-[var(--color-line-strong)] bg-white/75 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-gold-500)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)] min-h-36"
            >
              <div>
                <span className="absolute left-4 top-0 h-[3px] w-8 bg-[var(--color-gold-500)]" aria-hidden="true" />
                {item.page_type && (
                  <span className="layout-tile-category visual-tile-badge mb-1.5 block w-fit max-w-full truncate rounded-full bg-[var(--color-cream-soft)] px-2.5 py-0.5 text-badge font-bold uppercase tracking-wider text-[var(--color-text-brand)]">
                    {item.page_type}
                  </span>
                )}
                <h3 className={`block pr-5 text-sm font-semibold leading-relaxed text-[var(--color-text-primary)] ${
                  isBhakti ? (lang === "kn" ? "font-kannada" : "font-sans") : ""
                }`}>
                  {item.title}
                </h3>

                {isBhakti ? (
                  <>
                    <span className="mt-1.5 block text-caption text-[var(--color-text-muted)]">
                      {bhaktiCopy?.by ? `${bhaktiCopy.by}: ` : ""}{item.description}
                    </span>
                    {item.footnote && (
                      <span className="mt-2 block pr-6 text-caption text-[var(--color-text-brand)]">
                        {bhaktiCopy?.ankita ? `${bhaktiCopy.ankita}: ` : ""}{item.footnote}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="mt-1 block line-clamp-2 text-xs text-[var(--color-text-secondary)]">
                      {item.description}
                    </span>
                    {showFootnotes && item.footnote && (
                      <span className={`mt-2 block text-caption ${
                        isSeva ? "font-semibold text-[var(--color-saffron-600)]" : "text-[var(--color-text-muted)]"
                      }`}>
                        {item.footnote}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.url}
            className={`${collectionCardClassName("collection", Boolean(item.image))} relative h-full flex flex-col`}
          >
            {item.image && (
              <div className={collectionCardImageClassName}>
                <ContentImage src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>
            )}
            <div className={collectionCardBodyClassName}>
              {/* Badge */}
              {item.page_type && (
                <span className="layout-tile-category visual-tile-badge mb-1.5 block w-fit max-w-full truncate rounded-full bg-[var(--color-cream-soft)] px-2.5 py-0.5 text-badge font-bold uppercase tracking-wider text-[var(--color-text-brand)]">
                  {item.page_type}
                </span>
              )}

              {/* Title */}
              <h3 className="layout-tile-title mb-1.5 line-clamp-2 font-display text-base sm:text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                {item.title}
              </h3>

              {/* Description */}
              <p className="layout-tile-summary line-clamp-2 font-body text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>

              {/* Footnote / Amount */}
              {showFootnotes && item.footnote && (
                <p className="layout-tile-footer mt-auto pt-2 line-clamp-1 border-t border-[var(--color-line)] text-meta text-[var(--color-text-muted)]">
                  {item.footnote}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
