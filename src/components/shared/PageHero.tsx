import { PlaceholderImage } from "./PlaceholderImage";

/** Compact interior-page banner — smaller than the homepage Hero, used to
 * open every non-home route with a consistent title treatment. */
export function PageHero({
  heading,
  subheading,
  imageKey,
}: {
  heading: string;
  subheading?: string;
  imageKey?: string;
}) {
  return (
    <section className="relative flex h-40 items-end overflow-hidden lg:h-56">
      {imageKey ? (
        <PlaceholderImage
          imageKey={imageKey}
          alt={heading}
          aspect="auto"
          radius="none"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-saffron-100)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/70 via-[var(--color-ink-900)]/10 to-transparent" />
      <div className="relative z-10 w-full px-5 pb-5 lg:mx-auto lg:max-w-6xl lg:px-8 lg:pb-8">
        <h1 className="font-display text-2xl text-[var(--color-text-on-image)] lg:text-4xl">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-on-image)]/90 lg:text-base">
            {subheading}
          </p>
        )}
      </div>
    </section>
  );
}
