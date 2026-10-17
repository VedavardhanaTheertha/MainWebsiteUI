import { readFileSync } from "node:fs";

const defaultProfiles = {
  bhakti: {
    title: 3, titleKn: 3, titleEn: 3, kruti: 1.5, krutiKn: 1.5,
    ankita: 2, ankitaKn: 2, searchText: 1,
  },
  sevas: { searchText: 1 },
  events: {
    titleEn: 3, titleKn: 3, categoriesText: 2, locationEn: 1.5,
    locationKn: 1.5, performersText: 1.8, tagsText: 1.2, searchText: 1,
  },
  knowledge: { title: 3, summary: 1.5, status: 1, tags: 2, searchText: 1 },
  mediaAlbums: { title: 3, description: 1, tags: 2 },
  mediaGrid: { title: 2, detail: 1 },
};

export function getSearchProfile(profile) {
  if (!Object.hasOwn(searchSettings.profiles, profile)) {
    throw new Error(`Unknown search profile: ${profile}`);
  }
  const boost = searchSettings.profiles[profile];
  return { fields: Object.keys(boost), boost };
}

export function normalizeSearchTerm(term) {
  return term.toLocaleLowerCase();
}

export function expandSearchTerm(term) {
  const characters = Array.from(normalizeSearchTerm(term));
  return characters.map((_, index) => characters.slice(index).join(""));
}

export function fuzzySearchTerm(term) {
  return searchSettings.fuzzyTolerance > 0 &&
    Array.from(term).length >= searchSettings.fuzzyMinLength
    ? searchSettings.fuzzyTolerance
    : false;
}

export function withSearchDefaults(options) {
  return {
    ...options,
    processTerm: expandSearchTerm,
    searchOptions: {
      prefix: searchSettings.prefix,
      fuzzy: fuzzySearchTerm,
      combineWith: "AND",
      processTerm: normalizeSearchTerm,
      ...options.searchOptions,
    },
  };
}
export function parseSearchSettings(parsed) {
  const source = "settings/search.json";
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${source} must define a settings object.`);
  }
  const {
    prefix = true,
    fuzzyTolerance = 0.2,
    fuzzyMinLength = 4,
    multiwordOrFallback = true,
    profiles = {},
  } = parsed;
  if (typeof prefix !== "boolean") {
    throw new Error(`${source} prefix must be a boolean.`);
  }
  if (!Number.isFinite(fuzzyTolerance) || fuzzyTolerance < 0 || fuzzyTolerance > 1) {
    throw new Error(`${source} fuzzyTolerance must be a finite number between 0 and 1.`);
  }
  if (!Number.isSafeInteger(fuzzyMinLength) || fuzzyMinLength < 1) {
    throw new Error(`${source} fuzzyMinLength must be a positive integer.`);
  }
  if (typeof multiwordOrFallback !== "boolean") {
    throw new Error(`${source} multiwordOrFallback must be a boolean.`);
  }
  if (!profiles || typeof profiles !== "object" || Array.isArray(profiles)) {
    throw new Error(`${source} profiles must be an object.`);
  }
  for (const [profile, weights] of Object.entries(profiles)) {
    if (!Object.hasOwn(defaultProfiles, profile)) {
      throw new Error(`${source} has unknown profile: ${profile}.`);
    }
    if (!weights || typeof weights !== "object" || Array.isArray(weights)) {
      throw new Error(`${source} profiles.${profile} must be a field weights object.`);
    }
    for (const [field, weight] of Object.entries(weights)) {
      if (!Object.hasOwn(defaultProfiles[profile], field)) {
        throw new Error(`${source} profiles.${profile} has unknown field: ${field}.`);
      }
      if (!Number.isFinite(weight) || weight <= 0) {
        throw new Error(`${source} profiles.${profile}.${field} must be a finite positive number.`);
      }
    }
  }
  return {
    prefix, fuzzyTolerance, fuzzyMinLength, multiwordOrFallback,
    profiles: Object.fromEntries(Object.entries(defaultProfiles).map(([profile, defaults]) =>
      [profile, { ...defaults, ...profiles[profile] }],
    )),
  };
}

export const searchSettings = parseSearchSettings(
  JSON.parse(readFileSync(new URL("../settings/search.json", import.meta.url), "utf8")),
);
