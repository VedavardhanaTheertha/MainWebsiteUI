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
  const [loaded, setLoaded] = useState<{
    items: T[];
    config: MiniSearchConfig<T>;
    index: SearchIndex<T>;
  } | null>(null);
  const index = loaded?.items === items && loaded.config === config ? loaded.index : null;
  const loadingRef = useRef<{ items: T[]; config: MiniSearchConfig<T> } | null>(null);

  const ensureLoaded = useCallback(() => {
    if (index || loadingRef.current?.items === items && loadingRef.current.config === config) return;
    const request = { items, config };
    loadingRef.current = request;
    const finish = (next: SearchIndex<T>) => {
      if (loadingRef.current !== request) return;
      loadingRef.current = null;
      setLoaded({ items, config, index: next });
    };
    loadCompressedIndexModule()
      .then(async (mod) => {
        const raw = typeof mod === "string" ? mod : Object.values(mod)[0];
        const next = await loadCompressedIndex(raw, items, config);
        finish(next);
      })
      .catch((err) => {
        if (loadingRef.current !== request) return;
        console.error("Failed to load compressed search index, falling back to in-memory index:", err);
        finish(createSearchIndex(items, config));
      });
  }, [items, config, index, loadCompressedIndexModule]);

  useEffect(() => {
    return () => { loadingRef.current = null; };
  }, [items, config, loadCompressedIndexModule]);

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
