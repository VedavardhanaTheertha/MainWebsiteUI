/**
 * Stand-in for real photography/artwork. No production images exist yet —
 * this renders a labeled, on-brand placeholder at the correct aspect ratio
 * and corner radius so layout is final even before real assets land.
 * `imageKey` (e.g. "hero-welcome") is the future asset identifier from
 * content/*.yml — swapping in a real <img> later is a one-line change here.
 */
type Radius = "sm" | "md" | "lg" | "pill" | "none";

const RADIUS_CLASS: Record<Radius, string> = {
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  pill: "rounded-[var(--radius-pill)]",
  none: "rounded-none",
};

// Deterministic hue offset so different placeholders look distinct without
// being random on every render.
function hueFromKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 40; // small spread within the warm saffron family
}

export function PlaceholderImage({
  imageKey,
  alt,
  aspect = "4 / 3",
  radius = "md",
  className = "",
}: {
  imageKey: string;
  alt: string;
  aspect?: string;
  radius?: Radius;
  className?: string;
}) {
  const hue = hueFromKey(imageKey);
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex items-end overflow-hidden ${RADIUS_CLASS[radius]} ${className}`}
      style={{
        aspectRatio: aspect,
        background: `linear-gradient(155deg, hsl(${28 + hue} 55% 88%), hsl(${20 + hue} 60% 72%))`,
      }}
    >
      <span className="m-2 rounded-[var(--radius-sm)] bg-[var(--color-ink-900)]/60 px-2 py-1 text-[10px] font-medium tracking-wide text-[var(--color-cream-hi)]">
        {alt}
      </span>
    </div>
  );
}
