"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Calendar, Clock, MapPin, User, Tag } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { EventItem, EventCategory } from "@/gen/events/data";
import { imagePaths } from "@/lib/images";

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const { lang, tr } = useLang();
  const isKn = lang === "kn";
  const copy = tr.events_exact;

  useEffect(() => {
    if (!event) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  if (!event) return null;

  const title = isKn ? event.title?.kn : event.title?.en;
  const displayDate = isKn ? event.displayDate?.kn : event.displayDate?.en;
  const time = isKn ? event.time?.kn : event.time?.en;
  const location = isKn ? event.location?.kn : event.location?.en;
  const performers = isKn ? event.performers?.kn : event.performers?.en;
  const description = isKn ? event.description?.kn : event.description?.en;
  const details = isKn ? event.details?.kn : event.details?.en;
  const imgUrl = event.image || imagePaths.event || "/slide/1.jpg";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-[rgba(26,17,8,0.7)] backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[var(--color-line)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Hero */}
        <div className="relative w-full h-48 sm:h-64 shrink-0 bg-[var(--color-cream-soft)] overflow-hidden">
          <Image
            src={imgUrl}
            alt=""
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/85 via-[var(--color-ink-900)]/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
            aria-label={copy.close_modal ?? "Close"}
          >
            <X size={20} />
          </button>

          {/* Badges on hero */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-1.5">
            {event.categories?.map((cat: EventCategory) => (
              <span
                key={cat.code}
                className="bg-[rgba(26,17,8,0.8)] backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              >
                {isKn ? cat.kn : cat.en}
              </span>
            ))}
            {event.isRecurring && (
              <span className="bg-[#166534]/90 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {copy.recurring_badge ?? "Recurring"}
              </span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] leading-tight">
            {title}
          </h2>

          {/* Metadata badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-cream-soft)]/60 p-3 rounded-xl border border-[var(--color-line)]">
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
            <div className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              <p>{description}</p>
            </div>
          )}

          {/* Details */}
          {details && details !== description && (
            <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-line)] pt-3 whitespace-pre-line">
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
                {copy.gallery ?? "Event Gallery"}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {event.images.map((gImg, gIdx) => (
                  <div
                    key={gIdx}
                    className="relative h-24 rounded-lg overflow-hidden border border-[var(--color-line)]"
                  >
                    <Image src={gImg} alt="" fill sizes="160px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 sm:px-6 bg-[var(--color-cream-soft)] border-t border-[var(--color-line)] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--color-saffron-600)] text-white font-body text-xs font-semibold hover:bg-[var(--color-saffron-800)] transition-colors"
          >
            {copy.close_modal ?? "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
