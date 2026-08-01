"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import SiteFooter from "@/components/SiteFooter";
import type { StoriesShape } from "@/lib/content-types";

export default function StoryPage({ storyKey }: { storyKey: keyof StoriesShape }) {
  const { tr } = useLang();
  const s = tr.stories[storyKey];

  return (
    <>
      <div className="max-w-3xl mx-auto lg:max-w-5xl">
        <div className="px-4 py-3">
          <Link href="/" className="inline-block font-body text-[var(--color-text-brand)] text-xs hover:underline">
            ← Home
          </Link>
        </div>

        <div className="relative h-[160px] lg:h-[240px] mx-4 lg:mx-0 rounded-[8px] overflow-hidden">
          <Image src={s.img} alt="" fill sizes="(max-width: 1023px) 100vw, 1000px" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26,17,8,.1), rgba(26,17,8,.5))" }} />
          <div className="absolute left-4 lg:left-6 bottom-3.5">
            <p className="font-display text-[30px] text-[var(--color-cream-hi)] leading-none">{s.title}</p>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4">
          <p className="text-[14.5px] leading-[1.6] text-[var(--color-text-secondary)] mb-4">{s.intro}</p>

          <div className="flex flex-col gap-2.5">
            {s.items.map((it) => (
              <div
                key={it.name}
                className="flex items-center justify-between gap-3 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-3.5 shadow-[var(--shadow-xs)]"
              >
                <div>
                  <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight">{it.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{it.sub}</p>
                </div>
                <ChevronRight size={20} className="text-[var(--color-text-secondary)] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
