"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export default function UserStoriesPage() {
  const { tr } = useLang();
  const { userStories } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={userStories.heading} subheading={userStories.intro} />
      <section className="flex flex-col gap-3 px-4 py-6 lg:mx-auto lg:max-w-3xl lg:px-8">
        {userStories.stories.map((story) => (
          <div
            key={story.id}
            className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-4 shadow-[var(--shadow-card)]"
          >
            <PlaceholderImage
              imageKey={story.image}
              alt={story.name}
              aspect="1 / 1"
              radius="pill"
              className="h-12 w-12 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink-900)]">{story.name}</p>
              <p className="mt-1 text-sm italic leading-relaxed text-[var(--color-ink-700)]">
                &ldquo;{story.story}&rdquo;
              </p>
            </div>
          </div>
        ))}
        <a
          id="submit"
          href="#submit"
          className="mt-2 inline-block w-fit rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {userStories.submitCtaLabel}
        </a>
      </section>
    </div>
  );
}
