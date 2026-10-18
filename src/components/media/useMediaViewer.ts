"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(notify: () => void) {
  window.addEventListener("hashchange", notify);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener("hashchange", notify);
    window.removeEventListener("popstate", notify);
  };
}

function updateItem(id: string | null, replace = false) {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  if (id === null) hash.delete("item");
  else hash.set("item", id);
  url.hash = hash.toString();
  window.history[replace ? "replaceState" : "pushState"](null, "", url);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function useMediaViewer() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  const itemId = new URLSearchParams(hash.slice(1)).get("item");
  const open = useCallback((id: string) => updateItem(id), []);
  const close = useCallback(() => updateItem(null, true), []);
  const move = useCallback((id: string) => updateItem(id, true), []);
  return { itemId, open, close, move };
}
