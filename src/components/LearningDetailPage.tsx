"use client";

import Link from "next/link";
import ContentImage from "@/components/presentation/ContentImage";
import { useLang } from "@/context/LanguageContext";
import { approvedLearningUrl } from "@/lib/learn";

export default function LearningDetailPage({ id }: { id: string }) {
  const { tr } = useLang();
  const labels = tr.pages.learn;
  const item = tr.learn.find((entry) => entry.id === id);
  const enrollmentUrl = approvedLearningUrl(item?.enrollmentUrl);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
      <Link href="/learn" className="mb-6 inline-flex min-h-11 items-center text-[var(--color-text-brand)] underline underline-offset-4">{labels.back}</Link>
      {item ? <article>
        <h1 className="font-display text-3xl font-bold lg:text-5xl">{item.title}</h1>
        <p className="mt-4 text-lg text-[var(--color-text-secondary)]">{item.description || item.sub}</p>
        <div className="relative mt-7 aspect-[16/7] overflow-hidden rounded-xl">
          <ContentImage src={item.img} alt="" fill sizes="(max-width: 896px) 100vw, 896px" />
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-5 rounded-xl border border-[var(--color-line)] p-5 sm:grid-cols-4">
          {(["level", "language", "format", "duration"] as const).map((field) => <div key={field}><dt className="font-semibold">{labels[field]}</dt><dd className="mt-1 text-sm text-[var(--color-text-muted)]">{item[field] || labels.unspecified}</dd></div>)}
        </dl>
        {(item.availability || !enrollmentUrl) && <p className="mt-6 text-[var(--color-text-secondary)]">{item.availability || labels.availability}</p>}
        {enrollmentUrl && <a href={enrollmentUrl} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[var(--color-saffron-600)] px-5 font-semibold text-white">{labels.enroll}</a>}
      </article> : <h1 className="font-display text-2xl">{labels.not_found}</h1>}
    </div>
  );
}
