"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { uiElementDefaults } from "@/gen/settings/ui-elements";
import { applyUiSettings, uiPreferences } from "@/lib/ui-settings-preferences";
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
  const base = useMemo(() => {
    const values = validateUiPreferences(JSON.parse(snapshot), uiElementDefaults);
    return { values, settings: parseUiSettings(values) };
  }, [snapshot]);
  const state = useMemo(() => {
    return {
      settings: base.settings,
      values: base.values,
      apply: applyUiSettings,
      reset: () => applyUiSettings(uiElementDefaults),
      persistent: uiPreferences.isPersistent(),
    };
  }, [base]);
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
