"use client";

import { useEffect } from "react";
import { useImageTreatment } from "@/hooks/useImageTreatment";

export default function DeveloperPreferences() {
  const { imageTreatmentEnabled } = useImageTreatment();
  useEffect(() => {
    document.documentElement.dataset.imageTreatment = imageTreatmentEnabled ? "on" : "off";
  }, [imageTreatmentEnabled]);
  return null;
}
