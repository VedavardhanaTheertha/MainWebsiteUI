import Image from "next/image";
import Link from "next/link";
import type { HomePageCard } from "@/lib/content-types";

export default function HomePageGrid({ items }: { items: HomePageCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-saffron-600)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
        >
          <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[var(--color-cream-soft)]">
            <Image src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            <span className="absolute top-2 left-2 right-2 w-fit max-w-[calc(100%-1rem)] truncate rounded-full bg-[rgba(26,17,8,0.75)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {item.page_type}
            </span>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4">
            <h3 className="mb-1 line-clamp-2 font-display text-lg font-bold leading-snug text-[var(--color-text-primary)]">{item.title}</h3>
            <p className="line-clamp-2 font-body text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.description}</p>
            {item.footnote && (
              <p className="mt-auto line-clamp-2 border-t border-[var(--color-line)] pt-2 text-xs text-[var(--color-text-muted)]">{item.footnote}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
