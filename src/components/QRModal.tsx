"use client";

import { X } from "lucide-react";
import PaymentQr from "@/components/PaymentQr";
import { useQRModal } from "@/hooks/useQRModal";
import { useLang } from "@/context/LanguageContext";
import { useDialog } from "@/hooks/useDialog";

export default function QRModal() {
  const { isOpen, closeQR } = useQRModal();
  const { tr } = useLang();
  const dialogRef = useDialog(isOpen, closeQR);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4 bg-[var(--color-ink-900)]/70 backdrop-blur-sm"
      onClick={closeQR}
      role="dialog"
      aria-modal="true"
      aria-label={tr.qr_title}
    >
      <div
        className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white rounded-[20px] p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeQR}
          className="absolute top-3 right-3 grid min-w-11 min-h-11 place-items-center p-2 rounded-full hover:bg-[var(--color-saffron-100)] transition-colors focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
          aria-label={tr.ui.close}
        >
          <X size={20} />
        </button>

        <p className="font-display font-semibold text-2xl text-[var(--color-text-primary)] mb-1">{tr.qr_title}</p>
        <p className="font-body text-sm text-[var(--color-text-secondary)] mb-6">{tr.qr_subtitle}</p>

        <PaymentQr />
      </div>
    </div>
  );
}
