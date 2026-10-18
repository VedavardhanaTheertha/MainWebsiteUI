"use client";

import { useId, useState, type FormEvent } from "react";
import { useLang } from "@/context/LanguageContext";
import { defaultContentMode, developerOptions } from "@/gen/content";
import { uiFields } from "@/gen/settings/ui-elements";
import { useUiSettingsEditor } from "@/context/UiSettingsContext";
import { UiSettingsError, validateUiElements } from "../../build/ui-settings-schema.mjs";
import type { UiElements, UiValue } from "@/lib/ui-settings-types";
import LocalContentToggle from "@/components/LocalContentToggle";

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
