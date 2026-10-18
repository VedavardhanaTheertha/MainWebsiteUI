"use client";

import { useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import { X, Calendar, Clock, MapPin, User, Tag } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { localized, localizedText } from "@/lib/localization";
import type { EventItem, EventCategory } from "@/gen/events/data";
import { imagePaths } from "@/lib/images";
import { siteConfig } from "@/gen/content";
import { useDialog } from "@/hooks/useDialog";
import { createEventCalendar, eventDetailUrl, validEventDate } from "@/lib/event-tools";

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const { lang, tr } = useLang();
  const copy = tr.events_exact;
  const dialogRef = useDialog(Boolean(event), onClose);
  const [actionStatus, setActionStatus] = useState({ slug: "", message: "" });

  if (!event) return null;

  const title = localizedText(event.title, lang);
  const displayDate = localizedText(event.displayDate, lang);
  const time = localizedText(event.time, lang);
  const location = localizedText(event.location, lang);
  const performers = localized(event.performers, lang);
  const description = localizedText(event.description, lang);
  const details = localizedText(event.details, lang);
  const imgUrl = event.image || imagePaths.event || "/slide/1.jpg";
  const detailUrl = () => eventDetailUrl(window.location.href, event.slug, `${siteConfig.basePath}/events/`);
  const shareEvent = async (nativeShare: boolean) => {
    const url = detailUrl();
    try {
      if (nativeShare && navigator.share) {
        await navigator.share({ title, url });
        setActionStatus({ slug: event.slug, message: "" });
      } else {
        await navigator.clipboard.writeText(url);
        setActionStatus({ slug: event.slug, message: copy.link_copied });
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setActionStatus({ slug: event.slug, message: copy.share_error });
      }
    }
  };
  const downloadCalendar = () => {
    const calendar = createEventCalendar(event, title, description, location,
      detailUrl());
    if (!calendar) return;
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug}.ics`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-[rgba(26,17,8,0.7)] backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] bg-white rounded-2xl shadow-2xl border border-[var(--color-line)] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-[var(--color-line)] p-4 sm:px-6">
          <h2 className="min-w-0 flex-1 font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] leading-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label={copy.close_modal} className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full bg-[var(--color-cream-soft)] text-[var(--color-text-primary)]">
            <X size={20} />
          </button>
        </header>
        <div className="relative w-full h-[min(12rem,30dvh)] sm:h-[min(16rem,30dvh)] shrink-0 bg-[var(--color-cream-soft)] overflow-hidden">
          <ContentImage
            src={imgUrl}
            alt=""
            fill
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>

        {/* Content body */}
        <div className="min-h-0 p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {event.categories?.map((cat: EventCategory) => (
              <span
                key={cat.code}
                className="bg-[rgba(26,17,8,0.8)] backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              >
                {localizedText(cat, lang)}
              </span>
            ))}
            {event.isRecurring && (
              <span className="bg-[#166534]/90 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {copy.recurring_badge}
              </span>
            )}
          </div>

          {/* Metadata badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm leading-relaxed text-[var(--color-text-secondary)] bg-[var(--color-cream-soft)]/60 p-3 rounded-xl border border-[var(--color-line)]">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[var(--color-saffron-800)] shrink-0" />
              <span className="font-semibold text-[var(--color-text-primary)]">{displayDate}</span>
            </div>
            {time && (
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[var(--color-saffron-800)] shrink-0" />
                <span>{time}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[var(--color-saffron-800)] shrink-0" />
                <span>{location}</span>
              </div>
            )}
            {performers && performers.length > 0 && (
              <div className="flex items-center gap-2">
                <User size={15} className="text-[var(--color-saffron-800)] shrink-0" />
                <span className="font-medium text-[var(--color-text-brand)]">
                  {performers.join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="text-base text-[var(--color-text-primary)] leading-relaxed">
              <p>{description}</p>
            </div>
          )}

          {/* Details */}
          {details && details !== description && (
            <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-line)] pt-3 whitespace-pre-line">
              <p>{details}</p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <Tag size={12} className="text-[var(--color-text-muted)]" />
              {event.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-[10px] bg-[var(--color-cream-soft)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-md border border-[var(--color-line)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Gallery */}
          {event.images && event.images.length > 0 && (
            <div className="pt-2">
              <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
                {copy.gallery}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {event.images.map((gImg, gIdx) => (
                  <div
                    key={gIdx}
                    className="relative h-24 rounded-lg overflow-hidden border border-[var(--color-line)]"
                  >
                    <ContentImage src={gImg} alt="" fill sizes="160px" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-4 py-3 sm:px-6 bg-[var(--color-cream-soft)] border-t border-[var(--color-line)]">
          <p role="status" className="text-xs text-[var(--color-text-brand)]">{actionStatus.slug === event.slug ? actionStatus.message : ""}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={() => void shareEvent(false)} className="min-h-11 rounded-xl border border-[var(--color-line-strong)] px-3 text-xs font-semibold">{copy.copy_link}</button>
          <button type="button" onClick={() => void shareEvent(true)} className="min-h-11 rounded-xl border border-[var(--color-line-strong)] px-3 text-xs font-semibold">{copy.share}</button>
          <button type="button" onClick={downloadCalendar}
            disabled={!validEventDate(event.startDate)}
            className="min-h-11 rounded-xl border border-[var(--color-line-strong)] px-3 text-xs font-semibold disabled:opacity-40">{copy.add_calendar}</button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4 py-1.5 rounded-xl bg-[var(--color-saffron-600)] text-white font-body text-xs font-semibold hover:bg-[var(--color-saffron-800)] transition-colors"
          >
            {copy.close_modal}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
