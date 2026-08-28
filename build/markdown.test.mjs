import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "./markdown.mjs";

test("renders ordinary Markdown and escapes quoted text", () => {
  const html = renderMarkdown(`# Heading\n\nA **bold** “quote” & <word>.`);
  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.doesNotMatch(html, /<word>/);
});

test("does not execute or preserve raw HTML", () => {
  const html = renderMarkdown(`<script>alert(1)</script><img src=x onerror=alert(1)>`);
  assert.doesNotMatch(html, /<(?:script|img)\b/iu);
  assert.match(html, /&lt;script&gt;/);
});

test("removes dangerous and encoded link protocols", () => {
  const payloads = [
    "[x](javascript:alert(1))",
    "[x](JaVaScRiPt:alert(1))",
    "[x](javascript&#58;alert(1))",
    "[x](jav%61script:alert(1))",
    "[x](data:text/html,<script>alert(1)</script>)",
    "[x](//example.invalid/path)",
  ];
  for (const payload of payloads) {
    const html = renderMarkdown(payload);
    assert.doesNotMatch(html, /<a\b[^>]*\bhref\s*=/iu, payload);
    assert.doesNotMatch(html, /<script\b/iu, payload);
  }
});

test("keeps allowlisted absolute, mail, and relative links", () => {
  const html = renderMarkdown(
    `[https](https://example.com/?q=&quot;x&quot;) [mail](mailto:test@example.com) [local](/about)`,
  );
  assert.match(html, /href="https:\/\/example\.com\//);
  assert.match(html, /href="mailto:test@example\.com"/);
  assert.match(html, /href="\/about"/);
});

test("handles malformed Markdown without emitting unsafe attributes", () => {
  const html = renderMarkdown(`[broken](javascript:alert(1) "title)\n\n<a href=javascript:alert(1)>x`);
  assert.doesNotMatch(html, /<a\b[^>]*\bhref\s*=\s*["']?javascript/iu);
});