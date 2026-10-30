"use client";

import { useEffect } from "react";
import { useImageTreatment } from "@/hooks/useImageTreatment";
import { useUiSettings } from "@/context/UiSettingsContext";

export default function DeveloperPreferences() {
  const { imageTreatmentEnabled } = useImageTreatment();
  const { presentationSettings, layoutSettings } = useUiSettings();
  useEffect(() => {
    document.documentElement.dataset.imageTreatment = imageTreatmentEnabled ? "on" : "off";
  }, [imageTreatmentEnabled]);
  useEffect(() => {
    document.documentElement.dataset.imageBackedTiles = presentationSettings.imageBackedTiles ? "on" : "off";
  }, [presentationSettings.imageBackedTiles]);
  useEffect(() => {
    document.documentElement.style.setProperty("--tile-overlay-opacity", String(presentationSettings.tileOverlayOpacity / 100));
  }, [presentationSettings.tileOverlayOpacity]);
  useEffect(() => {
    document.documentElement.style.setProperty("--tile-corner-radius", `${presentationSettings.tileCornerRadius}px`);
  }, [presentationSettings.tileCornerRadius]);
  useEffect(() => {
    for (const [name, enabled] of Object.entries(layoutSettings)) {
      document.documentElement.dataset[name] = enabled ? "on" : "off";
    }
  }, [layoutSettings]);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const apply = () => {
      try {
        const raw = window.localStorage.getItem("site-hero-experiments");
        const exp = raw ? JSON.parse(raw) : null;
        document.documentElement.dataset.heroAspect = exp?.aspectMode || "focal";
        document.documentElement.dataset.heroScrim = exp?.scrim || "ambient";
        document.documentElement.dataset.heroIndicators = exp?.indicators === false ? "off" : "on";
      } catch {}
    };
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);
  return null;
}
