"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

export function MobileHeader() {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpanded(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line-soft)] bg-[var(--color-cream-soft)]/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link href="/" className="font-display text-lg text-[var(--color-ink-900)]">
          {tr.meta.siteName}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-900)]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <p className="px-4 pb-2 text-center text-[11px] tracking-wide text-[var(--color-ink-500)]">
        {tr.meta.blessing}
      </p>

      {open && (
        <div className="fixed inset-0 top-[85px] z-30 overflow-y-auto bg-[var(--color-cream)]">
          <nav className="flex flex-col divide-y divide-[var(--color-line-soft)] px-4 pb-8">
            {tr.nav.items.map((item, i) => (
              <div key={item.href + item.label}>
                <div className="flex items-center justify-between py-3">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-[var(--color-ink-900)]"
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} submenu`}
                      onClick={() => toggleExpanded(i)}
                      className="p-2 text-[var(--color-ink-500)]"
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${expanded.has(i) ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {item.children && expanded.has(i) && (
                  <div className="flex flex-col gap-1 pb-3 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="py-1.5 text-sm text-[var(--color-ink-700)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
