"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { getIcon } from "@/lib/icons";

export function BottomBar() {
  const { tr } = useLang();
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[var(--color-line-soft)] bg-[var(--color-cream-soft)]/95 backdrop-blur lg:hidden"
      aria-label="Quick access"
    >
      {tr.bottomBar.items.map((item) => {
        const Icon = getIcon(item.icon);
        const active = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-center"
          >
            <Icon
              size={20}
              className={active ? "text-[var(--color-saffron-600)]" : "text-[var(--color-ink-500)]"}
            />
            <span
              className={`text-[10px] font-semibold ${
                active ? "text-[var(--color-ink-700)]" : "text-[var(--color-ink-500)]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
