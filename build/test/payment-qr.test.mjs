import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { generatePaymentQr } from "../payment-qr.mjs";
import { validateProgressSnapshot } from "../editorial-content.mjs";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";

test("build-time payment QR decodes to the exact configured URL including all query parameters", async () => {
  const settings = JSON.parse(readFileSync(new URL("../../settings/public_actions.json", import.meta.url), "utf8"));
  const destination = settings.payment.url;
  const image = await generatePaymentQr(destination);
  const png = PNG.sync.read(Buffer.from(image.split(",")[1], "base64"));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.ok(decoded);
  assert.equal(decoded.data, destination);
  assert.equal(decoded.data, "https://pay.shiroormatha.org/?entity_id=3&event_id=4&seva_id=3");
  await assert.rejects(generatePaymentQr("http://example.org"), /HTTPS/);
});

test("Yajna progress uses the explicitly authored shared date and rejects invalid or missing snapshots", () => {
  const source = readFileSync(new URL("../../library/announcement/krishna-mantra-lekhana-yajna.md", import.meta.url), "utf8");
  const { metadata } = parseMarkdownFrontmatter(source, "announcement");
  const fields = metadata.fields;
  validateProgressSnapshot(fields, "announcement");
  assert.deepEqual(Object.values(fields["pages.local_copy.yajna_as_of_date"]), ["2026-07-01", "2026-07-01"]);
  const without = structuredClone(fields);
  delete without["pages.local_copy.yajna_as_of_date"];
  assert.throws(() => validateProgressSnapshot(without, "announcement"), /as-of date/);
  for (const value of ["2026-02-30", "today", "2026-1-01"]) {
    const bad = structuredClone(fields);
    for (const code of Object.keys(bad["pages.local_copy.yajna_as_of_date"])) bad["pages.local_copy.yajna_as_of_date"][code] = value;
    assert.throws(() => validateProgressSnapshot(bad, "announcement"), /valid quoted/);
  }
});
