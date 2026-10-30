"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { uiElementDefaults } from "@/gen/settings/ui-elements";
import { applyUiSettings, uiPreferences, imagePreference } from "@/lib/ui-settings-preferences";
import { parseUiSettings, validateUiPreferences } from "../../build/ui-settings-schema.mjs";
import type { UiElements, UiSettings } from "@/lib/ui-settings-types";

interface UiSettingsState {
  settings: UiSettings;
  values: UiElements;
  apply: typeof applyUiSettings;
  reset: () => boolean;
  persistent: boolean;
}

const UiSettingsContext = createContext<UiSettingsState | null>(null);

export function UiSettingsProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(uiPreferences.subscribe, uiPreferences.getSnapshot, uiPreferences.getServerSnapshot);
  const image = useSyncExternalStore(imagePreference.subscribe, imagePreference.getSnapshot, imagePreference.getServerSnapshot);
  const base = useMemo(() => {
    const values = validateUiPreferences(JSON.parse(snapshot), uiElementDefaults);
    return { values, settings: parseUiSettings(values) };
  }, [snapshot]);
  const state = useMemo(() => {
    const settings = { ...base.settings };
    const resolved = (override: string, fallback: boolean) => override === "default" ? fallback : override === "on";
    settings.presentationSettings = {
      ...settings.presentationSettings,
      imageTreatment: resolved(image, settings.presentationSettings.imageTreatment),
    };
    return {
      settings,
      values: { ...base.values, presentation: { ...settings.presentationSettings } },
      apply: applyUiSettings,
      reset: () => applyUiSettings(uiElementDefaults),
      persistent: [uiPreferences, imagePreference].every((store) => store.isPersistent()),
    };
  }, [base, image]);
  return <UiSettingsContext.Provider key={snapshot} value={state}>{children}</UiSettingsContext.Provider>;
}

function useUiSettingsState() {
  const state = useContext(UiSettingsContext);
  if (!state) throw new Error("UiSettingsProvider is required.");
  return state;
}

export function useUiSettings() {
  return useUiSettingsState().settings;
}

export function useUiSettingsEditor() {
  return useUiSettingsState();
}
