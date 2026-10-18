"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { announcementSettings } from "@/gen/settings/announcements";
import { announcementMatchesPage, announcementWindow } from "@/lib/ui-settings";
import { useDialogsOpen } from "@/hooks/useDialog";
import { createPreferenceStore } from "@/lib/browser-preferences";

const dismissalPreference = createPreferenceStore(
  "yajna_dismissed", "",
  (value): value is string => value === "1",
  announcementSettings.dismissal === "session" ? "sessionStorage" : "localStorage",
);

export default function YajnaAnnouncement() {
  const pathname = usePathname();
  return <Announcement key={pathname} pathname={pathname} />;
}

function Announcement({ pathname }: { pathname: string }) {
  const { tr } = useLang();
  const copy = tr.announcement;
  const [visibleFor, setVisibleFor] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const dialogsOpen = useDialogsOpen();
  const storedDismissal = useSyncExternalStore(
    dismissalPreference.subscribe,
    announcementSettings.dismissal === "none" ? dismissalPreference.getServerSnapshot : dismissalPreference.getSnapshot,
    dismissalPreference.getServerSnapshot,
  );

  useEffect(() => {
    if (dismissed || storedDismissal || !announcementMatchesPage(announcementSettings, pathname)) return;
    const { startsAt, endsAt } = announcementWindow(announcementSettings);
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let boundaryTimer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      const now = Date.now();
      if (now >= endsAt) {
        setVisibleFor(null);
        return;
      }
      if (now >= startsAt && showTimer === undefined) {
        showTimer = setTimeout(() => {
          if (Date.now() < endsAt) setVisibleFor(pathname);
        }, announcementSettings.delayMs);
      }
      const next = now < startsAt ? startsAt : endsAt;
      if (Number.isFinite(next)) {
        boundaryTimer = setTimeout(refresh, Math.min(next - now, 2147483647));
      }
    };
    // Defer state updates until after the effect, including an already-ended schedule.
    boundaryTimer = setTimeout(refresh, 0);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(boundaryTimer);
    };
  }, [pathname, dismissed, storedDismissal]);

  if (dismissed || storedDismissal || dialogsOpen || visibleFor !== pathname || !announcementMatchesPage(announcementSettings, pathname)) return null;

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerLR {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .yajna-card {
          animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .yajna-shimmer {
          background: linear-gradient(90deg, var(--color-saffron-600) 0%, var(--color-saffron-600) 35%, #fff8e8 50%, var(--color-saffron-600) 65%, var(--color-saffron-600) 100%);
          background-size: 200% auto;
          animation: shimmerLR 2.5s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {visibleFor === pathname && (
        <div
          className="yajna-card fixed bottom-20 lg:bottom-6 right-4 z-[8000] w-[220px] sm:w-[270px]"
          role="complementary"
          aria-label={copy.label}
        >
          <div className="relative bg-[var(--color-paper)] border border-[var(--color-saffron-600)]/40 rounded-2xl shadow-2xl overflow-hidden">

            {/* Top accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)]" />

            {/* Dismiss */}
            <button
              onClick={() => {
                setDismissed(true);
                if (announcementSettings.dismissal !== "none") dismissalPreference.setValue("1");
              }}
              aria-label={copy.dismiss}
              className="absolute top-0 right-0 z-10 grid min-w-11 min-h-11 place-items-center text-[var(--color-text-secondary)]/60 hover:text-[var(--color-text-primary)] transition-colors rounded-full"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Content — clickable, navigates to yajna page */}
            <Link href={copy.href} className="block px-4 pt-3 pb-4 group">
              <p className="font-body text-[9px] tracking-[.2em] uppercase text-[var(--color-text-brand)]/70 font-semibold mb-1">
                {copy.eyebrow}
              </p>
              <h3 className="yajna-shimmer font-display font-bold text-[13px] leading-snug mb-1.5">
                {copy.title}
              </h3>
              <p className="font-body text-[var(--color-text-brand)]/60 text-[11px] leading-relaxed mb-2">
                {copy.body}
              </p>
              <span className="inline-flex items-center gap-1.5 font-body text-[11px] font-semibold text-[var(--color-text-brand)] group-hover:underline">
                {copy.cta}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
