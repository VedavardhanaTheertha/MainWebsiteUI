"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { useQRModal } from "@/hooks/useQRModal";
import { useLang } from "@/context/LanguageContext";
import type { NavItem } from "@/lib/nav-types";

type DropKey = string | null;

export default function SiteHeader() {
  const pathname = usePathname();
  const { openQR } = useQRModal();
  const { lang, tr } = useLang();
  const NAV = tr.nav as unknown as NavItem[];
  const [open, setOpen] = useState<DropKey>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (key: DropKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const hide = () => { closeTimer.current = setTimeout(() => setOpen(null), 120); };
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-[var(--color-parchment)]/95 backdrop-blur-sm border-b border-[var(--color-saffron-600)]">
      <div className="max-w-7xl mx-auto px-4 xl:px-6 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 rounded">
          <Image src="/main-logo.png" alt={tr.logo_alt} width={48} height={48} className="object-contain" />
        </Link>

        {/* Nav */}
        <nav aria-label="Primary navigation" className="flex-1 flex justify-center">
          <ul className="flex items-center gap-0">
            {NAV.map((item) => {
              const hasDropdown = !!(item.children && item.children.length > 0);
              const active = item.href ? isActive(item.href) : item.children?.some(i => isActive(i.href));
              return (
                <li key={item.key} className="relative"
                  onMouseEnter={() => hasDropdown ? show(item.key) : undefined}
                  onMouseLeave={() => hasDropdown ? hide() : undefined}>
                  {item.href ? (
                    <Link href={item.href}
                      className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full font-body text-[12px] font-medium transition-colors whitespace-nowrap ${active ? "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-saffron-600)]/60"}`}>
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full font-body text-[12px] font-medium transition-colors whitespace-nowrap ${open === item.key || active ? "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-saffron-600)]/60"}`}>
                      {item.label}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  )}
                  {hasDropdown && open === item.key && (
                    <div
                      className="absolute top-full left-0 mt-1 min-w-[200px] bg-[var(--color-paper)] border border-[var(--color-saffron-600)] shadow-xl rounded-lg py-1.5 z-50"
                      onMouseEnter={() => show(item.key)} onMouseLeave={hide}>
                      {item.children!.map((sub) => (
                        <Link key={sub.key} href={sub.href}
                          className="block px-4 py-2 font-body text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-saffron-100)] hover:text-[var(--color-text-brand)]">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Panchanga — mirror of mobile bottom nav */}
          <Link href="/panchanga"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-[11px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Panchanga
          </Link>
          <button onClick={openQR} className="px-3 py-1.5 rounded-full font-body text-[11px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-colors">
            Scan QR
          </button>
          <a href="https://chat.whatsapp.com/PLACEHOLDER" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-[var(--color-saffron-600)] text-white font-body text-[11px] font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.874L.057 23.5l5.803-1.521A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.873 9.873 0 0 1-5.036-1.378l-.361-.214-3.742.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.118 12C2.118 6.54 6.54 2.118 12 2.118S21.882 6.54 21.882 12 17.46 21.882 12 21.882z"/>
            </svg>
            {lang === "kn" ? "WhatsApp" : "Join WhatsApp"}
          </a>
        </div>

      </div>
    </header>
  );
}
