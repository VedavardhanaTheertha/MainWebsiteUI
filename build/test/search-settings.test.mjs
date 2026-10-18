import { testUiSettings } from "./helpers/ui-settings.mjs";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import test from "node:test";
import vm from "node:vm";
import MiniSearch from "minisearch";
import ts from "typescript";
import { parseSearchSettings, searchSettings } from "../search-config.mjs";

test("search settings defaults preserve existing behavior", async () => {
  const defaults = parseSearchSettings({});
  assert.equal(defaults.prefix, true);
  assert.equal(defaults.fuzzyTolerance, 0.2);
  assert.equal(defaults.fuzzyMinLength, 4);
  assert.equal(defaults.multiwordOrFallback, true);
  assert.deepEqual(defaults.profiles, {
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
  });
  assert.deepEqual(searchSettings, parseSearchSettings(JSON.parse(
    await readFile(new URL("../../settings/search.json", import.meta.url), "utf8"),
  )));
});

test("search settings validate collection profiles and the multiword fallback toggle", () => {
  for (const multiwordOrFallback of [null, 0, 1, "false", [], {}]) {
    assert.throws(() => parseSearchSettings({ multiwordOrFallback }), /multiwordOrFallback/);
  }
  for (const profiles of [null, false, [], "profiles"]) {
    assert.throws(() => parseSearchSettings({ profiles }), /profiles/);
  }
  for (const profiles of [
    { unknown: {} }, { bhakti: { unknown: 1 } }, { sevas: { title: 1 } },
    JSON.parse('{"__proto__":{}}'), { constructor: {} },
    { mediaGrid: JSON.parse('{"__proto__":1}') },
  ]) {
    assert.throws(() => parseSearchSettings({ profiles }), /unknown (profile|field)/);
  }
  for (const profile of Object.keys(parseSearchSettings({}).profiles)) {
    for (const weights of [null, false, [], "weights"]) {
      assert.throws(() => parseSearchSettings({ profiles: { [profile]: weights } }), /field weights/);
    }
    const field = Object.keys(parseSearchSettings({}).profiles[profile])[0];
    for (const weight of [null, false, "2", 0, -1, NaN, Infinity, -Infinity]) {
      assert.throws(() => parseSearchSettings({
        profiles: { [profile]: { [field]: weight } },
      }), /finite positive/);
    }
    for (const weight of [0.01, 1, 100, Number.MAX_VALUE]) {
      assert.equal(parseSearchSettings({
        profiles: { [profile]: { [field]: weight } },
      }).profiles[profile][field], weight);
    }
  }
  const customized = parseSearchSettings({ profiles: { mediaGrid: { detail: 7 } } });
  assert.deepEqual(customized.profiles.mediaGrid, { title: 2, detail: 7 });
  assert.equal(parseSearchSettings({}).profiles.mediaGrid.detail, 1, "defaults cannot be mutated by parsing");
});

test("search settings validate types and numeric bounds", () => {
  for (const value of [null, [], false, "settings"]) {
    assert.throws(() => parseSearchSettings(value), /settings object/);
  }
  for (const prefix of [null, 0, 1, "false"]) {
    assert.throws(() => parseSearchSettings({ prefix }), /prefix/);
  }
  for (const fuzzyTolerance of [null, "0.2", false, -0.01, 1.01, NaN, Infinity, -Infinity]) {
    assert.throws(() => parseSearchSettings({ fuzzyTolerance }), /fuzzyTolerance/);
  }
  for (const fuzzyMinLength of [null, "4", false, 0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseSearchSettings({ fuzzyMinLength }), /fuzzyMinLength/);
  }
  for (const fuzzyTolerance of [0, 1]) {
    assert.equal(parseSearchSettings({ fuzzyTolerance }).fuzzyTolerance, fuzzyTolerance);
  }
  assert.equal(parseSearchSettings({ fuzzyMinLength: 1 }).fuzzyMinLength, 1);
});

