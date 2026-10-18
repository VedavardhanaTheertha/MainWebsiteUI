import assert from "node:assert/strict";
import test from "node:test";
import { resolveFooterLinks } from "../footer-links.mjs";

test("footer links use stable connection IDs without changing copy or layout data", () => {
  const content = { footer: { social: [{ label: "translated label", connectId: "official", href: "#" }] } };
  const result = resolveFooterLinks(content, [{ id: "official", url: "https://example.com/channel" }], "language.json");
  assert.equal(result.footer.social[0].href, "https://example.com/channel");
  assert.equal(result.footer.social[0].label, "translated label");
  assert.equal(content.footer.social[0].href, "#", "does not mutate source content");
});

test("missing and unsafe footer records fail explicitly", () => {
  const content = { footer: { social: [{ connectId: "official" }] } };
  assert.throws(() => resolveFooterLinks(content, [], "language.json"), /unknown connectId/);
  for (const url of ["http://example.com", "https://user:secret@example.com"]) {
    assert.throws(() => resolveFooterLinks(content, [{ id: "official", url }], "language.json"), /HTTPS/);
  }
});
