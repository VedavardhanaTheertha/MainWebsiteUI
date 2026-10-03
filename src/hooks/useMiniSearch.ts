"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
 * - Provides optimistic search while loading, then smoothly switches to full ranked MiniSearch results.
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
    const timer = setTimeout(ensureLoaded, 300);
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

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items;
    if (index) {
      return searchItems(index, trimmed);
    }
    // Optimistic fallback while index chunk is loading
    const q = trimmed.toLowerCase();
    return items.filter((item) => {
      for (const field of config.fields) {
        const val = (item as Record<string, unknown>)[field];
        if (typeof val === "string" && val.toLowerCase().includes(q)) return true;
        if (Array.isArray(val) && val.some((v) => typeof v === "string" && v.toLowerCase().includes(q))) return true;
      }
      return false;
    });
  }, [items, query, index, config.fields]);

  return {
    results,
    isLoaded: index !== null,
    ensureLoaded,
  };
}
