"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useId } from "react";
import { useDialogsOpen } from "@/hooks/useDialog";
import { useUiSettings } from "@/context/UiSettingsContext";
import { useLang } from "@/context/LanguageContext";
import { navigationRoutes, siteConfig } from "@/gen/content";
import type { NavItem } from "@/lib/nav-types";

type DropKey = string | null;

export default function SiteHeader() {
  const pathname = usePathname();
  const { interactionSettings } = useUiSettings();
  const { tr } = useLang();
  const NAV = tr.nav as unknown as NavItem[];
  const [open, setOpen] = useState<DropKey>(null);
  const dialogsOpen = useDialogsOpen();
  const activeOpen = dialogsOpen ? null : open;
  const navId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => {
    if (!activeOpen) return;
    const desktop = window.matchMedia("(min-width: 80rem)");
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(null);
    };
    const onResize = () => { if (!desktop.matches) setOpen(null); };
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [activeOpen]);

  const show = (key: DropKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const hide = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), interactionSettings.dropdownCloseDelayMs);
  };
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header
      ref={headerRef}
      className={`hidden xl:block sticky top-0 ${dialogsOpen ? "z-0 pointer-events-none" : "z-50"} bg-[var(--color-parchment)]/95 backdrop-blur-sm border-b border-[var(--color-saffron-600)]`}
    >
      <div className="max-w-7xl mx-auto px-4 xl:px-6 min-h-14 py-1 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href={navigationRoutes.home} className="flex items-center gap-2.5 shrink-0 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 rounded">
          <Image src={`${siteConfig.basePath}/main-logo.png`} alt={tr.logo_alt} width={48} height={48} className="object-contain" />
        </Link>

        {/* Nav */}
        <nav aria-label={tr.ui.primary_navigation} className="min-w-0 flex-1 flex justify-center">
          <ul className="flex flex-wrap items-center justify-center gap-0">
            {NAV.map((item) => {
              const hasDropdown = !!(item.children && item.children.length > 0);
              const active = item.href ? isActive(item.href) : item.children?.some(i => isActive(i.href));
              return (
                <li key={item.key} className="relative flex items-center"
                  onPointerEnter={(event) => { if (event.pointerType === "mouse" && hasDropdown) show(item.key); }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse" && hasDropdown && !event.currentTarget.contains(document.activeElement)) hide();
                  }}
                  onFocus={() => {
                    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) show(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && activeOpen === item.key) {
                      event.preventDefault();
                      event.stopPropagation();
                      show(null);
                      event.currentTarget.querySelector<HTMLButtonElement>("[data-nav-disclosure]")?.focus();
                    }
                  }}>
                  {item.href && (
                    <Link href={item.href}
                      onClick={() => show(null)}
                      className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full font-body text-ui font-medium transition-colors whitespace-nowrap ${active ? "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-saffron-600)]/60"}`}>
                      {item.label}
                    </Link>
                  )}
                  {hasDropdown && (
                    <button
                      type="button"
                      data-nav-disclosure
                      aria-label={item.href ? item.label : undefined}
                      aria-expanded={activeOpen === item.key}
                      aria-controls={`${navId}-${item.key}`}
                      onClick={() => show(activeOpen === item.key ? null : item.key)}
                      className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full font-body text-ui font-medium transition-colors whitespace-nowrap ${activeOpen === item.key || active ? "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-saffron-600)]/60"}`}>
                      {!item.href && item.label}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  )}
                  {hasDropdown && (
                    <div
                      id={`${navId}-${item.key}`}
                      hidden={activeOpen !== item.key}
                      className="absolute top-full left-0 mt-1 min-w-[200px] bg-[var(--color-paper)] border border-[var(--color-saffron-600)] shadow-xl rounded-lg py-1.5 z-50"
                    >
                      {item.children!.map((sub) => (
                        <Link key={sub.key} href={sub.href}
                          onClick={() => show(null)}
                          className="block px-4 py-2 font-body text-ui text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-saffron-100)] hover:text-[var(--color-text-brand)]">
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

      </div>
    </header>
  );
}
