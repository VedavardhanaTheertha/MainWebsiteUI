"use client";

import { useUiSettings } from "@/context/UiSettingsContext";
import { imagePreference } from "@/lib/ui-settings-preferences";

export function useImageTreatment() {
  const { presentationSettings } = useUiSettings();
  return {
    imageTreatmentEnabled: presentationSettings.imageTreatment,
    setImageTreatmentEnabled: (enabled: boolean) => imagePreference.setValue(enabled ? "on" : "off"),
  };
}
