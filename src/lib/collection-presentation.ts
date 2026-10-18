export type CollectionCardVariant = "featured" | "collection";

const cardBase = "collection-tile group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-[var(--color-paper)] text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-saffron-600)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]";

export function collectionCardClassName(variant: CollectionCardVariant, imageBacked = false): string {
  return `${cardBase}${imageBacked ? " visual-tile" : ""} ${variant === "featured"
    ? "h-80 border-[var(--color-saffron-600)]"
    : "h-[360px] border-[var(--color-line)]"}`;
}

export const collectionCardBodyClassName = "visual-tile-body flex min-h-0 min-w-0 flex-1 flex-col p-4";
export const collectionCardImageClassName = "visual-tile-art relative h-40 w-full shrink-0 overflow-hidden bg-[var(--color-cream-soft)]";
