"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { ExpandableTimelineEntry } from "@/components/shared/ExpandableTimelineEntry";

export default function AboutPage() {
  const { tr } = useLang();
  const { about } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={about.mission.heading} />

      <section className="px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
        <p className="text-sm leading-relaxed text-[var(--color-ink-700)]">{about.mission.body}</p>
      </section>

      <section className="flex flex-col gap-4 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:flex-row lg:items-center lg:gap-8 lg:px-8">
        <PlaceholderImage
          imageKey={about.chiefSwamiji.portrait}
          alt={about.chiefSwamiji.name}
          aspect="3 / 4"
          radius="lg"
          className="w-40 lg:w-56"
        />
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-saffron-700)]">
            {about.chiefSwamiji.heading}
          </span>
          <h2 className="mt-1 font-display text-2xl text-[var(--color-ink-900)]">
            {about.chiefSwamiji.name}
          </h2>
          <p className="text-sm text-[var(--color-ink-500)]">{about.chiefSwamiji.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-700)]">
            {about.chiefSwamiji.description}
          </p>
        </div>
      </section>

      <section id="paryaya" className="scroll-mt-20 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
        <h2 className="font-display text-xl text-[var(--color-ink-900)]">
          {about.paryayaSignificance.heading}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-700)]">
          {about.paryayaSignificance.body}
        </p>
      </section>

      <section id="udupi" className="scroll-mt-20 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
        <h2 className="font-display text-xl text-[var(--color-ink-900)]">{about.udupi.heading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-700)]">{about.udupi.body}</p>
      </section>

      <section id="guru-parampara" className="scroll-mt-20 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
        <h2 className="font-display text-xl text-[var(--color-ink-900)]">
          {about.guruparampara.heading}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-ink-700)]">{about.guruparampara.intro}</p>
        <div className="mt-4">
          {about.guruparampara.entries.map((entry) => (
            <ExpandableTimelineEntry key={entry.order} {...entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
