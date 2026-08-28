"use client";

import { useEffect, useRef, useState } from "react";

const PARYAYA_START = new Date("2026-01-18");
const PARYAYA_END   = new Date("2028-01-18");
const TOTAL_DAYS    = Math.round((PARYAYA_END.getTime() - PARYAYA_START.getTime()) / 86400000);

function useDaysPassed() {
  const now = new Date();
  const diff = Math.max(0, Math.round((now.getTime() - PARYAYA_START.getTime()) / 86400000));
  return Math.min(diff, TOTAL_DAYS);
}

function useCountUp(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function StatCard({ icon, label, value, unit, live }: { icon: React.ReactNode; label: string; value: string; unit?: string; live?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 px-4 py-6 bg-white/60 border border-[var(--color-saffron-600)] rounded-xl">
      <div className="text-[var(--color-text-brand)] mb-1">{icon}</div>
      {live && (
        <span className="flex items-center gap-1.5 font-body text-[10px] font-bold tracking-widest text-[var(--color-text-brand)] uppercase mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-saffron-600)] animate-pulse" />
          Live
        </span>
      )}
      <p className="font-body font-bold text-[var(--color-text-primary)]" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>{value}</p>
      {unit && <p className="font-body text-[11px] text-[var(--color-text-secondary)]/70 -mt-1">{unit}</p>}
      <p className="font-body text-[12px] text-[var(--color-text-secondary)] leading-snug mt-1">{label}</p>
    </div>
  );
}

export default function LiveStats() {
  const daysPassed  = useDaysPassed();
  const progress    = TOTAL_DAYS > 0 ? (daysPassed / TOTAL_DAYS) * 100 : 0;

  const meals       = useCountUp(124500, 2000);
  const rice        = useCountUp(3800, 1800);
  const vegetables  = useCountUp(9200, 1800);
  const devotees    = useCountUp(41200, 2000);

  return (
    <section className="w-full bg-[var(--color-cream)] py-10 px-4 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <span className="font-body text-[10px] tracking-[0.25em] uppercase text-[var(--color-text-brand)] font-semibold">Paryaya 2026–2028</span>
        <h2 className="font-display font-bold text-[var(--color-text-primary)] mt-1" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)" }}>
          Sacred Service in Numbers
        </h2>
        <p className="font-body text-[var(--color-text-secondary)] text-[13px] mt-2">
          Every grain of rice, every devotee fed, every moment of Seva — counted in gratitude.
        </p>
      </div>

      {/* Paryaya Progress Bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex justify-between font-body text-[11px] text-[var(--color-text-secondary)] mb-2">
          <span>Paryaya began · Jan 18, 2026</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-saffron-600)] animate-pulse" />
            Day {daysPassed} of {TOTAL_DAYS}
          </span>
          <span>Ends · Jan 18, 2028</span>
        </div>
        <div className="w-full h-2.5 bg-[var(--color-saffron-600)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-full transition-all duration-1000"
            style={{ width: `${progress.toFixed(1)}%` }}
          />
        </div>
        <p className="text-center font-body text-[11px] text-[var(--color-text-secondary)]/60 mt-1.5">{progress.toFixed(1)}% of Paryaya completed</p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          live
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Devotees Served"
          value={devotees.toLocaleString("en-IN") + "+"}
        />
        <StatCard
          live
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>}
          label="Annadana Meals Offered"
          value={meals.toLocaleString("en-IN") + "+"}
        />
        <StatCard
          live
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
          label="Rice Donated (kg)"
          value={rice.toLocaleString("en-IN") + "+"}
          unit="kilograms"
        />
        <StatCard
          live
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12a10 10 0 0 1 10-10z"/><path d="M12 6v6l4 2"/></svg>}
          label="Vegetables Received (kg)"
          value={vegetables.toLocaleString("en-IN") + "+"}
          unit="kilograms"
        />
      </div>

      <p className="text-center font-body text-[10px] text-[var(--color-text-secondary)]/40 mt-6">
        * Numbers are illustrative — will be updated with live data from Matha records.
      </p>
    </section>
  );
}
