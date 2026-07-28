"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { getIcon } from "@/lib/icons";

export function QuickNavRow() {
  const { tr } = useLang();

  return (
    <section className="px-4 pt-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-5 gap-2 lg:max-w-2xl">
        {tr.home.quickNav.items.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] py-2 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-saffron-50)] text-[var(--color-saffron-700)]">
                <Icon size={20} />
              </span>
              <span className="text-[11px] font-medium text-[var(--color-ink-700)]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
