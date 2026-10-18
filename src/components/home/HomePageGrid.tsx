import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import type { HomePageCard } from "@/lib/content-types";
import { collectionCardBodyClassName, collectionCardClassName, collectionCardImageClassName } from "@/lib/collection-presentation";

export default function HomePageGrid({ items }: { items: HomePageCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className={collectionCardClassName("collection", true)}
        >
          <div className={collectionCardImageClassName}>
            <ContentImage src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          </div>
          <div className={collectionCardBodyClassName}>
            <span className="visual-tile-badge mb-2 block w-fit max-w-full truncate rounded-full bg-[var(--color-cream-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-brand)]">{item.page_type}</span>
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
