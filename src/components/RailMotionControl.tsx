"use client";

import { useLang } from "@/context/LanguageContext";
import { useUiSettings } from "@/context/UiSettingsContext";
import { Pause, Play } from "lucide-react";

export default function RailMotionControl({
  paused, onToggle, className = "md:hidden",
}: {
  paused: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { tr } = useLang();
  const { railAutoScroll } = useUiSettings();
  if (!railAutoScroll.enabled) return null;
  const label = paused ? tr.page_controls.resume_motion : tr.page_controls.pause_motion;
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={`layout-rail-motion-control absolute right-1 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[var(--color-line-strong)] bg-white/95 text-[var(--color-text-brand)] shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)] ${className}`}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}
