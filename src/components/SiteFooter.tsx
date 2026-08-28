"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  YouTube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
  ),
  Instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  ),
  WhatsApp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.6 15.05L2 22l5.05-1.32A10 10 0 1 0 12 2zm0 18.17a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3 .79.8-2.92-.19-.3A8.17 8.17 0 1 1 12 20.17z"/></svg>
  ),
};

export default function SiteFooter() {
  const { tr } = useLang();
  const { footer } = tr;

  return (
    <footer className="w-full" style={{ margin: 0 }}>
      {/* Mobile: centered ceremonial block, matching the design reference's .m-foot */}
      <div className="lg:hidden text-center px-6 pt-9 pb-[30px] bg-[var(--color-cream-soft)] border-t border-[var(--color-line)] mt-6">
        <Image src="/main-logo.png" alt="" width={50} height={50} className="object-contain mx-auto mb-2 opacity-95" />
        <p className="font-display text-[19px] text-[var(--color-text-primary)]">{tr.site_name}</p>
        <p className="text-xs text-[var(--color-text-brand)] mt-1.5" style={{ fontFamily: "var(--font-kannada)" }}>
          ॥ ಶ್ರೀ ವಿಠ್ಠಲೋ ವಿಜಯತೇ ॥
        </p>
        <div className="flex justify-center gap-3 mt-[18px] mb-4">
          {footer.social.map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label}
              className="w-[38px] h-[38px] rounded-full bg-[var(--color-paper)] border border-[var(--color-line)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-brand)] hover:border-[var(--color-saffron-300)] transition-colors">
              {SOCIAL_ICONS[s.label]}
            </a>
          ))}
        </div>
        <p className="text-[10.5px] text-[var(--color-text-muted)] leading-relaxed">
          © {new Date().getFullYear()} {footer.copyright_text}<br />{footer.address}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          {footer.policies.map((p) => (
            <Link key={p.href} href={p.href} className="font-body text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: slim horizontal bar */}
      <div className="hidden lg:block px-4 py-3" style={{ background: "var(--color-parchment)" }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {footer.policies.map((p) => (
              <Link key={p.href} href={p.href} className="font-body text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                {p.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            {/* Left — logo + copyright stacked */}
            <div className="flex items-center gap-2.5">
              <Image src="/main-logo.png" alt={tr.logo_alt} width={40} height={40} className="object-contain shrink-0" />
              <p className="font-body text-[10px] text-[var(--color-text-muted)] leading-snug">
                © {new Date().getFullYear()} {footer.copyright_text}
              </p>
            </div>
            {/* Right — social icons */}
            <div className="flex items-center gap-3 shrink-0">
              {footer.social.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-brand)] transition-colors">
                  {SOCIAL_ICONS[s.label]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
