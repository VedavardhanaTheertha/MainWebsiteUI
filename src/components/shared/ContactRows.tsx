import { getIcon } from "@/lib/icons";
import type { ContactRow } from "@/lib/content-types";

export function ContactRows({ rows }: { rows: ContactRow[] }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-6 lg:mx-auto lg:max-w-xl lg:px-8">
      {rows.map((row) => {
        const Icon = getIcon(row.icon);
        return (
          <div
            key={row.id}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-3.5 shadow-[var(--shadow-card)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-saffron-50)] text-[var(--color-saffron-700)]">
              <Icon size={16} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
                {row.label}
              </p>
              <p className="text-sm text-[var(--color-ink-900)]">{row.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
