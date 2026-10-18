"use client";

import Image from "next/image";
import { useLang } from "@/context/LanguageContext";
import { actionDestinations, paymentQrDataUrl } from "@/gen/settings/actions";

export default function PaymentQr() {
  const { tr } = useLang();
  return (
    <div className="text-center">
      <Image src={paymentQrDataUrl} width={208} height={208} alt={tr.qr_title} unoptimized className="mx-auto rounded-xl bg-white" />
      <a href={actionDestinations.payment} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-saffron-600)] px-5 py-3 font-semibold text-white">
        {tr.public_actions.payment_label}
      </a>
    </div>
  );
}
