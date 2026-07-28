"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { SocialIcon } from "@/components/shared/SocialIcon";

export function Footer() {
  const { tr } = useLang();

  return (
    <footer className="mt-12 border-t border-[var(--color-line-soft)] bg-[var(--color-cream-soft)] px-6 py-10 text-center">
      <div className="font-display text-xl text-[var(--color-ink-900)]">{tr.meta.siteName}</div>
      <p className="mt-2 text-xs tracking-wide text-[var(--color-ink-500)]">{tr.footer.blessing}</p>

      <div className="mt-6 flex items-center justify-center gap-4">
        {tr.footer.social.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            aria-label={s.label}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-line)] text-[var(--color-ink-700)]"
          >
            <SocialIcon id={s.id} className="h-4 w-4" />
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-xs text-xs text-[var(--color-ink-500)]">{tr.footer.address}</p>
      <p className="mt-2 text-[11px] text-[var(--color-ink-300)]">{tr.footer.copyright}</p>
    </footer>
  );
}
