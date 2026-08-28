"use client";

import { useState } from "react";
import { QrCode, Wheat, Flame, Droplet, Candy, Flower, Nut, type LucideIcon } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { openDonateModal } from "@/hooks/useDonateModal";

const MATERIAL_ICONS: Record<string, LucideIcon> = {
  wheat: Wheat,
  flame: Flame,
  droplet: Droplet,
  candy: Candy,
  flower: Flower,
  nut: Nut,
};

export default function DonationPanel() {
  const { tr } = useLang();
  const d = tr.donation;
  const [tab, setTab] = useState<"money" | "material">("money");

  return (
    <div>
      <div className="flex border-b border-[var(--color-line)] mb-5">
        {(["money", "material"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-3 text-sm font-semibold transition-colors ${tab === t ? "text-[var(--color-saffron-700)]" : "text-[var(--color-text-muted)]"}`}
          >
            {t === "money" ? "Give Money" : "Donate Materials"}
            {tab === t && <span className="absolute left-4 right-4 -bottom-px h-[2.5px] rounded bg-[var(--color-saffron-500)]" />}
          </button>
        ))}
      </div>

      {tab === "money" ? (
        <div>
          <div className="flex gap-4 items-center bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[14px] p-4 shadow-[var(--shadow-sm)] max-w-md">
            <div className="w-[100px] h-[100px] shrink-0 rounded-[8px] border border-[var(--color-line)] bg-white flex items-center justify-center text-[var(--color-text-primary)]">
              <QrCode size={56} strokeWidth={1} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Scan to pay via UPI</p>
              <p className="font-display text-lg text-[var(--color-saffron-700)] mt-1.5 mb-2 break-all">{d.upi}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">GPay · PhonePe · Paytm · BHIM</p>
            </div>
          </div>

          <p className="text-[10px] font-bold tracking-[.18em] uppercase text-[var(--color-text-brand)] mt-6 mb-2">Or choose an amount</p>
          <div className="flex flex-wrap gap-2.5">
            {d.amounts.map((a) => (
              <button
                key={a}
                onClick={openDonateModal}
                className="flex-1 min-w-[80px] border border-[var(--color-saffron-300)] bg-[var(--color-saffron-50)] text-[var(--color-saffron-700)] rounded-[8px] py-2.5 font-display text-lg hover:bg-[var(--color-saffron-100)] transition-colors"
              >
                {a}
              </button>
            ))}
          </div>

          <button
            onClick={openDonateModal}
            className="w-full mt-5 bg-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-700)] text-white font-body font-semibold text-sm rounded-full py-3.5 transition-colors max-w-md"
          >
            Donate Now
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-md">
            Offer materials directly to the Matha — your gift reaches the kitchen, the sanctum and the Go Shāla.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xl">
            {d.materials.map((m) => {
              const Icon = MATERIAL_ICONS[m.icon];
              return (
                <button
                  key={m.name}
                  onClick={openDonateModal}
                  className="text-left rounded-[8px] p-4 transition-transform hover:-translate-y-0.5"
                  style={{ background: "#fff7e6", border: "1px solid #f3d98a" }}
                >
                  <span className="inline-flex w-[42px] h-[42px] items-center justify-center rounded-[4px] mb-2.5" style={{ background: "#fbe6a8", color: "#9a6c0a" }}>
                    {Icon ? <Icon size={22} /> : null}
                  </span>
                  <p className="font-semibold text-[15px] text-[var(--color-text-primary)]">{m.name}</p>
                  <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5 leading-[1.4]">{m.sub}</p>
                  <p className="text-xs font-bold text-[var(--color-saffron-700)] mt-2">{m.unit}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
