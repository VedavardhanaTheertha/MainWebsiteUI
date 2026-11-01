"use client";

import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { knowledgeCollectionCounts, knowledgeSections } from "@/gen/library/presentation";
import { applySectionPresentation } from "@/lib/ui-settings";
import { collectionCardBodyClassName, collectionCardClassName, collectionCardImageClassName } from "@/lib/collection-presentation";

type HubKey = "library" | "story";

export default function SectionHub({ hubKey }: { hubKey: HubKey }) {
  const { tr } = useLang();
  const hub = tr.section_hubs[hubKey];
  const items = applySectionPresentation(hub.items, knowledgeSections);

  return (
    <>
      <header className="bg-transparent px-5 py-7 text-center lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
          {hub.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          {hub.title}
        </h1>
        <p className="mx-auto mt-3 flex min-h-10 max-w-2xl items-center justify-center text-sm text-[var(--color-text-brand)]/75 lg:min-h-12 lg:text-base">
          {hub.description}
        </p>
      </header>

      <div className="layout-collection layout-section mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${collectionCardClassName("collection", true)} layout-info-tile h-full flex flex-col`}
            >
              <div className={collectionCardImageClassName}>
                <ContentImage
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className={collectionCardBodyClassName}>
                <h2 className="layout-tile-title font-display text-base sm:text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                  {item.title}
                </h2>
                <p className="layout-tile-summary mt-1 line-clamp-2 font-body text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
                <p className="layout-tile-footer mt-auto pt-1.5 border-t border-[var(--color-line)] text-meta text-[var(--color-text-brand)] font-semibold line-clamp-1">{knowledgeCollectionCounts[item.href] === undefined ? tr.library_browser.unavailable : tr.library_browser.collection_count.replace("{count}", String(knowledgeCollectionCounts[item.href]))}</p>
              </div>
            </Link>
          ))}
        </div>
        {items.length === 0 && <p role="status" className="py-8 text-center text-base leading-8">{tr.library_browser.unavailable}</p>}
      </div>
    </>
  );
}
