export function createPreferenceStore<T>(
  key: string,
  fallback: T,
  valid: (value: string | null) => value is T & string,
  storageName: "localStorage" | "sessionStorage" = "localStorage",
) {
  let value = fallback;
  let unavailable = false;
  const listeners = new Set<() => void>();
  const report = (error: unknown) => {
    if (!unavailable) {
      console.warn(`[preferences] ${storageName} unavailable for "${key}"; using an in-memory preference.`, error);
    }
    unavailable = true;
  };
  const getSnapshot = () => {
    if (!unavailable) {
      try {
        const stored = window[storageName].getItem(key);
        value = valid(stored) ? stored : fallback;
      } catch (error) { report(error); }
    }
    return value;
  };
  const notify = () => listeners.forEach((listener) => listener());
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) notify();
  };
  return {
    isPersistent: () => !unavailable,
    getSnapshot,
    getServerSnapshot: () => fallback,
    subscribe(listener: () => void) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    setValue(next: T) {
      value = next;
      if (!unavailable) {
        try { window[storageName].setItem(key, String(next)); }
        catch (error) { report(error); }
      }
      notify();
    },
  };
}
