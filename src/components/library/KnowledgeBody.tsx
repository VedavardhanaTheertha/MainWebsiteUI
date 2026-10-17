"use client";

import { useId, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { knowledgeReadingTime, knowledgeText, type DisplayArticle } from "@/lib/knowledge";
import type { KnowledgeText } from "@/lib/knowledge-types";

const prose = "mt-6 max-w-none space-y-5 text-base leading-8 text-[var(--color-text-secondary)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:break-words [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h1]:hidden [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_img]:max-w-full [&_table]:block [&_table]:overflow-x-auto";

export default function KnowledgeBody({ article, sectionId }: { article: DisplayArticle; sectionId: string }) {
  const { lang, tr } = useLang();
  const copy = tr.library_browser;
  const details = article.knowledge;
  const readingTime = sectionId === "stories" || details?.readMinutes ? knowledgeReadingTime(article) : undefined;
  const [active, setActive] = useState<number | null>(null);
  const annotationId = useId();
  const text = (value: KnowledgeText) => knowledgeText(value, lang);
  const label = (key: string) => copy.detail_labels[key];
  const heading = (key: string, body: React.ReactNode) => (
    <section key={key} className="mt-6">
      <h3 className="mb-3 font-display text-xl font-semibold text-[var(--color-text-primary)]">{label(key)}</h3>
      {body}
    </section>
  );
  const image = details?.illustration;
  return (
    <div className="text-base leading-8 text-[var(--color-text-secondary)]">
      {sectionId === "remedies" && <aside className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-5">{copy.devotional_context}</aside>}
      {details && <dl className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {(["author", "reviewer", "publishedOn", "reviewedOn", "verifiedOn"] as const).map((key) => {
          const value = details[key];
          return value ? <div key={key}><dt className="font-semibold">{label(key)}</dt><dd>{typeof value === "string" ? <time dateTime={value}>{value}</time> : text(value)}</dd></div> : null;
        })}
      </dl>}
      {sectionId === "projects" && heading("status", <p>{details?.project ? label(details.project.status) : copy.unavailable}</p>)}
      {details?.project && (["milestones", "updates", "outcomes"] as const).map((key) => {
        const entries = details.project?.[key];
        return entries?.length ? heading(key, <ol className="list-disc space-y-3 pl-6">{entries.map((entry, index) => <li key={index}><time dateTime={entry.date} className="mr-3 font-semibold">{entry.date}</time>{text(entry.text)}</li>)}</ol>) : null;
      })}
      {sectionId === "mantra" && (["original", "transliteration", "meaning", "guidance"] as const).map((key) => {
        const value = details?.mantra?.[key];
        return heading(key, <p className="whitespace-pre-line">{value ? text(value) : copy.unavailable}</p>);
      })}
      {details?.mantra?.audio && heading("audio", <audio controls preload="none" aria-label={text(details.mantra.audio.label)} className="w-full"><source src={details.mantra.audio.src} /><a href={details.mantra.audio.src}>{text(details.mantra.audio.label)}</a></audio>)}
      {sectionId === "stories" && heading("themes", <ul className="flex flex-wrap gap-2">{(details?.themes?.map(text) ?? article.tags).map((theme, index) => <li className="rounded-full bg-[var(--color-cream-soft)] px-3 py-1" key={index}>{theme}</li>)}</ul>)}
      {readingTime && <p className="mt-4">{(readingTime.estimated ? copy.estimated_read_minutes : copy.read_minutes).replace("{count}", String(readingTime.minutes))}</p>}
      {details?.glossary && heading("glossary", <dl className="space-y-4">{[...details.glossary].sort((a, b) => text(a.term).localeCompare(text(b.term), lang)).map((entry, index) => <div key={index}><dt className="font-bold">{text(entry.term)}</dt><dd>{text(entry.definition)}</dd></div>)}</dl>)}
      {image && heading("illustration", <>
        <div className="relative">
          {/* Approved illustrations may use hosts outside the site's decorative-image configuration. */}
          <img src={image.src} alt={text(image.alt)} className="h-auto w-full rounded-xl" />
          {image.annotations.map((entry, index) => <button type="button" key={index} style={{ left: `${entry.x}%`, top: `${entry.y}%` }} className="absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--color-ink-900)] font-bold text-white shadow focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={`${index + 1}: ${text(entry.label)}`} aria-expanded={active === index} aria-controls={`${annotationId}-${index}`} onClick={() => setActive(active === index ? null : index)}>{index + 1}</button>)}
        </div>
        <ol className="mt-4 space-y-2">{image.annotations.map((entry, index) => <li key={index}><button type="button" onClick={() => setActive(active === index ? null : index)} aria-expanded={active === index} aria-controls={`${annotationId}-${index}`} className="min-h-11 text-left font-semibold underline underline-offset-4">{index + 1}. {text(entry.label)}</button><p id={`${annotationId}-${index}`} hidden={active !== index}>{text(entry.explanation)}</p></li>)}</ol>
      </>)}
      {sectionId === "pilgrim" && (["directions", "hours", "accessibility", "customs", "meals", "accommodation", "contacts"] as const).map((key) => {
        const value = details?.practical?.[key];
        return heading(key, <p className="whitespace-pre-line">{value ? text(value) : copy.unavailable}</p>);
      })}
      {details?.editorial && heading("editorial", <p>{text(details.editorial.reviewer)} · <time dateTime={details.editorial.reviewedOn}>{details.editorial.reviewedOn}</time></p>)}
      {sectionId === "remedies" && !details?.editorial && heading("editorial", <p>{copy.unavailable}</p>)}
      <div className={prose} dangerouslySetInnerHTML={{ __html: article.html }} />
      {details?.references && heading("references", <ul className="list-disc space-y-2 pl-6">{details.references.map((reference, index) => <li key={index}><a className="break-words underline underline-offset-4" href={reference.url}>{text(reference.label)}</a></li>)}</ul>)}
    </div>
  );
}
