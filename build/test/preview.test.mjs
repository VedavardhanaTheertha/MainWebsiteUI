import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { once } from "node:events";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createPreviewServer } from "../preview.mjs";

test("static preview serves clean routes and assets under root and configured base path", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "website-preview-"));
  try {
    await mkdir(path.join(directory, "_next", "static"), { recursive: true });
    await mkdir(path.join(directory, "events", "detail", "__next.events", "detail"), { recursive: true });
    await writeFile(path.join(directory, "index.html"), "<h1>Home</h1>");
    await writeFile(path.join(directory, "events.html"), "<h1>Events</h1>");
    await writeFile(path.join(directory, "_next", "static", "app.js"), "export default 1;");
    await writeFile(path.join(directory, "events", "detail", "__next.events", "detail", "__PAGE__.txt"), "segment payload");
    await writeFile(path.join(directory, "events", "detail", "__next._tree.txt"), "segment tree");
    for (const basePath of ["", "/MainWebsiteUI"]) {
      const server = createPreviewServer(directory, basePath);
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const origin = `http://127.0.0.1:${server.address().port}`;
      try {
        assert.equal(await (await fetch(`${origin}${basePath}/`)).text(), "<h1>Home</h1>");
        assert.equal(await (await fetch(`${origin}${basePath}/events`)).text(), "<h1>Events</h1>");
        assert.equal(await (await fetch(`${origin}${basePath}/_next/static/app.js`)).text(), "export default 1;");
        for (const segment of ["__next.events.detail.__PAGE__.txt", "__next.events/detail/__PAGE__.txt"]) {
          const response = await fetch(`${origin}${basePath}/events/detail/${segment}?_rsc=fixture`);
          assert.equal(response.status, 200);
          assert.equal(await response.text(), "segment payload");
        }
        assert.equal((await fetch(`${origin}${basePath}/events/detail/__next.events.detail.__PAGE__.txt`, { method: "HEAD" })).status, 200);
        assert.equal(await (await fetch(`${origin}${basePath}/events/detail/__next._tree.txt`)).text(), "segment tree");
        assert.equal((await fetch(`${origin}${basePath}/events/detail/__next.missing.__PAGE__.txt`)).status, 404);
        assert.equal((await fetch(`${origin}${basePath}/missing`)).status, 404);
        const redirect = await fetch(`${origin}${basePath}/events.html`, { redirect: "manual" });
        assert.equal(redirect.headers.get("location"), `${basePath}/events`);
        if (basePath) {
          assert.equal((await fetch(`${origin}/events`)).status, 404);
          assert.equal((await fetch(`${origin}${basePath}`, { redirect: "manual" })).headers.get("location"), `${basePath}/`);
        }
      } finally {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("preview rejects a missing static export", () => {
  assert.throws(() => createPreviewServer(path.join(os.tmpdir(), "missing-website-export")), /Run the matching build first/);
});
