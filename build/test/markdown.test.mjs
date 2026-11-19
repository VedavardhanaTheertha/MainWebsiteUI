import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../markdown.mjs";

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

test("renders markdown images conforming to image policy with lazy loading", () => {
  const allowedRemote = renderMarkdown(
    `![Gopichandana Dharana](https://pub-80e0aeff507a41da90321eb9ff4616c7.r2.dev/library/gopichandana-dharana.webp "Gopichandana")`,
  );
  assert.match(allowedRemote, /<img\b[^>]*\bsrc="https:\/\/pub-80e0aeff507a41da90321eb9ff4616c7\.r2\.dev\/library\/gopichandana-dharana\.webp"/);
  assert.match(allowedRemote, /alt="Gopichandana Dharana"/);
  assert.match(allowedRemote, /title="Gopichandana"/);
  assert.match(allowedRemote, /loading="lazy"/);
  assert.match(allowedRemote, /decoding="async"/);

  const allowedLocal = renderMarkdown(`![Local Icon](/icons/lotus.png)`);
  assert.match(allowedLocal, /<img\b[^>]*\bsrc="\/icons\/lotus\.png"/);
  assert.match(allowedLocal, /loading="lazy"/);
});

test("discards markdown images that violate image policy or have dangerous protocols", () => {
  const unauthorizedHost = renderMarkdown(`![Unauthorized](https://unauthorized-domain.com/pic.png)`);
  assert.doesNotMatch(unauthorizedHost, /<img\b/iu);

  const disallowedScheme = renderMarkdown(`![HTTP](http://pub-80e0aeff507a41da90321eb9ff4616c7.r2.dev/library/pic.png)`);
  assert.doesNotMatch(disallowedScheme, /<img\b/iu);

  const xssProtocol = renderMarkdown(`![XSS](javascript:alert(1))`);
  assert.doesNotMatch(xssProtocol, /<img\b/iu);

  const rawImg = renderMarkdown(`<img src="https://pub-80e0aeff507a41da90321eb9ff4616c7.r2.dev/library/pic.png">`);
  // Markdown parser has html: false, so raw html is escaped
  assert.doesNotMatch(rawImg, /<img\b/iu);
});

test("renders markdown tables with standard structure", () => {
  const table = renderMarkdown(
    `| Col 1 | Col 2 |\n|---|---|\n| Val 1 | Val 2 |`,
  );
  assert.match(table, /<table>/);
  assert.match(table, /<thead>/);
  assert.match(table, /<th>Col 1<\/th>/);
  assert.match(table, /<tbody>/);
  assert.match(table, /<td>Val 1<\/td>/);
});

test("renders markdown footnotes with safe navigation ids", () => {
  const output = renderMarkdown(`Statement[^1]\n\n[^1]: Footnote body`);
  assert.match(output, /<sup class="footnote-ref"><a href="#fn1" id="fnref1">/);
  assert.match(output, /<section class="footnotes">/);
  assert.match(output, /<li id="fn1" class="footnote-item">/);
});

test("renders task checklists strictly read-only and disabled", () => {
  const output = renderMarkdown(`- [ ] Pending task\n- [x] Done task`);
  assert.match(output, /<input type="checkbox" disabled class="task-list-item-checkbox" \/>/);
  assert.match(output, /<input type="checkbox" disabled checked class="task-list-item-checkbox" \/>/);
  assert.doesNotMatch(output, /<input(?![^>]*\bdisabled\b)/);
});


