"use client";

import { useEffect } from "react";
import { useUiSettings } from "@/context/UiSettingsContext";

export default function DeveloperPreferences() {
  const { presentationSettings } = useUiSettings();
  useEffect(() => {
    document.documentElement.style.setProperty("--tile-overlay-opacity", String(presentationSettings.tileOverlayOpacity / 100));
  }, [presentationSettings.tileOverlayOpacity]);
  useEffect(() => {
    document.documentElement.style.setProperty("--tile-corner-radius", `${presentationSettings.tileCornerRadius}px`);
  }, [presentationSettings.tileCornerRadius]);
  useEffect(() => {
    document.documentElement.style.setProperty("--tile-min-height", `${presentationSettings.tileMinHeight}px`);
  }, [presentationSettings.tileMinHeight]);
  return null;
}
