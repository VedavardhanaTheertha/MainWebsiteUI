"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

type HubKey = "library" | "story";

export default function SectionHub({ hubKey }: { hubKey: HubKey }) {
  const { tr } = useLang();
  const hub = tr.section_hubs[hubKey];

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

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hub.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-saffron-600)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
            >
              <div className="relative h-44 overflow-hidden bg-[var(--color-cream-soft)]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/55 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-bold text-[var(--color-text-brand)]">
                  {hub.open_label}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
