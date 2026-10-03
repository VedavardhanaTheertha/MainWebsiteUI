"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Clock,
  ExternalLink,
  Landmark,
  Mail,
  MapPin,
  Navigation,
  Phone,
  X,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { defaultContentMode } from "@/gen/content";
import {
  alternateBranches,
  alternateConnectLinks,
  branches,
  connectLinks,
  type BranchRecord,
  type LocalizedText,
} from "@/gen/connect/data";
import type { ConnectPageShape } from "@/lib/content-types";

function localized(value: LocalizedText, lang: string) {
  return value[lang] ?? value.en;
}

export default function ConnectBrowser() {
  const { lang, tr, contentMode } = useLang();
  const copy = tr.connect_page;
  const activeBranches =
    contentMode !== defaultContentMode && alternateBranches ? alternateBranches : branches;
  const activeConnectLinks =
    contentMode !== defaultContentMode && alternateConnectLinks
      ? alternateConnectLinks
      : connectLinks;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => activeBranches.find((branch) => branch.id === selectedId) ?? null,
    [activeBranches, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-10 lg:py-14">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 font-body text-sm leading-7 text-[var(--color-text-secondary)] lg:text-base">
          {copy.intro}
        </p>
      </header>

      <section aria-labelledby="branches-heading">
        <div className="mb-5 max-w-2xl">
          <h2 id="branches-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            {copy.branches_title}
          </h2>
          <p className="mt-2 font-body text-sm leading-6 text-[var(--color-text-secondary)]">
            {copy.branches_intro}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {activeBranches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setSelectedId(branch.id)}
              className="group flex min-h-64 flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5 text-left shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:border-[var(--color-saffron-500)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
              aria-label={`${copy.view_details}: ${localized(branch.title, lang)}`}
            >
              <span className="mb-4 grid size-11 place-items-center rounded-full bg-[var(--color-saffron-100)] text-[var(--color-saffron-800)]">
                <Landmark size={21} aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                {localized(branch.title, lang)}
              </span>
              <span className="mt-1 font-body text-xs font-semibold uppercase tracking-wider text-[var(--color-text-brand)]">
                {localized(branch.branchType, lang)}
              </span>
              <span className="mt-4 flex items-start gap-2 font-body text-sm leading-6 text-[var(--color-text-secondary)]">
                <MapPin size={16} className="mt-1 shrink-0 text-[var(--color-saffron-700)]" aria-hidden="true" />
                {localized(branch.address, lang)}
              </span>
              {branch.phone && (
                <span className="mt-3 flex items-center gap-2 font-body text-sm font-semibold text-[var(--color-text-primary)]">
                  <Phone size={15} className="shrink-0 text-[var(--color-saffron-700)]" aria-hidden="true" />
                  {branch.phone}
                </span>
              )}
              <span className="mt-auto pt-5 font-body text-xs font-bold text-[var(--color-text-brand)]">
                {copy.view_details}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="connect-heading" className="mt-14">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <h2 id="connect-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            {copy.connect_title}
          </h2>
          <p className="mt-2 font-body text-sm leading-6 text-[var(--color-text-secondary)]">
            {copy.connect_intro}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {activeConnectLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white p-5 text-center shadow-[var(--shadow-xs)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
            >
              <Image
                src={link.icon}
                alt={localized(link.platform, lang)}
                width={56}
                height={56}
                className="size-14 rounded-full shadow-sm"
              />
              <strong className="mt-3 font-body text-sm text-[var(--color-text-primary)]">
                {localized(link.platform, lang)}
              </strong>
              <span className="mt-1 break-all font-body text-[11px]" style={{ color: link.brandColor }}>
                {localized(link.handle, lang)}
              </span>
              {link.audience && (
                <>
                  <span className="mt-4 font-display text-2xl font-bold text-[var(--color-text-primary)]">
                    {link.audience}
                  </span>
                  <span className="mt-1 font-body text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                    {copy.audience}
                  </span>
                </>
              )}
            </a>
          ))}
        </div>
      </section>

      {selected && (
        <BranchDetails
          branch={selected}
          lang={lang}
          copy={copy}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
}

function BranchDetails({
  branch,
  lang,
  copy,
  onClose,
}: {
  branch: BranchRecord;
  lang: string;
  copy: ConnectPageShape;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(26,17,8,0.72)] p-3 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[var(--color-paper)] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] p-4 sm:p-6">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-brand)]">
              {localized(branch.branchType, lang)}
            </p>
            <h2 id="branch-dialog-title" className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)]">
              {localized(branch.title, lang)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-saffron-50)]"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 p-4 sm:p-6">
            <p className="font-body text-sm leading-7 text-[var(--color-text-secondary)]">
              {localized(branch.description, lang)}
            </p>
            <dl className="grid gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-cream-soft)]/50 p-4 text-sm">
              <Detail icon={<MapPin size={16} />} label={copy.address} value={localized(branch.address, lang)} />
              <Detail icon={<Clock size={16} />} label={copy.timings} value={localized(branch.timings, lang)} />
              <Detail icon={<Landmark size={16} />} label={copy.deity} value={localized(branch.deity, lang)} />
              {branch.phone && (
                <Detail
                  icon={<Phone size={16} />}
                  label={copy.phone}
                  value={<a className="text-[var(--color-text-brand)] hover:underline" href={`tel:${branch.phone.replace(/[^\d+]/g, "")}`}>{branch.phone}</a>}
                />
              )}
              <Detail
                icon={<Mail size={16} />}
                label={copy.email}
                value={<a className="text-[var(--color-text-brand)] hover:underline" href={`mailto:${branch.email}`}>{branch.email}</a>}
              />
            </dl>
            <div
              className="max-w-none space-y-4 font-body text-sm leading-7 text-[var(--color-text-secondary)]"
              dangerouslySetInnerHTML={{ __html: localized(branch.detailsHtml, lang) }}
            />
          </div>

          <aside className="border-t border-[var(--color-line)] bg-[var(--color-cream-soft)]/40 p-4 sm:p-6 lg:border-l lg:border-t-0">
            <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
              {copy.map_title}
            </h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
              <iframe
                title={`${copy.map_title}: ${localized(branch.title, lang)}`}
                src={branch.embedMapUrl}
                width="100%"
                height="360"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block"
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <a
                href={branch.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-saffron-600)] px-4 py-3 font-body text-xs font-bold text-[var(--color-text-brand)] transition hover:bg-[var(--color-saffron-50)]"
              >
                <ExternalLink size={15} aria-hidden="true" />
                {copy.open_google_maps}
              </a>
              <a
                href={branch.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-saffron-600)] px-4 py-3 font-body text-xs font-bold text-white transition hover:bg-[var(--color-saffron-800)]"
              >
                <Navigation size={15} aria-hidden="true" />
                {copy.directions}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr] gap-2">
      <span className="mt-0.5 text-[var(--color-saffron-700)]" aria-hidden="true">{icon}</span>
      <div>
        <dt className="font-body text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</dt>
        <dd className="mt-0.5 font-body leading-6 text-[var(--color-text-secondary)]">{value}</dd>
      </div>
    </div>
  );
}