async function fixture(t, settings) {
  const root = new URL(`../../.search-settings-fixture-${randomUUID()}/`, import.meta.url);
  t.after(() => rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }));
  await mkdir(new URL("build/", root), { recursive: true });
  await mkdir(new URL("settings/", root));
  await writeFile(new URL("settings/search.json", root), JSON.stringify(settings));
  await writeFile(new URL("build/search-config.mjs", root),
    await readFile(new URL("../search-config.mjs", import.meta.url), "utf8"));
  const build = await import(new URL("build/search-config.mjs", root));
  await writeFile(new URL("settings.mjs", root),
    `export const searchSettings = ${JSON.stringify(build.searchSettings)};`);
  const source = await readFile(new URL("../../src/lib/search.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText.replace("@/gen/settings/search", "./settings.mjs");
  await writeFile(new URL("client.mjs", root), compiled);
  const client = await import(new URL("client.mjs", root));
  return { build, client };
}

for (const settings of [
  {},
  { prefix: false, fuzzyTolerance: 0, fuzzyMinLength: 4 },
  { prefix: false, fuzzyTolerance: 0.3, fuzzyMinLength: 5 },
  { prefix: true, fuzzyTolerance: 0.1, fuzzyMinLength: 1 },
]) {
  test(`build, client-created, and loaded indexes agree: ${JSON.stringify(settings)}`, async (t) => {
    const { build, client } = await fixture(t, settings);
    const items = [{ title: "Architecture temple" }, { title: "Worship daily" }];
    const config = { fields: ["title"] };
    const built = new MiniSearch(build.withSearchDefaults({
      idField: "__search_id", fields: config.fields,
    }));
    built.addAll(items.map((item, __search_id) => ({ ...item, __search_id })));
    const created = client.createSearchIndex(items, config);
    const loaded = await client.loadCompressedIndex(
      gzipSync(JSON.stringify(built)).toString("base64"), items, config,
    );
    for (const query of ["ARCHITECTURE", "chitecture", "chitec", "arhitecture", "temqle", "tem", "daily temple"]) {
      const expected = built.search(query).map(({ id }) => items[id]);
      assert.deepEqual(created.miniSearch.search(query).map(({ id }) => items[id]), expected, query);
      assert.deepEqual(loaded.miniSearch.search(query).map(({ id }) => items[id]), expected, query);
      assert.deepEqual(client.searchItems(created, query), client.searchItems(loaded, query), query);
    }

    for (const profile of Object.keys(parseSearchSettings({}).profiles)) {
      await t.test(`configured ${profile} weights agree for build, created, loaded, and lazy indexes`, async (t) => {
        const defaults = parseSearchSettings({}).profiles[profile];
        const fields = Object.keys(defaults);
        const first = fields[0];
        const second = fields[1] ?? first;
        const weights = { [first]: 0.1, [second]: 20 };
        const { build, client } = await fixture(t, { profiles: { [profile]: weights } });
        const config = client.getSearchProfile(profile);
        assert.deepEqual(config, build.getSearchProfile(profile));
        assert.deepEqual(config.fields, fields, "profile field order remains compatible with serialized indexes");
        const items = [
          { ...Object.fromEntries(fields.map((field) => [field, ""])), [first]: "needle" },
          { ...Object.fromEntries(fields.map((field) => [field, ""])), [second]: "needle" },
        ];
        const built = new MiniSearch(build.withSearchDefaults({
          idField: "__search_id", ...build.getSearchProfile(profile),
          searchOptions: { boost: build.getSearchProfile(profile).boost },
        }));
        const original = new MiniSearch(build.withSearchDefaults({
          idField: "__search_id", fields, searchOptions: { boost: defaults },
        }));
        const docs = items.map((item, __search_id) => ({ ...item, __search_id }));
        built.addAll(docs);
        original.addAll(docs);
        const created = client.createSearchIndex(items, config);
        const loaded = await client.loadCompressedIndex(
          gzipSync(JSON.stringify(original)).toString("base64"), items, config,
        );
        const expected = built.search("needle").map(({ id }) => items[id]);
        assert.deepEqual(client.searchItems(created, "needle"), expected);
        assert.deepEqual(client.searchItems(loaded, "needle"), expected,
          "loaded indexes use current profile weights rather than weights used when serialized");
        if (first !== second) {
          assert.equal(expected[0], items[1], "custom weights change ranking");
          assert.equal(original.search("needle")[0].id, 0, "default weights retain original ranking");
        }
        const lazy = await lazyHook(client);
        assert.deepEqual(lazy.render(items, "needle", config).results, expected);
        lazy.setIndex(loaded);
        assert.deepEqual(lazy.render(items, "needle", config).results, expected);
      });
    }

    for (const multiwordOrFallback of [true, false]) {
      await t.test(`multiword OR fallback ${multiwordOrFallback} applies to loaded, created, and lazy searches`, async (t) => {
        const { build, client } = await fixture(t, {
          prefix: false, fuzzyTolerance: 0, multiwordOrFallback,
        });
        const items = [{ title: "alpha", detail: "beta" }, { title: "gamma", detail: "delta" }];
        const config = client.getSearchProfile("mediaGrid");
        const built = new MiniSearch(build.withSearchDefaults({
          idField: "__search_id", fields: config.fields,
          searchOptions: { boost: build.getSearchProfile("mediaGrid").boost },
        }));
        built.addAll(items.map((item, __search_id) => ({ ...item, __search_id })));
        const created = client.createSearchIndex(items, config);
        const loaded = await client.loadCompressedIndex(gzipSync(JSON.stringify(built)).toString("base64"), items, config);
        const expected = multiwordOrFallback ? items : [];
        for (const index of [created, loaded]) {
          assert.deepEqual(client.searchItems(index, "alpha gamma"), expected);
          assert.deepEqual(client.searchItems(index, "alpha beta"), [items[0]], "AND remains primary");
          assert.deepEqual(client.searchItems(index, "alpha gamma", { combineWith: "OR" }), items);
        }
        const lazy = await lazyHook(client);
        assert.deepEqual(lazy.render(items, "alpha gamma", config).results, expected);
        lazy.setIndex(loaded);
        assert.deepEqual(lazy.render(items, "alpha gamma", config).results, expected);
      });
    }
    assert.equal(built.search("daily temple").length, 0, "default combination remains AND");
    assert.ok(built.search("chitecture").length, "suffix expansion remains enabled");
    assert.deepEqual(client.searchItems(created, "  "), items);
    const effective = build.searchSettings;
    for (const term of ["abc", "abcd", "abcde", "😀😀😀", "😀😀😀😀"]) {
      const expected = effective.fuzzyTolerance > 0 &&
        Array.from(term).length >= effective.fuzzyMinLength ? effective.fuzzyTolerance : false;
      assert.equal(build.fuzzySearchTerm(term), expected);
      assert.equal(client.fuzzySearchTerm(term), expected);
    }
    if (!effective.prefix && !effective.fuzzyTolerance) {
      assert.equal(built.search("chitec").length, 0, "prefix can be disabled");
      assert.equal(built.search("arhitecture").length, 0, "fuzzy can be disabled");
      assert.deepEqual(client.searchItems(created, "chitec missing"), [],
        "OR fallback does not silently re-enable prefix");
      assert.deepEqual(client.searchItems(created, "arhitecture missing"), [],
        "OR fallback does not silently re-enable fuzzy");
    }
    assert.equal(created.miniSearch.search("architecture daily").length, 0);
    assert.equal(client.searchItems(created, "architecture daily").length, 2,
      "existing multiword OR fallback remains available");
  });
}

test("per-index and per-query matching overrides survive the OR fallback", async (t) => {
  const { client } = await fixture(t, { prefix: true, fuzzyTolerance: 0.2 });
  const items = [{ title: "Architecture temple" }];
  const index = client.createSearchIndex(items, {
    fields: ["title"], searchOptions: { prefix: false, fuzzy: false },
  });
  assert.deepEqual(client.searchItems(index, "chitec missing"), []);
  assert.deepEqual(client.searchItems(index, "arhitecture missing"), []);
  assert.deepEqual(client.searchItems(index, "chitec missing", { prefix: true }), items);
  assert.deepEqual(client.searchItems(index, "arhitecture missing", { fuzzy: 0.2 }), items);
});

async function lazyHook(client) {
  let index = null;
  let memoIndex = 0;
  let creations = 0;
  const memos = [];
  const exports = {};
  const source = await readFile(new URL("../../src/hooks/useMiniSearch.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      if (name === "@/lib/search") return {
        ...client,
        createSearchIndex: (...args) => {
          creations++;
          return client.createSearchIndex(...args);
        },
      };
      if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ ...testUiSettings, ...({
        interactionSettings: { searchPreloadDelayMs: 300 },
      }) }) };
      if (name === "@/gen/settings/ui-elements") return {
        interactionSettings: { searchPreloadDelayMs: 300 },
      };
      if (name === "react") return {
        useState: () => [index, (value) => { index = value; }],
        useRef: () => ({ current: false }),
        useCallback: (callback) => callback,
        useEffect: () => {},
        useMemo: (calculate, dependencies) => {
          const slot = memoIndex++;
          const previous = memos[slot];
          if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
            memos[slot] = { dependencies, value: calculate() };
          }
          return memos[slot].value;
        },
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return {
    render: (items, query, config) => {
      memoIndex = 0;
      return exports.useLazyMiniSearch(items, query, () => new Promise(() => {}), config);
    },
    setIndex: (value, items, config) => { index = { index: value, items, config }; },
    get creations() { return creations; },
  };
}

