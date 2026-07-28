"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export function SecondaryLinks() {
  const { tr } = useLang();

  return (
    <section className="mt-8 flex flex-col gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] mx-4 shadow-[var(--shadow-card)] lg:mx-auto lg:max-w-6xl">
      {tr.home.secondaryLinks.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[var(--color-ink-900)]"
        >
          {link.label}
          <ChevronRight size={16} className="text-[var(--color-ink-500)]" />
        </Link>
      ))}
    </section>
  );
}
