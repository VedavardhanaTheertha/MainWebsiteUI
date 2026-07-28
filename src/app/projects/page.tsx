"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

const STATUS_STYLE: Record<string, string> = {
  ongoing: "bg-[var(--color-saffron-100)] text-[var(--color-saffron-700)]",
  completed: "bg-green-100 text-green-800",
  upcoming: "bg-[var(--color-cream)] text-[var(--color-ink-500)]",
};

export default function ProjectsPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.projects.heading} subheading={tr.projects.intro} />
      <section className="grid grid-cols-1 gap-3 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:grid-cols-2 lg:gap-5 lg:px-8">
        {tr.projects.list.map((project) => (
          <div
            key={project.id}
            className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-3 shadow-[var(--shadow-card)]"
          >
            <PlaceholderImage
              imageKey={project.image}
              alt={project.title}
              aspect="1 / 1"
              radius="md"
              className="h-20 w-20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span
                className={`inline-block rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLE[project.status]}`}
              >
                {project.status}
              </span>
              <h3 className="mt-1 font-display text-base text-[var(--color-ink-900)]">{project.title}</h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-ink-700)]">{project.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
