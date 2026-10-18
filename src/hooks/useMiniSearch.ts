"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { interactionSettings } from "@/gen/settings/ui-elements";
import {
  createSearchIndex,
  loadCompressedIndex,
  searchItems,
  type MiniSearchConfig,
  type SearchIndex,
} from "@/lib/search";

/**
 * Reusable React hook for searching in-memory collections with MiniSearch.
 */
export function useMiniSearch<T extends object>(
  items: T[],
  query: string,
  config: MiniSearchConfig<T>
): T[] {
  const fieldsKey = config.fields.join(",");
  const boostKey = config.boost ? JSON.stringify(config.boost) : "";

  const index = useMemo(() => {
    return createSearchIndex(items, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, fieldsKey, boostKey, config.searchOptions, config.extractField]);

  return useMemo(() => {
    return searchItems(index, query);
  }, [index, query]);
}

/**
 * React hook that lazy-loads a pre-computed, gzip-compressed MiniSearch index.
 * - Defers loading until idle time or user interaction (focus/typing).
 * - Decompresses via native DecompressionStream in the background.
 * - Uses the shared in-memory search while loading, then switches to the pre-computed index.
 */
export function useLazyMiniSearch<T extends object>(
  items: T[],
  query: string,
  loadCompressedIndexModule: () => Promise<string | Record<string, string>>,
  config: MiniSearchConfig<T>
): {
  results: T[];
  isLoaded: boolean;
  ensureLoaded: () => void;
} {
  const [index, setIndex] = useState<SearchIndex<T> | null>(null);
  const loadingRef = useRef(false);

  const ensureLoaded = useCallback(() => {
    if (index || loadingRef.current) return;
    loadingRef.current = true;
    loadCompressedIndexModule()
      .then(async (mod) => {
        const raw = typeof mod === "string" ? mod : Object.values(mod)[0];
        const loaded = await loadCompressedIndex(raw, items, config);
        setIndex(loaded);
      })
      .catch((err) => {
        console.error("Failed to load compressed search index, falling back to in-memory index:", err);
        setIndex(createSearchIndex(items, config));
      });
  }, [items, config, index, loadCompressedIndexModule]);

  // Lazy-load in idle time after component mounts so critical paint is unblocked
  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(ensureLoaded);
      return () => {
        win.cancelIdleCallback?.(handle);
      };
    }
    const timer = setTimeout(ensureLoaded, interactionSettings.searchPreloadDelayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [ensureLoaded]);

  // If user starts typing before idle fired, immediately trigger load
  useEffect(() => {
    if (query.trim()) {
      ensureLoaded();
    }
  }, [query, ensureLoaded]);

  const hasQuery = Boolean(query.trim());
  const pendingIndex = useMemo(() => {
    if (index || !hasQuery) return null;
    return createSearchIndex(items, config);
  }, [items, config, index, hasQuery]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items;
    if (index) {
      return searchItems(index, trimmed);
    }
    return pendingIndex ? searchItems(pendingIndex, trimmed) : items;
  }, [items, query, index, pendingIndex]);

  return {
    results,
    isLoaded: index !== null,
    ensureLoaded,
  };
}
