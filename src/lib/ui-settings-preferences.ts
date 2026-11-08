import { developerOptions } from "@/gen/content";
import { uiElementDefaults } from "@/gen/settings/ui-elements";
import { createPreferenceStore } from "@/lib/browser-preferences";
import { UiSettingsError, validateUiElements, validateUiPreferences } from "../../build/ui-settings-schema.mjs";
import type { UiElements } from "@/lib/ui-settings-types";

let lastInvalid: string | null = null;
function validSettings(value: string | null): value is string {
  if (value === null) return false;
  try {
    validateUiPreferences(JSON.parse(value), uiElementDefaults);
    return true;
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof UiSettingsError)) throw error;
    if (lastInvalid !== value) {
      console.warn("[preferences] Invalid saved UI settings; using configured defaults.", error);
      lastInvalid = value;
    }
    return false;
  }
}

export const uiPreferences = createPreferenceStore(
  developerOptions.uiSettingsStorageKey, JSON.stringify(uiElementDefaults), validSettings,
);

export function applyUiSettings(value: UiElements) {
  const validated = validateUiElements(value);
  uiPreferences.setValue(JSON.stringify(validated));
  return uiPreferences.isPersistent();
}
