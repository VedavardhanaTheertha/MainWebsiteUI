import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";
import { loadRemedyCarouselCandidates } from "../home-carousels.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const language = yaml.load(readFileSync(new URL("../../config/site.yml", import.meta.url), "utf8")).site.default_language;
const first = { id: "first", title: "First", summary: "Summary", status: "Unreviewed fixture", tags: [], image: "/fixture.png", knowledge: { project: { status: "in-progress" } } };
const second = { ...first, id: "second", title: "Second", status: "Temporary fixture" };
const section = { id: "projects", route: "/projects", items: [first, second], featuredItemIds: ["first"] };

function render(file, props, tr) {
  const jsx = (type, attributes) => typeof type === "function" ? type(attributes) : { type, props: attributes };
  const dependencies = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    react: { useDeferredValue: (value) => value, useMemo: (fn) => fn(), useState: (initial) => [initial, () => {}] },
    "next/link": { default: "link" }, "next/image": { default: "image" },
    "lucide-react": { Search: "search", X: "close" },
    "@/context/LanguageContext": { useLang: () => ({ lang: language, contentMode: "real", tr }) },
    "@/hooks/useAutoScrollRail": { useAutoScrollRail: () => ({ current: null }) },
    "@/hooks/useDialog": { useDialog: () => ({ current: null }) },
    "@/hooks/useMiniSearch": { useMiniSearch: (items) => items },
    "@/lib/search": { getSearchProfile: () => ({}) },
    "@/components/RailMotionControl": { default: "motion-control" },
    "@/gen/library/data": { placeholderLibrarySections: [section], realLibrarySections: [section] },
    "@/gen/settings/ui-elements": { collectionPagination: { initialVisible: 10 } },
    "@/lib/knowledge": {
      articleHref: (collection, id) => `${collection.route}/${id}`,
      localizeArticle: (article) => article,
      relatedArticles: () => [second],
      knowledgeReadingTime: () => undefined,
      knowledgeText: (value) => value[language],
    },
    "./KnowledgeBody": { default: "knowledge-body" },
  };
  const sharedModules = {
    "@/components/presentation/CollectionEmptyState": "components/presentation/CollectionEmptyState.tsx",
    "@/lib/collection-presentation": "lib/collection-presentation.ts",
  };
  function compile(sourceFile) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(new URL(`../../src/${sourceFile}`, import.meta.url), "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, { exports, require: (name) => {
      if (Object.hasOwn(sharedModules, name)) return compile(sharedModules[name]);
      assert.ok(name in dependencies, `Unexpected dependency ${name}`);
      return dependencies[name];
    } });
    return exports;
  }
  return compile(file).default(props);
}

function text(tree) {
  if (typeof tree === "string") return tree;
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  return tree && typeof tree === "object" ? text(tree.props?.children) : "";
}

test("project collection preserves editorial status alongside operational status", () => {
  const tr = {
    library_browser: { detail_labels: { "in-progress": "In progress" }, showing_template: "{shown}/{total}" },
    library_sections: { projects: {} },
  };
  const output = text(render("components/library/LibrarySectionBrowser.tsx", { sectionId: "projects" }, tr));
  assert.ok(output.includes("In progress"));
  assert.ok(output.includes(first.status));
  assert.ok(output.includes(second.status));
});

test("article details and related links display their own authored statuses", () => {
  const output = text(render("components/library/KnowledgeArticlePage.tsx", { sectionId: "projects", articleId: "first" }, { library_browser: {} }));
  assert.ok(output.includes(first.status));
  assert.ok(output.includes(second.status));
});

test("homepage remedy cards expose the real authored editorial status", () => {
  const items = loadRemedyCarouselCandidates(root, language, language);
  const output = text(render("components/home/HomePageGrid.tsx", { items }, {}));
  for (const item of items) {
    assert.ok(item.footnote);
    assert.ok(output.includes(item.footnote));
  }
});

test("Panchanga renders its localized testing notice before sample information", () => {
  const tr = loadAuthoredLanguage(root, language);
  const output = text(render("components/PanchangaPage.tsx", {}, tr));
  const notice = tr.pages.local_copy.panchanga_notice;
  assert.ok(notice);
  assert.ok(output.includes(notice));
  assert.ok(output.indexOf(notice) < output.indexOf(tr.pages.local_copy.panchanga_title));
});
