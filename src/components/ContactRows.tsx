"use client";

import { useLang } from "@/context/LanguageContext";

export default function ContactRows() {
  const { tr } = useLang();
  const c = tr.connect2;
  const rows = [
    { key: "address", label: "Visit", value: c.address, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    ) },
    { key: "phone", label: "Call", value: c.phone, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ) },
    { key: "email", label: "Email", value: c.email, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
    ) },
    { key: "hours", label: "Hours", value: c.hours, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ) },
  ];

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.key} className="flex items-start gap-3 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-3.5 shadow-[var(--shadow-xs)]">
          <span className="text-[var(--color-saffron-600)] shrink-0 mt-0.5">{r.icon}</span>
          <div>
            <p className="text-[11px] font-bold tracking-[.08em] uppercase text-[var(--color-text-muted)]">{r.label}</p>
            <p className="text-sm text-[var(--color-text-primary)] leading-[1.5] mt-0.5 whitespace-pre-line">{r.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
