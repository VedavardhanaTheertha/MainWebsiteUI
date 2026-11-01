export type CollectionCardVariant = "featured" | "collection";

const cardBase = "collection-tile group flex min-w-0 flex-col overflow-hidden rounded-[18px] border bg-[var(--color-paper)] text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-saffron-500)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]";

export function collectionCardClassName(variant: CollectionCardVariant, imageBacked = false): string {
  return `${cardBase}${imageBacked ? " visual-tile" : ""} ${variant === "featured"
    ? "h-80 border-[var(--color-saffron-600)]"
    : "h-[360px] border-[var(--color-line)]"}`;
}

export const collectionCardBodyClassName = "visual-tile-body flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-3.5";
export const collectionCardImageClassName = "visual-tile-art relative h-40 w-full shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-gold-100),var(--color-cream-soft))] [&_.content-image-foreground]:transition-transform [&_.content-image-foreground]:duration-500 [&_.content-image-foreground]:ease-out group-hover:[&_.content-image-foreground]:scale-105";
