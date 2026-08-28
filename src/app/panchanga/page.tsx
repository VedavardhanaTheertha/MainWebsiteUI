import SiteFooter from "@/components/SiteFooter";

const PANCH = [
  { label: "Tithi", value: "Shukla Saptami" },
  { label: "Nakshatra", value: "Pushya" },
  { label: "Sunrise", value: "6:02 AM" },
];
const FESTIVALS = [
  { date: "Jul 26", name: "Sri Krishnashtami Prep Begins", note: "Preparations for the annual celebration" },
  { date: "Aug 16", name: "Sri Krishna Janmāshtami", note: "Major celebrations at the Matha" },
  { date: "Sep 5", name: "Dvaadashastuti Utsava", note: "Special puja and pravachana" },
];

export default function PanchangaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-10">
      <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">25 Jul 2026</p>
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] mt-1 mb-6">Today&apos;s Panchānga</h1>

      <div className="bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] shadow-[var(--shadow-sm)] mb-4">
        {PANCH.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-line-soft)] last:border-0">
            <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
            <span className="font-display text-base text-[var(--color-text-primary)]">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-sm text-[var(--color-text-secondary)]">Rahu Kala</span>
          <span className="font-body font-semibold text-[13px] text-[var(--color-danger-500)]">4:30–6:00 PM</span>
        </div>
      </div>

      <div className="bg-[var(--color-cream-soft)] border border-[var(--color-line)] rounded-[8px] p-4 mb-8">
        <p className="font-body text-[10px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">Guidance</p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-[1.7] mt-2">
          Abhijit Muhurta (12:08–12:58 PM) is favourable for offerings. Avoid Rahu Kala for auspicious beginnings.
        </p>
      </div>

      <h2 className="font-display text-xl text-[var(--color-text-primary)] mb-3">Upcoming Festivals</h2>
      <div className="flex flex-col gap-2.5">
        {FESTIVALS.map((f) => (
          <div key={f.name} className="flex items-center gap-3 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] px-4 py-3">
            <span className="font-body text-[11px] font-bold text-[var(--color-text-brand)] bg-[var(--color-saffron-50)] px-2 py-1 rounded shrink-0 min-w-[52px] text-center">{f.date}</span>
            <div>
              <p className="font-body font-semibold text-sm text-[var(--color-text-primary)]">{f.name}</p>
              <p className="font-body text-[11px] text-[var(--color-text-muted)]">{f.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="-mx-4 mt-10">
        <SiteFooter />
      </div>
    </div>
  );
}
