"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function ImageListCards({ contentKey }: { contentKey: "learn" | "volunteer_ops" }) {
  const { tr } = useLang();
  const items = tr[contentKey];
  return (
    <div className="flex flex-col gap-2.5 max-w-xl">
      {items.map((it) => (
        <div key={it.title} className="flex items-center gap-3.5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-2.5 shadow-[var(--shadow-xs)]">
          <div className="relative w-[62px] h-[62px] shrink-0 rounded-[4px] overflow-hidden">
            <Image src={it.img} alt="" fill sizes="62px" className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight">{it.title}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{it.sub}</p>
          </div>
          <ChevronRight size={20} className="text-[var(--color-text-secondary)] shrink-0" />
        </div>
      ))}
    </div>
  );
}
