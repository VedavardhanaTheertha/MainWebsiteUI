"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { createPreferenceStore } from "@/lib/browser-preferences";

export const contentOverridesStorageKey = "site-content-overrides";

export interface SectionOverride {
  page?: boolean;
  items?: boolean;
}

export type ContentOverrides = Record<string, SectionOverride>;

export interface SectionDefinition {
  id: string;
  name: string;
  route: string;
  defaultPage: boolean;
  defaultItems: boolean;
}

export const allSectionDefinitions: SectionDefinition[] = [
  // 11 Knowledge sections
  { id: "mantra", name: "Mantra Nāda", route: "/library/mantra", defaultPage: false, defaultItems: false },
  { id: "shastra", name: "Shāstra Vidya", route: "/library/shastra", defaultPage: false, defaultItems: false },
  { id: "jnana", name: "Jnāna Kosha", route: "/library/jnana", defaultPage: false, defaultItems: false },
  { id: "dharma", name: "Dharma Vidhi", route: "/library/dharma", defaultPage: true, defaultItems: true },
  { id: "projects", name: "Projects", route: "/projects", defaultPage: false, defaultItems: false },
  { id: "stories", name: "Stories & Chronicles", route: "/library/stories", defaultPage: false, defaultItems: false },
  { id: "articles", name: "Articles & Reflections", route: "/library/articles", defaultPage: false, defaultItems: false },
  { id: "symbolism", name: "Symbolism & Deities", route: "/library/symbolism", defaultPage: false, defaultItems: false },
  { id: "remedies", name: "Remedies & Mantras", route: "/library/remedies", defaultPage: false, defaultItems: false },
  { id: "science", name: "Hindu Science & Philosophy", route: "/library/science", defaultPage: false, defaultItems: false },
  { id: "pilgrim", name: "Pilgrim Site Guide", route: "/library/pilgrim-guide", defaultPage: false, defaultItems: false },

  // Other collections
  { id: "events", name: "Events", route: "/events", defaultPage: false, defaultItems: false },
  { id: "learn", name: "Learn", route: "/learn", defaultPage: false, defaultItems: false },
  { id: "panchanga", name: "Panchanga", route: "/panchanga", defaultPage: false, defaultItems: false },
  { id: "sevas", name: "Sevas", route: "/sevas", defaultPage: true, defaultItems: true },
  { id: "albums", name: "Albums & Media", route: "/albums", defaultPage: true, defaultItems: true },
  { id: "bhakti", name: "Bhakti Gāna", route: "/library/bhakti", defaultPage: true, defaultItems: true },
  { id: "parampara", name: "Guru Parampara", route: "/story/parampara", defaultPage: true, defaultItems: true },
  { id: "connect", name: "Connect", route: "/connect", defaultPage: true, defaultItems: true },
  { id: "volunteer", name: "Volunteer", route: "/volunteer", defaultPage: true, defaultItems: true },
];

export function parseOverrides(raw: string | null): ContentOverrides {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function isSectionPageEnabled(sectionId: string, defaultPage = false, overrides: ContentOverrides = {}): boolean {
  if (defaultPage) return true;
  return overrides[sectionId]?.page ?? false;
}

export function isSectionItemsEnabled(sectionId: string, defaultItems = false, overrides: ContentOverrides = {}): boolean {
  if (defaultItems) return true;
  if (!isSectionPageEnabled(sectionId, defaultItems, overrides)) {
    return false;
  }
  return overrides[sectionId]?.items ?? false;
}

export function isRouteEnabled(route: string, overrides: ContentOverrides = {}): boolean {
  if (!route || route === "/") return true;
  const cleanRoute = route.split("?")[0].split("#")[0];
  const section = allSectionDefinitions.find((s) => {
    if (s.route === cleanRoute || cleanRoute.startsWith(s.route + "/") || (s.route !== "/" && cleanRoute === s.route)) {
      return true;
    }
    if (s.id === "parampara" && (cleanRoute.startsWith("/history/parampara") || cleanRoute.startsWith("/story/parampara") || cleanRoute.startsWith("/history--parampara"))) {
      return true;
    }
    if (s.route.startsWith("/library/") && (cleanRoute === "/" + s.id || cleanRoute.startsWith("/" + s.id + "/"))) {
      return true;
    }
    return false;
  });
  if (section) {
    if (section.defaultPage) return true;
    return isSectionPageEnabled(section.id, section.defaultPage, overrides);
  }
  return true;
}

const overridesPreference = createPreferenceStore<string>(
  contentOverridesStorageKey,
  "{}",
  (value): value is string => typeof value === "string",
);

export function getStoredContentOverrides(): ContentOverrides {
  if (typeof window === "undefined") return {};
  return parseOverrides(overridesPreference.getSnapshot());
}

export function saveContentOverrides(overrides: ContentOverrides): boolean {
  try {
    overridesPreference.setValue(JSON.stringify(overrides));
    return true;
  } catch {
    return false;
  }
}

export function useContentOverrides() {
  const snapshot = useSyncExternalStore(
    overridesPreference.subscribe,
    overridesPreference.getSnapshot,
    overridesPreference.getServerSnapshot,
  );
  const overrides = useMemo(() => parseOverrides(snapshot), [snapshot]);

  const setOverride = useCallback((sectionId: string, override: Partial<SectionOverride>) => {
    const current = parseOverrides(overridesPreference.getSnapshot());
    const next = {
      ...current,
      [sectionId]: {
        ...current[sectionId],
        ...override,
      },
    };
    overridesPreference.setValue(JSON.stringify(next));
  }, []);

  const resetOverrides = useCallback(() => {
    resetContentOverrides();
  }, []);

  return {
    overrides,
    setOverride,
    resetOverrides,
    isSectionPageEnabled: (id: string, defaultPage = false) => isSectionPageEnabled(id, defaultPage, overrides),
    isSectionItemsEnabled: (id: string, defaultItems = false) => isSectionItemsEnabled(id, defaultItems, overrides),
    isRouteEnabled: (route: string) => isRouteEnabled(route, overrides),
  };
}

export function resetContentOverrides(): boolean {
  try {
    overridesPreference.setValue("{}");
    return true;
  } catch {
    return false;
  }
}
