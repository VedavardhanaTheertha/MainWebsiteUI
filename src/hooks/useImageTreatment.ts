"use client";

import { useSyncExternalStore } from "react";
import { developerOptions } from "@/gen/content";
import { createPreferenceStore } from "@/lib/browser-preferences";

type ImageTreatment = "on" | "off";

const imagePreference = createPreferenceStore<ImageTreatment>(
  developerOptions.imageStorageKey,
  developerOptions.defaultImageTreatment,
  (value): value is ImageTreatment => value === "on" || value === "off",
);

export function useImageTreatment() {
  const value = useSyncExternalStore(
    imagePreference.subscribe,
    imagePreference.getSnapshot,
    imagePreference.getServerSnapshot,
  );
  return {
    imageTreatmentEnabled: value === "on",
    setImageTreatmentEnabled: (enabled: boolean) => imagePreference.setValue(enabled ? "on" : "off"),
  };
}
