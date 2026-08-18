"use client";

import { useEffect, useState } from "react";

// Simple shared state without external deps
let _isOpen = false;
const _listeners = new Set<(open: boolean) => void>();

export function openQR() {
  _isOpen = true;
  _listeners.forEach((fn) => fn(true));
}

export function closeQR() {
  _isOpen = false;
  _listeners.forEach((fn) => fn(false));
}

export function useQRModal() {
  const [isOpen, setIsOpen] = useState(_isOpen);

  useEffect(() => {
    const listener = (open: boolean) => setIsOpen(open);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  return { isOpen, openQR, closeQR };
}