for (const settings of [
  { prefix: true, fuzzyTolerance: 0.2, fuzzyMinLength: 4 },
  { prefix: false, fuzzyTolerance: 0, fuzzyMinLength: 4 },
]) {
  test(`lazy pending search honors shared settings without eager indexing: ${JSON.stringify(settings)}`, async (t) => {
    const { client } = await fixture(t, settings);
    const hook = await lazyHook(client);
    const items = [
      { title: "Architecture", description: "Temple" },
      { title: "Daily", description: "Worship" },
    ];
    const config = {
      fields: ["title", "description", "derived"],
      extractField: (item, field) => field === "derived" ? "custom" : item[field],
    };
    assert.deepEqual(hook.render(items, "  ", config).results, items);
    assert.equal(hook.creations, 0, "empty query does not create an index");
    const expectedIndex = client.createSearchIndex(items, config);
    for (const query of ["chitec", "arhitecture", "architecture temple", "custom"]) {
      const result = hook.render(items, query, config);
      assert.deepEqual(result.results, client.searchItems(expectedIndex, query), query);
      assert.equal(result.isLoaded, false);
    }
    assert.equal(hook.creations, 1, "pending queries reuse the same in-memory index");
    hook.setIndex(expectedIndex, items, config);
    assert.deepEqual(hook.render(items, "arhitecture", config).results,
      client.searchItems(expectedIndex, "arhitecture"));
    assert.equal(hook.creations, 1, "loaded index does not trigger a fallback build");
    const loadedHook = await lazyHook(client);
    loadedHook.setIndex(expectedIndex, items, config);
    assert.equal(loadedHook.render(items, "architecture", config).isLoaded, true);
    assert.equal(loadedHook.creations, 0, "already-loaded hook never builds the pending index");
  });
}
