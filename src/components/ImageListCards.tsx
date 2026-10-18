"use client";

import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { approvedLearningUrl, learningDestination } from "@/lib/learn";

export default function ImageListCards({ contentKey }: { contentKey: "learn" | "volunteer_ops" }) {
  const { tr } = useLang();
  const items = tr[contentKey];
  if (contentKey === "learn") {
    const labels = tr.pages.learn;
    return (
      <div className="layout-collection grid gap-5 sm:grid-cols-2">
        {tr.learn.map((item) => {
          const href = learningDestination(item);
          const enrollmentUrl = approvedLearningUrl(item.enrollmentUrl);
          return (
            <article key={item.id ?? item.title} className="layout-info-tile visual-tile relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)]">
              <div className="visual-tile-art relative h-44">
                <ContentImage src={item.img} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" />
              </div>
              <div className="visual-tile-body p-5">
                <h2 className="layout-tile-title font-display text-xl font-bold">
                  {href ? <Link href={href} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-[var(--color-saffron-600)]">{item.title}</Link> : item.title}
                </h2>
                <p className="layout-tile-summary mt-2 text-sm text-[var(--color-text-secondary)]">{item.sub}</p>
                <dl className="layout-tile-footer mt-4 grid grid-cols-2 gap-3 text-sm">
                  {(["level", "language", "format", "duration"] as const).map((field) => (
                    <div key={field}><dt className="font-semibold">{labels[field]}</dt><dd className="text-[var(--color-text-muted)]">{item[field] || labels.unspecified}</dd></div>
                  ))}
                </dl>
                {(item.availability || !enrollmentUrl) && <p className="layout-tile-availability mt-4 text-sm text-[var(--color-text-muted)]">{item.availability || labels.availability}</p>}
                <div className="layout-tile-actions mt-3 flex flex-wrap gap-3">
                  {enrollmentUrl && <a href={enrollmentUrl} className="relative z-10 inline-flex min-h-11 items-center font-semibold text-[var(--color-text-brand)]">{labels.enroll}</a>}
                </div>
              </div>
            </article>
          );
        })}
        {!tr.learn.length && <p role="status">{labels.empty}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5 max-w-xl">
      {items.map((it) => (
        <div key={it.title} className="flex items-center gap-3.5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-2.5 shadow-[var(--shadow-xs)]">
          <div className="relative w-[62px] h-[62px] shrink-0 rounded-[4px] overflow-hidden">
            <ContentImage src={it.img} alt="" fill sizes="62px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight">{it.title}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{it.sub}</p>
          </div>
          <ChevronRight size={20} className="text-[var(--color-text-secondary)] shrink-0" />
        </div>
      ))}
    </div>
  );
}
