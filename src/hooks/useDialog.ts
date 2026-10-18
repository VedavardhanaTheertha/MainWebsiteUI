"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const dialogs: HTMLElement[] = [];
const listeners = new Set<() => void>();
let scrollLocks = 0;
let previousOverflow = "";

export function lockPageScroll() {
  if (scrollLocks++ === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
  };
}

function subscribeDialogs(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useDialogsOpen() {
  return useSyncExternalStore(subscribeDialogs, () => dialogs.length > 0, () => false);
}
const focusableSelector = [
  "a[href]", "button:not([disabled])", "input:not([disabled])",
  "select:not([disabled])", "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])', "video[controls]", "audio[controls]",
].join(",");

function focusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.closest("[hidden], [inert]") && element.getClientRects().length > 0);
}

export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlockScroll = lockPageScroll();
    dialogs.push(dialog);
    listeners.forEach((listener) => listener());
    const previousTabIndex = dialog.getAttribute("tabindex");
    dialog.tabIndex = -1;
    const focusFirst = () => (focusableElements(dialog)[0] ?? dialog).focus();
    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (dialogs.at(-1) !== dialog) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      } else if (event.key === "Tab") {
        const elements = focusableElements(dialog);
        const first = elements[0];
        const last = elements.at(-1);
        if (!first || !last) {
          event.preventDefault();
          dialog.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (dialogs.at(-1) === dialog && event.target instanceof Node && !dialog.contains(event.target)) {
        focusFirst();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      const wasTop = dialogs.at(-1) === dialog;
      const index = dialogs.lastIndexOf(dialog);
      if (index >= 0) dialogs.splice(index, 1);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn);
      if (previousTabIndex === null) dialog.removeAttribute("tabindex");
      else dialog.setAttribute("tabindex", previousTabIndex);
      unlockScroll();
      listeners.forEach((listener) => listener());
      if (wasTop) {
        const next = dialogs.at(-1);
        if (opener?.isConnected && (!next || next.contains(opener))) opener.focus();
        else if (next) (focusableElements(next)[0] ?? next).focus();
      }
    };
  }, [open]);
  return ref;
}
