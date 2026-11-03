import assert from "node:assert/strict";
import test from "node:test";
import { resolveImageUrl } from "../image-resolution.mjs";

test("image resolution preserves media-directory prefixes and absolute HTTPS targets", () => {
  assert.equal(resolveImageUrl("/chakra.png", "https://media.example/images"), "https://media.example/images/chakra.png");
  assert.equal(resolveImageUrl("chakra.png", "https://media.example/images/"), "https://media.example/images/chakra.png");
  assert.equal(resolveImageUrl("https://assets.example/photo.jpg", "https://media.example/images"), "https://assets.example/photo.jpg");
  assert.equal(resolveImageUrl("/local.png"), "/local.png");
});

test("image resolution rejects malformed, unsafe and non-HTTPS targets", () => {
  for (const target of ["", "//evil.example/a.jpg", "http://example.com/a.jpg", "data:image/png;base64,a", "javascript:alert(1)", "/../secret", "/%2e%2e/secret", "/a\\b", "https://name:secret@example.com/a.jpg", "https://example.com bad"]) {
    assert.throws(() => resolveImageUrl(target, "https://media.example/images"), /image|URL|HTTPS/i);
  }
  for (const base of ["http://media.example", "https://media.example/?x=1", "https://name:secret@media.example"]) {
    assert.throws(() => resolveImageUrl("/a.jpg", base), /image base URL/);
  }
});
