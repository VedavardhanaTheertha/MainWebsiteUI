"use client";

import { useState } from "react";
import { Phone, Mail, Minus, Plus, Copy, Check } from "lucide-react";

type Props = {
  price: number;
  upiId: string;
  phone: string;
  email: string;
  sevaName: string;
};

export default function SevaDetailClient({ price, upiId, phone, email, sevaName }: Props) {
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showUpi, setShowUpi] = useState(false);

  const total = price * qty;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=Shiroor%20Matha&am=${total}&cu=INR&tn=${encodeURIComponent(sevaName)}`;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-saffron-600)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-saffron-600)]" style={{ background: "var(--color-paper)" }}>
        <p className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-1">Book This Seva</p>
        <p className="font-body text-xs text-[var(--color-text-secondary)]">Select quantity and choose a payment method</p>
      </div>

      <div className="px-5 py-5 space-y-5">

        {/* Quantity + Price */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-[11px] text-[var(--color-text-secondary)]/60 mb-1">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-[var(--color-saffron-600)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="font-body font-bold text-[var(--color-text-primary)] text-lg w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-8 h-8 rounded-full border border-[var(--color-saffron-600)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="font-body text-[11px] text-[var(--color-text-secondary)]/60 mb-1">₹{price.toLocaleString("en-IN")} × {qty}</p>
            <p className="font-display font-bold text-[var(--color-text-primary)] text-2xl">₹{total.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* UPI Button */}
        <button
          onClick={() => setShowUpi(s => !s)}
          className="w-full py-3 rounded-xl font-body font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--color-saffron-600), var(--color-saffron-600))" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1 17l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
          </svg>
          Pay via UPI
        </button>

        {/* UPI Details — expanded */}
        {showUpi && (
          <div className="rounded-xl border border-[var(--color-saffron-600)] overflow-hidden">
            {/* QR placeholder */}
            <div className="bg-[var(--color-paper)] p-4 flex flex-col items-center gap-2 border-b border-[var(--color-saffron-600)]">
              <div className="w-32 h-32 bg-white rounded-xl border border-[var(--color-saffron-600)] flex items-center justify-center">
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/50 text-center">QR Code<br/>Placeholder</p>
              </div>
              <p className="font-body text-[11px] text-[var(--color-text-secondary)]/60">Scan with any UPI app</p>
            </div>
            {/* UPI ID copy */}
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">UPI ID</p>
                <p className="font-body font-semibold text-[var(--color-text-primary)] text-sm">{upiId}</p>
              </div>
              <button
                onClick={copyUpi}
                className="flex items-center gap-1.5 font-body text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors"
                style={{ color: copied ? "#166534" : "var(--color-saffron-600)", borderColor: copied ? "#166534" : "var(--color-saffron-600)", background: copied ? "#F0FDF4" : "#FFF7ED" }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {/* Deep link button */}
            <div className="px-4 pb-3">
              <a
                href={upiDeepLink}
                className="block w-full text-center font-body text-sm font-semibold py-2 rounded-lg text-white transition-colors"
                style={{ background: "var(--color-paper)" }}
              >
                Open UPI App
              </a>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-saffron-600)]" />
          <span className="font-body text-[11px] text-[var(--color-text-secondary)]/50 font-semibold">OR</span>
          <div className="flex-1 h-px bg-[var(--color-saffron-600)]" />
        </div>

        {/* Call + Email */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${phone}`}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] transition-colors group"
          >
            <Phone size={18} className="text-[var(--color-text-brand)]" />
            <span className="font-body text-[11px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-brand)] transition-colors">Call to Book</span>
            <span className="font-body text-[10px] text-[var(--color-text-secondary)]/50">{phone}</span>
          </a>
          <a
            href={`mailto:${email}?subject=Seva%20Booking%3A%20${encodeURIComponent(sevaName)}&body=I%20would%20like%20to%20book%20${qty}%20x%20${encodeURIComponent(sevaName)}%20(Total%3A%20%E2%82%B9${total.toLocaleString("en-IN")})`}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] transition-colors group"
          >
            <Mail size={18} className="text-[var(--color-text-brand)]" />
            <span className="font-body text-[11px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-brand)] transition-colors">Email Us</span>
            <span className="font-body text-[10px] text-[var(--color-text-secondary)]/50 truncate w-full text-center">{email}</span>
          </a>
        </div>

        <p className="font-body text-[10px] text-[var(--color-text-secondary)]/40 text-center italic">
          * Our team will confirm your booking within 24 hours
        </p>
      </div>
    </div>
  );
}
