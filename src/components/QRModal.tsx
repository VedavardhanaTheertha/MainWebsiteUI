"use client";

import { useEffect } from "react";
import { X, QrCode } from "lucide-react";
import { useQRModal } from "@/hooks/useQRModal";
import { useLang } from "@/context/LanguageContext";

export default function QRModal() {
  const { isOpen, closeQR } = useQRModal();
  const { tr } = useLang();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--color-ink-900)]/70 backdrop-blur-sm"
      onClick={closeQR}
      role="dialog"
      aria-modal="true"
      aria-label={tr.qr_title}
    >
      <div
        className="relative bg-white rounded-[20px] p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeQR}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-saffron-100)] transition-colors focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <p className="font-display font-semibold text-2xl text-[var(--color-text-primary)] mb-1">{tr.qr_title}</p>
        <p className="font-body text-sm text-[var(--color-text-secondary)] mb-6">{tr.qr_subtitle}</p>

        {/* TODO: Replace with real UPI QR code image from management */}
        <div className="mx-auto w-52 h-52 bg-[#F5F5F5] rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--color-saffron-600)]">
          <div className="text-center text-[var(--color-text-secondary)]">
            <QrCode size={64} strokeWidth={1} className="mx-auto mb-2 text-[var(--color-text-brand)]" />
            <p className="font-body text-xs">QR Code Placeholder<br /><span className="text-[10px]">Replace with real UPI QR</span></p>
          </div>
        </div>

        <p className="font-body text-xs text-[var(--color-text-secondary)] mt-4">
          {tr.qr_upi_label}:{" "}
          <span className="font-medium text-[var(--color-text-brand)]">shiroor.matha@upi</span>
          {/* TODO: Replace with real UPI ID */}
        </p>
      </div>
    </div>
  );
}
