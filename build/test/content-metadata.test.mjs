import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { collectRealProse, isPreservedContentField } from "../content-values.mjs";

test("placeholder content preserves new media/link/learning metadata but transforms descriptive prose", async () => {
  const source = await readFile(new URL("../../scripts/generate-content.mjs", import.meta.url), "utf8");
  const start = source.indexOf("function toPlaceholders(");
  const end = source.indexOf("\n/**", start);
  const transform = vm.runInNewContext(`${source.slice(start, end)}\ntoPlaceholders`, {
    isPreservedContentField,
    isMachineValue: () => false,
    isPlainObject: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
    makePlaceholder: (key) => `placeholder:${key}`,
  });
  const input = {
    footer: { social: [{ connectId: "official", href: "https://example.com", label: "Channel label" }] },
    media: { albums: [{
      id: "album", date: "2026-01-01", event: "Event name", photos: [{
        id: "photo", albumId: "album", fullImage: "/large.jpg", caption: "Approved caption",
      }], videos: [{
        type: "video", videoUrl: "https://example.com/video.mp4", externalUrl: "https://example.com/watch",
        recordedAt: "2026-01-01", language: "Recorded language", dur: "4:20", duration: "4:20",
      }],
    }] },
    learn: [{ id: "course", duration: "Weekend sessions", enrollmentUrl: "https://example.com/enroll" }],
    editorial: {
      donation: { upi: "existing.matha@upi", material_options: [{ id: "rice", label: "Rice offering", desc: "Existing offering description" }] },
      volunteer: { service_options: [{ id: "Digital & Media", label: "Digital & Media" }] },
    },
    pages: { learn: { suggested_paths: [{ itemIds: ["course"], title: "Path title" }] } },
    presentation: {
      numberLocale: "en-IN",
      bars: [{ bg: "from-[var(--color-saffron-600)] to-[var(--color-saffron-600)]",
        accent: "from-[var(--color-saffron-600)] to-[var(--color-saffron-600)]",
        textColor: "text-[var(--color-text-primary)]", labelKey: "qa_events", imgPosition: "center 20%" }],
    },
  };
  const output = JSON.parse(JSON.stringify(transform(input, "preview")));
  const album = output.media.albums[0];
  assert.equal(album.id, "album");
  assert.equal(album.date, "2026-01-01");
  assert.equal(album.photos[0].fullImage, "/large.jpg");
  assert.equal(album.photos[0].albumId, "album");
  for (const key of ["type", "videoUrl", "externalUrl", "recordedAt", "dur", "duration"]) {
    assert.equal(album.videos[0][key], input.media.albums[0].videos[0][key]);
  }
  assert.match(album.event, /^placeholder:/);
  assert.match(album.photos[0].caption, /^placeholder:/);
  assert.match(album.videos[0].language, /^placeholder:/);
  assert.match(output.learn[0].duration, /^placeholder:/);
  assert.equal(output.editorial.donation.upi, "existing.matha@upi");
  assert.equal(output.editorial.donation.material_options[0].id, "rice");
  assert.match(output.editorial.donation.material_options[0].label, /^placeholder:/);
  assert.match(output.editorial.donation.material_options[0].desc, /^placeholder:/);
  assert.equal(output.editorial.volunteer.service_options[0].id, "Digital & Media");
  assert.match(output.editorial.volunteer.service_options[0].label, /^placeholder:/);
  assert.equal(output.learn[0].enrollmentUrl, "https://example.com/enroll");
  assert.deepEqual(output.pages.learn.suggested_paths[0].itemIds, ["course"]);
  assert.match(output.pages.learn.suggested_paths[0].title, /^placeholder:/);
  assert.equal(output.footer.social[0].connectId, "official");
  assert.deepEqual(output.presentation, input.presentation);
});

test("leak verification excludes machine fields without excluding identical display prose", () => {
  const style = "from-[var(--color-saffron-600)] to-[var(--color-saffron-600)]";
  assert.deepEqual(collectRealProse({
    bg: style,
    accent: style,
    textColor: "text-[var(--color-text-primary)]",
    href: "/a-long-route-that-is-not-display-prose",
    caption: style,
    body: "This genuinely authored paragraph must still be checked for content leaks.",
  }), [style, "This genuinely authored paragraph must still be checked for content leaks."]);
});
