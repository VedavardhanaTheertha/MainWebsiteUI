"use client";

import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { knowledgeCollectionCounts, knowledgeSections } from "@/gen/library/presentation";
import { applySectionPresentation } from "@/lib/ui-settings";

type HubKey = "library" | "story";

export default function SectionHub({ hubKey }: { hubKey: HubKey }) {
  const { tr } = useLang();
  const hub = tr.section_hubs[hubKey];
  const items = applySectionPresentation(hub.items, knowledgeSections);

  return (
    <>
      <header className="bg-[var(--color-parchment)] px-5 py-7 text-center lg:py-10">
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

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-saffron-600)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
            >
              <div className="relative h-44 overflow-hidden bg-[var(--color-cream-soft)]">
                <ContentImage
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-brand)]">{knowledgeCollectionCounts[item.href] === undefined ? tr.library_browser.unavailable : tr.library_browser.collection_count.replace("{count}", String(knowledgeCollectionCounts[item.href]))}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {items.length === 0 && <p role="status" className="py-8 text-center text-base leading-8">{tr.library_browser.unavailable}</p>}
      </div>
    </>
  );
}
