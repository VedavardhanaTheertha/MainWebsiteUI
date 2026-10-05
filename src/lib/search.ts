import MiniSearch, { type SearchOptions } from "minisearch";

export interface MiniSearchConfig<T> {
  fields: (keyof T & string)[] | string[];
  boost?: Partial<Record<keyof T & string, number>> | Record<string, number>;
  searchOptions?: SearchOptions;
  extractField?: (document: T, fieldName: string) => string;
}

export interface SearchIndex<T> {
  miniSearch: MiniSearch<T & { __search_id: number }>;
  items: T[];
  config: MiniSearchConfig<T>;
}

export function normalizeSearchTerm(term: string): string {
  return term.toLocaleLowerCase();
}

export function expandSearchTerm(term: string): string[] {
  const characters = Array.from(normalizeSearchTerm(term));
  return characters.map((_, index) => characters.slice(index).join(""));
}

export function fuzzySearchTerm(term: string): number | false {
  return Array.from(term).length > 3 ? 0.2 : false;
}

/**
 * Creates an in-memory MiniSearch index for arbitrary collections.
 * Uses a synthetic `__search_id` index mapping to ensure safety against missing or duplicate IDs.
 */
export function createSearchIndex<T extends object>(
  items: T[],
  config: MiniSearchConfig<T>
): SearchIndex<T> {
  const docs = items.map((item, index) => ({
    ...item,
    __search_id: index,
  }));

  const miniSearch = new MiniSearch<T & { __search_id: number }>({
    idField: "__search_id",
    fields: config.fields as string[],
    processTerm: expandSearchTerm,
    extractField: (document, fieldName) => {
      if (config.extractField) {
        return config.extractField(document as unknown as T, fieldName);
      }
      const val = (document as Record<string, unknown>)[fieldName];
      if (Array.isArray(val)) {
        return val.join(" ");
      }
      return val != null ? String(val) : "";
    },
    searchOptions: {
      boost: config.boost as Record<string, number> | undefined,
      prefix: true,
      fuzzy: fuzzySearchTerm,
      combineWith: "AND",
      processTerm: normalizeSearchTerm,
      ...config.searchOptions,
    },
  });

  miniSearch.addAll(docs);

  return {
    miniSearch,
    items,
    config,
  };
}

/**
 * Executes a full-text search against the given MiniSearch index.
 * If query is empty or only whitespace, returns original items.
 * Falls back to OR combination if an AND search on multiple words yields zero hits.
 */
export function searchItems<T extends object>(
  index: SearchIndex<T>,
  query: string,
  overrideOptions?: SearchOptions
): T[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return index.items;
  }

  const options: SearchOptions = {
    ...index.config.searchOptions,
    ...overrideOptions,
  };

  // 1. Primary search with AND combination, prefix matching, and fuzzy matching
  let results = index.miniSearch.search(trimmed, options);

  // 2. Fallback to OR combination if multiple terms yielded zero results
  if (results.length === 0 && /\s+/.test(trimmed)) {
    results = index.miniSearch.search(trimmed, {
      ...options,
      combineWith: "OR",
      prefix: true,
      fuzzy: fuzzySearchTerm,
      processTerm: normalizeSearchTerm,
    });
  }

  return results.map((r) => index.items[r.id as number]);
}

/**
 * Decompresses a base64-encoded gzipped JSON string in the browser using native DecompressionStream.
 */
export async function decompressSearchIndex(base64Gzip: string): Promise<string> {
  if (typeof DecompressionStream !== "undefined") {
    const binaryString = atob(base64Gzip);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const stream = new Response(bytes).body!.pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }
  throw new Error("DecompressionStream is not supported in this environment");
}

/**
 * Deserializes a pre-built, compressed MiniSearch index.
 */
export async function loadCompressedIndex<T extends object>(
  base64Gzip: string,
  items: T[],
  config: MiniSearchConfig<T>
): Promise<SearchIndex<T>> {
  const json = await decompressSearchIndex(base64Gzip);
  const miniSearch = MiniSearch.loadJSON<T & { __search_id: number }>(json, {
    fields: config.fields as string[],
    idField: "__search_id",
    processTerm: expandSearchTerm,
    searchOptions: {
      boost: config.boost as Record<string, number> | undefined,
      prefix: true,
      fuzzy: fuzzySearchTerm,
      combineWith: "AND",
      processTerm: normalizeSearchTerm,
      ...config.searchOptions,
    },
  });

  return {
    miniSearch,
    items,
    config,
  };
}
