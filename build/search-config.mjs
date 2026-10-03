export function normalizeSearchTerm(term) {
  return term.toLocaleLowerCase();
}

export function expandSearchTerm(term) {
  const characters = Array.from(normalizeSearchTerm(term));
  return characters.map((_, index) => characters.slice(index).join(""));
}

export function fuzzySearchTerm(term) {
  return Array.from(term).length > 3 ? 0.2 : false;
}

export function withSearchDefaults(options) {
  return {
    ...options,
    processTerm: expandSearchTerm,
    searchOptions: {
      prefix: true,
      fuzzy: fuzzySearchTerm,
      combineWith: "AND",
      processTerm: normalizeSearchTerm,
      ...options.searchOptions,
    },
  };
}
