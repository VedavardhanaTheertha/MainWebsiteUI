"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

export function DesktopHeader() {
  const { tr } = useLang();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[var(--color-line-soft)] bg-[var(--color-cream-soft)]/95 backdrop-blur lg:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-3">
        <Link href="/" className="shrink-0">
          <div className="font-display text-xl text-[var(--color-ink-900)]">{tr.meta.siteName}</div>
          <div className="text-[11px] tracking-wide text-[var(--color-ink-500)]">{tr.meta.blessing}</div>
        </Link>

        <nav className="flex items-center gap-1">
          {tr.nav.items.map((item) => (
            <div key={item.href + item.label} className="group relative">
              <Link
                href={item.href}
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--color-ink-900)] transition-colors hover:text-[var(--color-saffron-700)]"
              >
                {item.label}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="invisible absolute left-0 top-full min-w-56 rounded-[var(--radius-md)] border border-[var(--color-line-soft)] bg-[var(--color-cream-soft)] p-2 opacity-0 shadow-[var(--shadow-card-lg)] transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-ink-700)] hover:bg-[var(--color-cream)] hover:text-[var(--color-ink-900)]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageToggle />
          <Link
            href="/seva/donations"
            className="rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-4 py-2 text-sm font-semibold text-white"
          >
            {tr.bottomBar.items.find((i) => i.id === "donate")?.label ?? "Donate"}
          </Link>
        </div>
      </div>
    </header>
  );
}
