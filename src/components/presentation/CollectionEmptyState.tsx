import type { ReactNode } from "react";

export default function CollectionEmptyState({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-10 text-center text-sm text-[var(--color-text-secondary)]">
      {children}
    </div>
  );
}
