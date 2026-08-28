"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { Lang } from "@/gen/content";
import type { NavItem } from "@/lib/nav-types";

export default function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { lang, setLang, tr, languages } = useLang();
  const NAV = tr.nav as unknown as NavItem[];

  // The compact header has room for one button, so it cycles to the next
  // language rather than listing them all. With two languages this behaves
  // exactly like a toggle; with more, repeated taps walk through them.
  const currentIndex = languages.findIndex((l) => l.code === lang);
  const nextLanguage = languages[(currentIndex + 1) % languages.length];

  useEffect(() => { setOpen(false); setExpanded(null); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <header className="lg:hidden sticky top-0 z-50 shadow-md">
      {/* Single unified header bar */}
      <div className="relative h-14 flex items-center justify-between px-3 bg-[var(--color-parchment)]">

        {/* Left — logo only, circular saffron halo */}
        <Link
          href="/"
          className="shrink-0 rounded-full p-1 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          style={{ background: "radial-gradient(circle, var(--color-saffron-50) 0%, transparent 72%)" }}
        >
          <Image src="/main-logo.png" alt={tr.logo_alt} width={44} height={44} className="object-contain" />
        </Link>

        {/* Centre — Kannada sacred sloka (absolutely centred in bar) */}
        <p className="absolute left-0 right-0 text-center font-display font-bold text-[12px] text-[var(--color-text-brand)] tracking-wide leading-tight select-none pointer-events-none">
          ॥ ಶ್ರೀ ವಿಠ್ಠಲೋ ವಿಜಯತೇ ॥
        </p>

        {/* Right — language toggle + hamburger, same row */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLang(nextLanguage.code as Lang)}
            className="w-7 h-7 rounded-full border border-[var(--color-line-strong)] bg-transparent text-[11px] font-bold text-[var(--color-ink-500)] active:text-[var(--color-saffron-600)] active:border-[var(--color-saffron-400)] flex items-center justify-center transition-colors"
            aria-label={`Switch to ${nextLanguage.name}`}
          >
            {nextLanguage.short_label}
          </button>
          <button onClick={() => setOpen((o) => !o)}
            className="p-1 rounded-full hover:bg-[var(--color-saffron-100)] transition-colors text-[var(--color-text-primary)] focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
            aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile navigation"
          className="absolute top-full left-0 right-0 bg-[var(--color-paper)] border-b border-[var(--color-saffron-600)] shadow-lg max-h-[80vh] overflow-y-auto">
          <ul className="py-2">
            {NAV.map((item) => {
              const hasChildren = !!(item.children && item.children.length > 0);
              const isActive = item.href ? pathname === item.href : false;
              return (
                <li key={item.key}>
                  {!hasChildren ? (
                    <Link href={item.href!}
                      className={`block px-6 py-3 font-body text-[15px] font-medium transition-colors ${isActive ? "text-[var(--color-text-brand)] bg-[var(--color-saffron-100)]" : "text-[var(--color-text-primary)] hover:bg-[var(--color-saffron-100)]"}`}>
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button onClick={() => toggle(item.key)}
                        className="w-full flex items-center justify-between px-6 py-3 font-body text-[15px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-saffron-100)] transition-colors">
                        {item.label}
                        <ChevronDown size={15} className={`transition-transform duration-200 ${expanded === item.key ? "rotate-180" : ""}`} />
                      </button>
                      {expanded === item.key && (
                        <ul className="bg-[var(--color-gold-100)] border-t border-[var(--color-saffron-600)]">
                          {item.children!.map((sub) => (
                            <li key={sub.key}>
                              <Link href={sub.href}
                                className="block px-8 py-2.5 font-body text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-brand)] hover:bg-[var(--color-saffron-100)] transition-colors">
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
