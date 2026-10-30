"use client";

import { useId, useState, type FormEvent } from "react";
import { useLang } from "@/context/LanguageContext";
import { defaultContentMode, developerOptions } from "@/gen/content";
import { uiFields } from "@/gen/settings/ui-elements";
import { useUiSettingsEditor } from "@/context/UiSettingsContext";
import { UiSettingsError, validateUiElements } from "../../build/ui-settings-schema.mjs";
import type { UiElements, UiValue } from "@/lib/ui-settings-types";
import LocalContentToggle from "@/components/LocalContentToggle";

interface HeroExperiments {
  aspectMode: "focal" | "dual" | "fluid";
  indicators: boolean;
  animation: "kenburns" | "fade";
  scrim: "ambient" | "minimal";
}

const defaultExperiments: HeroExperiments = {
  aspectMode: "focal",
  indicators: true,
  animation: "kenburns",
  scrim: "ambient",
};

function HeroExperimentsSection() {
  const [settings, setSettings] = useState<HeroExperiments>(() => {
    if (typeof window === "undefined") return defaultExperiments;
    try {
      const raw = window.localStorage.getItem("site-hero-experiments");
      return raw ? { ...defaultExperiments, ...JSON.parse(raw) } : defaultExperiments;
    } catch {
      return defaultExperiments;
    }
  });

  const update = (partial: Partial<HeroExperiments>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("site-hero-experiments", JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
      } catch {}
    }
  };

  const baseId = useId();

  return (
    <fieldset className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
      <legend className="px-2 font-semibold text-[var(--color-text-primary)]">
        Hero Section Experiments &amp; Aspect Ratio Modes
      </legend>
      <p className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        Test all 3 aspect-ratio approaches and visual enhancements for the homepage Hero carousel across portrait and landscape screens.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor={`${baseId}-aspect`} className="block font-semibold text-[var(--color-text-primary)]">
            Aspect Ratio &amp; Cropping Approach
          </label>
          <select
            id={`${baseId}-aspect`}
            value={settings.aspectMode}
            onChange={(e) => update({ aspectMode: e.target.value as HeroExperiments["aspectMode"] })}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-paper)] px-3 py-2 text-ui text-[var(--color-text-primary)]"
          >
            <option value="focal">
              Approach 2: Focal-Point Controlled (Anchors faces/deities at 25% vertical focal point)
            </option>
            <option value="dual">
              Approach 1: Art-Directed Dual View (Portrait crop on mobile, Wide panoramic on desktop)
            </option>
            <option value="fluid">
              Approach 3: Fluid Aspect Ratio (aspect-[4/3] mobile to aspect-[21/9] desktop)
            </option>
          </select>
          <p className="mt-1.5 text-caption text-[var(--color-text-secondary)]">
            {settings.aspectMode === "focal" && "Keeps standard hero height while ensuring top of idols/faces are never cut off during horizontal cropping."}
            {settings.aspectMode === "dual" && "Switches between portrait-optimized framing on phones and wide panoramic framing on desktop."}
            {settings.aspectMode === "fluid" && "Adapts container ratio smoothly from 4:3 (phones) to 16:9 and 21:9 (desktop), avoiding excessive vertical space."}
          </p>
        </div>

        <div className="flex min-h-11 items-center justify-between gap-4 border-t border-[var(--color-line)] pt-4">
          <label htmlFor={`${baseId}-indicators`} className="cursor-pointer font-semibold text-[var(--color-text-primary)]">
            <span>Slide Progress Indicator Pills</span>
            <span className="block text-caption font-normal text-[var(--color-text-secondary)]">
              Displays 6 discreet progress pills at the bottom with saffron active state and click-to-jump.
            </span>
          </label>
          <input
            id={`${baseId}-indicators`}
            type="checkbox"
            checked={settings.indicators}
            onChange={(e) => update({ indicators: e.target.checked })}
            className="size-5 shrink-0 accent-[var(--color-saffron-600)] cursor-pointer"
          />
        </div>

        <div className="border-t border-[var(--color-line)] pt-4">
          <label htmlFor={`${baseId}-animation`} className="block font-semibold text-[var(--color-text-primary)]">
            Motion &amp; Transition Style
          </label>
          <select
            id={`${baseId}-animation`}
            value={settings.animation}
            onChange={(e) => update({ animation: e.target.value as HeroExperiments["animation"] })}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-paper)] px-3 py-2 text-ui text-[var(--color-text-primary)]"
          >
            <option value="kenburns">Cinematic Ken Burns (Subtle slow zoom + cross-fade)</option>
            <option value="fade">Classic Smooth Cross-Fade</option>
          </select>
        </div>

        <div className="border-t border-[var(--color-line)] pt-4">
          <label htmlFor={`${baseId}-scrim`} className="block font-semibold text-[var(--color-text-primary)]">
            Text Scrim &amp; Contrast Overlay
          </label>
          <select
            id={`${baseId}-scrim`}
            value={settings.scrim}
            onChange={(e) => update({ scrim: e.target.value as HeroExperiments["scrim"] })}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-paper)] px-3 py-2 text-ui text-[var(--color-text-primary)]"
          >
            <option value="ambient">Warm Temple Ambient Gradient (Deep darkroom saffron gradient)</option>
            <option value="minimal">Minimal Scrim (Subtle text shadow only)</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
}

