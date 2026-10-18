"use client";

import { useEffect, useRef } from "react";
import { useUiSettings } from "@/context/UiSettingsContext";

export function useModalReset(isOpen: boolean, reset: () => void) {
  const { interactionSettings } = useUiSettings();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isOpen && timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, [isOpen]);
  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  return () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      reset();
    }, interactionSettings.modalResetDelayMs);
  };
}
