import assert from "node:assert/strict";
import test from "node:test";
import { getParentPath, isHomePage } from "../../src/lib/back-navigation.ts";

test("isHomePage identifies home page with and without basePath", () => {
  assert.equal(isHomePage("/"), true);
  assert.equal(isHomePage(""), true);
  assert.equal(isHomePage("/MainWebsiteUI", "/MainWebsiteUI"), true);
  assert.equal(isHomePage("/MainWebsiteUI/", "/MainWebsiteUI"), true);
  assert.equal(isHomePage("/events"), false);
  assert.equal(isHomePage("/events", "/MainWebsiteUI"), false);
  assert.equal(isHomePage("/library/mantra"), false);
});

test("getParentPath calculates correct parent for app and generated routes", () => {
  // Top-level app routes fall back to home (/)
  assert.equal(getParentPath("/events"), "/");
  assert.equal(getParentPath("/sevas"), "/");
  assert.equal(getParentPath("/albums"), "/");
  assert.equal(getParentPath("/learn"), "/");
  assert.equal(getParentPath("/library"), "/");
  assert.equal(getParentPath("/projects"), "/");
  assert.equal(getParentPath("/story"), "/");
  assert.equal(getParentPath("/panchanga"), "/");
  assert.equal(getParentPath("/connect"), "/");
  assert.equal(getParentPath("/volunteer"), "/");
  assert.equal(getParentPath("/privacy"), "/");
  assert.equal(getParentPath("/terms"), "/");
  assert.equal(getParentPath("/refund"), "/");
  assert.equal(getParentPath("/developer-options"), "/");

  // Sub-routes and generated pages fall back to their parent section
  assert.equal(getParentPath("/events/mantra-yajna"), "/events");
  assert.equal(getParentPath("/albums/daily-worship"), "/albums");
  assert.equal(getParentPath("/learn/vedic-recitation"), "/learn");
  assert.equal(getParentPath("/projects/annadana-hall-construction"), "/projects");
  assert.equal(getParentPath("/library/bhakti"), "/library");
  assert.equal(getParentPath("/library/mantra"), "/library");
  assert.equal(getParentPath("/library/mantra/dvadasha-stotra"), "/library/mantra");

  // History routes map to /story hub
  assert.equal(getParentPath("/history/parampara"), "/story");
  assert.equal(getParentPath("/history/stories"), "/story");
  assert.equal(getParentPath("/history/articles"), "/story");
  assert.equal(getParentPath("/history/symbolism"), "/story");

  // History detail pages map to their specific history section
  assert.equal(getParentPath("/history/parampara/madhwacharyaru"), "/history/parampara");
  assert.equal(getParentPath("/history/stories/annadana-as-sadhana"), "/history/stories");

  // Normalization with trailing slash
  assert.equal(getParentPath("/events/"), "/");
  assert.equal(getParentPath("/library/mantra/"), "/library");
  assert.equal(getParentPath("/"), "/");
});

