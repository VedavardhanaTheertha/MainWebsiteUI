"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function MediaPage() {
  const { tr, lang } = useLang();
  const photosLabel = lang === "kn" ? "ಫೋಟೋಗಳು" : "Photos";
  const videosLabel = lang === "kn" ? "ವೀಡಿಯೊಗಳು" : "Videos";

  return (
    <div className="pb-10">
      <PageHero heading={tr.media.heading} subheading={tr.media.intro} />
      <section className="flex gap-3 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
        <Link
          href="/media/photos"
          className="flex-1 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-5 text-center shadow-[var(--shadow-card)]"
        >
          <span className="font-display text-lg text-[var(--color-ink-900)]">{photosLabel}</span>
        </Link>
        <Link
          href="/media/videos"
          className="flex-1 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-5 text-center shadow-[var(--shadow-card)]"
        >
          <span className="font-display text-lg text-[var(--color-ink-900)]">{videosLabel}</span>
        </Link>
      </section>
    </div>
  );
}