function SocialPreviewSection() {
  const { tr } = useLang();
  const [platform, setPlatform] = useState<"whatsapp" | "twitter" | "facebook">("whatsapp");

  return (
    <fieldset className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
      <legend className="px-2 font-semibold text-[var(--color-text-primary)]">
        Social Media Share Cards (Open Graph / Twitter)
      </legend>
      <p className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        Live preview of how the website displays when shared on WhatsApp, Twitter/X, and Facebook.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {(["whatsapp", "twitter", "facebook"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                platform === p
                  ? "bg-[var(--color-saffron-600)] text-white"
                  : "border border-[var(--color-line-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Card Mockup */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-paper)] shadow-sm max-w-md">
          <div className="relative aspect-[1200/630] w-full bg-[#1a1108] flex items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="font-display text-2xl font-bold text-[#fff8ed]">
                {tr.site_name}
              </span>
              <span className="text-xs text-[var(--color-saffron-400)]">
                shiroormatha.org
              </span>
            </div>
          </div>
          <div className="p-3.5 space-y-1 bg-[var(--color-paper)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-brand)]">
              shiroormatha.org
            </p>
            <p className="font-semibold text-sm text-[var(--color-text-primary)] line-clamp-1">
              {tr.meta_title}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {tr.meta_description}
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
export default function DeveloperOptionsPage() {
  const { tr, setContentMode } = useLang();
  const editor = useUiSettingsEditor();
  const [draft, setDraft] = useState<UiElements>(() => editor.values);
  const [invalid, setInvalid] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const formId = useId();
  if (!developerOptions.enabled) return null;
  const copy = tr.developer_options;
  const groups = [...new Set(uiFields.map((field) => field.group))];
  const change = (group: string, key: string, value: UiValue) => {
    setDraft((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
    setInvalid(false);
  };
  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const persistent = editor.apply(validateUiElements(draft));
      if (persistent) window.location.reload();
      else setStorageWarning(true);
    } catch (error) {
      if (!(error instanceof UiSettingsError)) throw error;
      console.warn("[preferences] UI settings were not applied.", error);
      setInvalid(true);
      return;
    }
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-4xl">{copy.title}</h1>
      <p className="mt-3 text-base leading-7 text-[var(--color-text-secondary)]">{copy.description}</p>
      {(!editor.persistent || storageWarning) && <p role="status" className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{copy.storage_warning}</p>}
      <div className="mt-8 space-y-6">
        <form onSubmit={apply} className="space-y-6">
          {groups.map((group) => (
            <fieldset key={group} className="min-w-0 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
              <legend className="px-2 font-semibold text-[var(--color-text-primary)]">{copy.groups[group]}</legend>
              {copy.group_descriptions[group] && <p className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">{copy.group_descriptions[group]}</p>}
              <div className="space-y-5">
                {uiFields.filter((field) => field.group === group).map((field) => {
                  const path = `${group}.${field.key}`;
                  const id = `${formId}-${path}`;
                  const fieldCopy = copy.fields[path];
                  const value = draft[group][field.key];
                  const description = fieldCopy.description ? `${id}-description` : undefined;
                  return (
                    <div key={path}>
                      <label htmlFor={id} className="flex min-h-11 flex-wrap items-center gap-3 font-semibold text-[var(--color-text-primary)]">
                        {field.kind === "boolean" && <input id={id} name={path} type="checkbox" checked={value === true} onChange={(event) => change(group, field.key, event.target.checked)} aria-describedby={description} className="size-5 shrink-0 accent-[var(--color-saffron-600)]" />}
                        <span id={`${id}-label`} className="min-w-0 flex-1">{fieldCopy.label}</span>
                        {field.kind === "number" && <input id={id} name={path} type="number" required min={field.minimum} max={field.maximum} step={field.integer ? 1 : "any"} value={typeof value === "number" ? value : ""} onChange={(event) => change(group, field.key, event.target.value === "" ? "" : event.target.valueAsNumber)} aria-describedby={description} className="min-h-11 w-32 max-w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-paper)] px-3 py-2 text-[var(--color-text-primary)]" />}
                        {field.kind === "choice" && <select id={id} name={path} value={typeof value === "string" ? value : ""} onChange={(event) => change(group, field.key, event.target.value)} aria-labelledby={`${id}-label`} aria-describedby={description} className="min-h-11 max-w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-paper)] px-3 py-2 text-[var(--color-text-primary)]">{field.options.map((option) => <option key={option} value={option}>{copy.choices[option]}</option>)}</select>}
                      </label>
                      {description && <p id={description} className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{fieldCopy.description}</p>}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {invalid && <p role="alert" className="text-sm font-semibold text-[var(--color-text-primary)]">{copy.invalid_settings}</p>}
          <button type="submit" className="min-h-11 rounded-full bg-[var(--color-saffron-600)] px-5 py-2 font-semibold text-white">{copy.apply}</button>
        </form>
        <LocalContentToggle />
        <HeroExperimentsSection />
        <SocialPreviewSection />
        <button
          type="button"
          onClick={() => {
            const persistent = editor.reset();
            setContentMode(defaultContentMode);
            if (persistent) window.location.reload();
            else setStorageWarning(true);
          }}
          className="min-h-11 rounded-full border border-[var(--color-line-strong)] px-5 py-2 font-semibold text-[var(--color-text-brand)]"
        >
          {copy.reset}
        </button>
      </div>
    </div>
  );
}
