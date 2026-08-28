import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { canonicalForRoute, routeForHtml } from "./canonical-utils.mjs";

const outDir = path.resolve("out");

test("routeForHtml maps exported files to public routes", () => {
  assert.equal(routeForHtml(outDir, path.join(outDir, "index.html")), "/");
  assert.equal(routeForHtml(outDir, path.join(outDir, "about.html")), "/about");
  assert.equal(
    routeForHtml(outDir, path.join(outDir, "blog", "article.html")),
    "/blog/article",
  );
  assert.equal(routeForHtml(outDir, path.join(outDir, "404.html")), null);
  assert.equal(routeForHtml(outDir, path.join(outDir, "_not-found.html")), null);
});

test("canonicalForRoute creates normalized production URLs", () => {
  assert.equal(canonicalForRoute("https://example.com", "/"), "https://example.com/");
  assert.equal(
    canonicalForRoute("https://example.com/", "/blog/article"),
    "https://example.com/blog/article",
  );
});
