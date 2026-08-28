"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import SiteFooter from "@/components/SiteFooter";
import type { LibraryShape } from "@/lib/content-types";

export default function LibraryCategoryPage({ categoryKey }: { categoryKey: keyof Omit<LibraryShape, "eyebrow" | "page_title"> }) {
  const { tr } = useLang();
  const cat = tr.library[categoryKey];

  return (
    <>
      <div className="max-w-3xl mx-auto lg:max-w-5xl">
        <div className="px-4 py-3">
          <Link href="/library" className="inline-block font-body text-[var(--color-text-brand)] text-xs hover:underline">
            ← {tr.library.page_title}
          </Link>
        </div>

        <div className="relative h-[150px] lg:h-[220px] mx-4 lg:mx-0 rounded-[8px] overflow-hidden">
          <Image src={cat.img} alt="" fill sizes="(max-width: 1023px) 100vw, 1000px" className="object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(26,17,8,.1), rgba(26,17,8,.5))" }}
          />
          <div className="absolute left-4 lg:left-6 bottom-3.5">
            <p className="font-display text-[30px] text-[var(--color-cream-hi)] leading-none">{cat.title}</p>
            <p className="text-[13px] mt-1" style={{ color: "var(--color-saffron-200)", fontFamily: "var(--font-kannada)" }}>{cat.kn}</p>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4">
          <p className="text-[14.5px] leading-[1.6] text-[var(--color-text-secondary)] mb-4">{cat.desc}</p>

          <div className="flex flex-col gap-2.5">
            {cat.items.map((it) => (
              <div
                key={it.name}
                className="flex items-center gap-3.5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-3 shadow-[var(--shadow-xs)]"
              >
                <span
                  className="w-12 h-12 shrink-0 rounded-[4px] bg-[var(--color-saffron-50)] text-[var(--color-saffron-700)] flex items-center justify-center text-2xl"
                  style={{ fontFamily: "var(--font-sanskrit)" }}
                >
                  ॐ
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight">{it.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{it.sub}</p>
                </div>
                <svg className="text-[var(--color-text-secondary)] shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
