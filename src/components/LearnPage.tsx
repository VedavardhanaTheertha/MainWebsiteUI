"use client";

import Link from "next/link";
import ImageListCards from "@/components/ImageListCards";
import { useLang } from "@/context/LanguageContext";
import { learningDestination } from "@/lib/learn";

export default function LearnPage() {
  const { tr } = useLang();
  const labels = tr.pages.learn;
  return (
    <div>
      <header className="bg-transparent px-16 pt-3.5 pb-2 text-center sm:px-20 sm:pt-4 sm:pb-3 lg:px-8">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">{labels.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold lg:text-5xl">{labels.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--color-text-secondary)]">{labels.intro}</p>
      </header>
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-8 lg:px-8 lg:pt-6 lg:pb-12">
        <ImageListCards contentKey="learn" />
        {!!labels.suggested_paths.length && (
          <section className="mt-8 sm:mt-10" aria-labelledby="learning-paths">
            <h2 id="learning-paths" className="font-display text-2xl font-bold">{labels.paths_title}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {labels.suggested_paths.map((path) => (
                <article key={path.title} className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-saffron-500)] hover:shadow-sm">
                  <h3 className="font-display text-xl font-semibold">{path.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{path.description}</p>
                  <ul className="mt-3">
                    {path.itemIds.map((id) => {
                      const item = tr.learn.find((entry) => entry.id === id);
                      const href = item && learningDestination(item);
                      return item && href ? <li key={id}><Link className="inline-flex min-h-11 items-center text-[var(--color-text-brand)] underline underline-offset-4" href={href}>{item.title}</Link></li> : null;
                    })}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
