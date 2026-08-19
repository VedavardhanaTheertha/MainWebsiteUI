"use client";

import { useEffect, useState } from "react";

let _isOpen = false;
const _listeners = new Set<(open: boolean) => void>();

export function openVolunteerModal() {
  _isOpen = true;
  _listeners.forEach((fn) => fn(true));
}

export function closeVolunteerModal() {
  _isOpen = false;
  _listeners.forEach((fn) => fn(false));
}

export function useVolunteerModal() {
  const [isOpen, setIsOpen] = useState(_isOpen);
  useEffect(() => {
    const listener = (open: boolean) => setIsOpen(open);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return { isOpen, openVolunteerModal, closeVolunteerModal };
}
