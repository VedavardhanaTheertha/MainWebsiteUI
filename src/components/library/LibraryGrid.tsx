"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const CATEGORY_ORDER = ["mantra", "shastra", "bhakti", "jnana", "dharma", "dasasahitya"] as const;

export default function LibraryGrid() {
  const { tr } = useLang();
  const lib = tr.library;

  return (
    <div className="grid grid-cols-2 gap-3 mt-3.5 max-w-4xl mx-auto lg:grid-cols-6">
      {CATEGORY_ORDER.map((key) => {
        const cat = lib[key];
        return (
          <Link
            key={key}
            href={`/library/${key}`}
            className="rounded-[8px] overflow-hidden bg-[var(--color-paper)] border border-[var(--color-line)] shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
          >
            <div className="relative h-24">
              <Image src={cat.img} alt="" fill sizes="200px" className="object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(26,17,8,.05), rgba(26,17,8,.32))" }}
              />
            </div>
            <p className="font-display text-base text-[var(--color-text-primary)] px-3 py-2.5 leading-tight">
              {cat.title}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
