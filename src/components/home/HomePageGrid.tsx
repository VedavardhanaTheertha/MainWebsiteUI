import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import type { HomePageCard } from "@/lib/content-types";
import { collectionCardBodyClassName, collectionCardClassName, collectionCardImageClassName } from "@/lib/collection-presentation";

export default function HomePageGrid({ items, showFootnotes = true }: { items: HomePageCard[]; showFootnotes?: boolean }) {
  return (
    <div className="layout-tile-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className={`${collectionCardClassName("collection", true)} h-full flex flex-col`}
        >
          <div className={collectionCardImageClassName}>
            <ContentImage src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          </div>
          <div className={collectionCardBodyClassName}>
            <span className="layout-tile-category visual-tile-badge mb-1.5 block w-fit max-w-full truncate rounded-full bg-[var(--color-cream-soft)] px-2.5 py-0.5 text-badge font-bold uppercase tracking-wider text-[var(--color-text-brand)]">{item.page_type}</span>
            <h3 className="layout-tile-title mb-1 line-clamp-2 font-display text-base sm:text-lg font-bold leading-snug text-[var(--color-text-primary)]">{item.title}</h3>
            <p className="layout-tile-summary line-clamp-2 font-body text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.description}</p>
            {showFootnotes && item.footnote && (
              <p className="layout-tile-footer mt-auto pt-1.5 line-clamp-1 border-t border-[var(--color-line)] text-meta text-[var(--color-text-muted)]">{item.footnote}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
