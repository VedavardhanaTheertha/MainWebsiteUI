"use client";

import { useEffect, useState } from "react";
import { useDonateModal } from "@/hooks/useDonateModal";
import { QrCode } from "lucide-react";

const materialOptions = [
  { id: "rice",       label: "Rice (Akki)",            desc: "Offer rice for Annadana Seva — the most sacred gift." },
  { id: "gopuja",     label: "Go Pooja Seva",           desc: "Offer flowers, bananas, turmeric for Go Pooja at the Matha." },
  { id: "vegetables", label: "Vegetables & Greens",     desc: "Fresh vegetables for Annadana Bhojana Shala." },
  { id: "flowers",    label: "Flowers & Garlands",      desc: "Fragrant flowers for Lord Krishna's daily decoration." },
  { id: "deepa",      label: "Oil / Ghee for Deepa",   desc: "Pure ghee or sesame oil to keep the eternal lamp burning." },
  { id: "fruits",     label: "Fruits",                  desc: "Seasonal fruits for Naivedya and Go Pooja offerings." },
];

type Mode = "scan" | "material" | "form";

export default function DonateModal() {
  const { isOpen, closeDonateModal } = useDonateModal();
  const [mode, setMode] = useState<Mode>("scan");
  const [selectedMaterial, setSelectedMaterial] = useState<typeof materialOptions[0] | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleClose = () => {
    closeDonateModal();
    setTimeout(() => { setMode("scan"); setSelectedMaterial(null); setForm({ name: "", phone: "", note: "" }); }, 400);
  };

  const openMaterialForm = (item: typeof materialOptions[0]) => {
    setSelectedMaterial(item);
    setMode("form");
  };

  const whatsappText = selectedMaterial
    ? encodeURIComponent(
        `Namaskara,\nI would like to donate ${selectedMaterial.label} to Shri Shiroor Matha.\n\nName: ${form.name}\nPhone: ${form.phone}${form.note ? `\nNote: ${form.note}` : ""}\n\nKindly guide me on how to proceed.`
      )
    : "";

  const emailBody = selectedMaterial
    ? encodeURIComponent(
        `Namaskara,\n\nI would like to donate ${selectedMaterial.label} to Shri Shiroor Matha.\n\nName: ${form.name}\nPhone: ${form.phone}${form.note ? `\nNote: ${form.note}` : ""}\n\nKindly guide me on how to proceed.\n\nWith regards.`
      )
    : "";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-[var(--color-ink-900)]/70 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog" aria-modal="true" aria-label="Donate"
    >
      <div
        className="relative bg-[var(--color-paper)] rounded-t-[22px] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 rounded-full bg-[var(--color-line-strong)] mx-auto mt-2.5 mb-1" />
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] px-6 py-4 flex items-start justify-between">
          <div>
            <p className="font-body text-[11px] tracking-widest uppercase text-white/70 font-semibold mb-0.5">Shri Shiroor Matha</p>
            <h2 className="font-display font-bold text-white text-xl">Offer Seva</h2>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white mt-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">

          {/* SCAN / QR — default view */}
          {mode === "scan" && (
            <div className="text-center">
              <p className="font-body text-[13px] text-[var(--color-text-secondary)] mb-4">Scan the QR below to donate via UPI</p>
              <div className="mx-auto w-52 h-52 bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--color-saffron-600)] mb-4">
                <div className="text-center text-[var(--color-text-secondary)]">
                  <QrCode size={64} strokeWidth={1} className="mx-auto mb-2 text-[var(--color-text-brand)]" />
                  <p className="font-body text-xs">QR Code Placeholder<br /><span className="text-[10px]">Replace with real UPI QR</span></p>
                </div>
              </div>
              <p className="font-body text-[12px] text-[var(--color-text-secondary)]">
                UPI ID: <span className="font-semibold text-[var(--color-text-brand)]">shiroor.matha@upi</span>
              </p>
              <p className="font-body text-[10px] text-[var(--color-text-secondary)]/50 mt-1 mb-5">All donations go directly to Matha&apos;s Seva fund</p>
              <div className="border-t border-[var(--color-saffron-600)] pt-4">
                <button onClick={() => setMode("material")}
                  className="w-full flex items-center justify-between border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-100)] rounded-xl px-4 py-3 transition-all group">
                  <span className="font-body font-semibold text-[var(--color-text-primary)] text-[13px] group-hover:text-[var(--color-text-brand)] transition-colors">Donate Material instead</span>
                  <svg className="text-[var(--color-text-brand)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* MATERIAL — list */}
          {mode === "material" && (
            <div>
              <button onClick={() => setMode("scan")} className="flex items-center gap-1 font-body text-[12px] text-[var(--color-text-brand)] mb-4 hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <p className="font-body text-[13px] text-[var(--color-text-secondary)] mb-3">Select what you&apos;d like to offer:</p>
              <div className="space-y-2">
                {materialOptions.map(m => (
                  <button key={m.id} onClick={() => openMaterialForm(m)}
                    className="w-full flex items-center justify-between border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-100)] rounded-xl px-4 py-3 text-left transition-all group">
                    <div>
                      <p className="font-body font-semibold text-[var(--color-text-primary)] text-[13px] group-hover:text-[var(--color-text-brand)] transition-colors">{m.label}</p>
                      <p className="font-body text-[11px] text-[var(--color-text-secondary)]/70">{m.desc}</p>
                    </div>
                    <svg className="text-[var(--color-text-brand)] shrink-0 ml-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FORM — collect details */}
          {mode === "form" && selectedMaterial && (
            <div>
              <button onClick={() => setMode("material")} className="flex items-center gap-1 font-body text-[12px] text-[var(--color-text-brand)] mb-4 hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-1">{selectedMaterial.label}</h3>
              <p className="font-body text-[12px] text-[var(--color-text-secondary)] mb-4">{selectedMaterial.desc}</p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="font-body text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1 block">Your Name</label>
                  <input
                    type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full border border-[var(--color-saffron-600)] focus:border-[var(--color-saffron-600)] rounded-lg px-3 py-2 font-body text-[13px] text-[var(--color-text-primary)] bg-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1 block">Phone / WhatsApp</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full border border-[var(--color-saffron-600)] focus:border-[var(--color-saffron-600)] rounded-lg px-3 py-2 font-body text-[13px] text-[var(--color-text-primary)] bg-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1 block">Additional Note (optional)</label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Quantity, delivery date, any details..."
                    rows={2}
                    className="w-full border border-[var(--color-saffron-600)] focus:border-[var(--color-saffron-600)] rounded-lg px-3 py-2 font-body text-[13px] text-[var(--color-text-primary)] bg-white outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/918202520000?text=${whatsappText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-body font-semibold text-[13px] py-3 rounded-full hover:bg-[#1ebe5a] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.874L.057 23.5l5.803-1.521A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.873 9.873 0 0 1-5.036-1.378l-.361-.214-3.742.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.118 12C2.118 6.54 6.54 2.118 12 2.118S21.882 6.54 21.882 12 17.46 21.882 12 21.882z"/>
                  </svg>
                  Send via WhatsApp
                </a>
                <a
                  href={`mailto:seva@shiroormatha.org?subject=Material Donation — ${selectedMaterial.label}&body=${emailBody}`}
                  className="w-full flex items-center justify-center gap-2 border border-[var(--color-saffron-600)] text-[var(--color-text-brand)] font-body font-semibold text-[13px] py-3 rounded-full hover:bg-[var(--color-saffron-100)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Send via Email
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
