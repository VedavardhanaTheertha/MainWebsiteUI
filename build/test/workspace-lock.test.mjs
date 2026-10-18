import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { acquireWorkspaceLock } from "../workspace-lock.mjs";

function fixture(run) {
  const rootDir = path.resolve("build", "test", `.workspace-${randomUUID()}`);
  mkdirSync(rootDir, { recursive: true });
  try { run(rootDir); } finally { rmSync(rootDir, { recursive: true, force: true }); }
}

test("workspace lock excludes other operations but allows inherited pipeline children", () => fixture((rootDir) => {
  const environment = {};
  const release = acquireWorkspaceLock("development", { rootDir, environment });
  try {
    assert.throws(() => acquireWorkspaceLock("clean", { rootDir, environment: {} }), /Workspace is busy: development/);
    acquireWorkspaceLock("child generation", { rootDir, environment })();
    assert.throws(() => acquireWorkspaceLock("build", { rootDir, environment: {} }), /Workspace is busy/);
  } finally { release(); }
  assert.deepEqual(environment, {});
  acquireWorkspaceLock("next operation", { rootDir, environment: {} })();
}));

test("workspace lock detects an existing Next server before changing output", () => fixture((rootDir) => {
  const directory = path.join(rootDir, ".next", "dev");
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "lock"), "");
  assert.throws(() => acquireWorkspaceLock("build", { rootDir, environment: {} }), /Stop the existing server/);
  assert.equal(readFileSync(path.join(directory, "lock"), "utf8"), "");
}));

test("workspace lock recovers a dead owner and restores inherited environment", () => fixture((rootDir) => {
  const directory = path.join(rootDir, "node_modules", ".cache");
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "website-tooling.lock"),
    JSON.stringify({ pid: 2147483647, purpose: "finished", token: "stale" }));
  const environment = { WEBSITE_TOOLING_TOKEN: "previous" };
  acquireWorkspaceLock("build", { rootDir, environment })();
  assert.equal(environment.WEBSITE_TOOLING_TOKEN, "previous");
}));

test("workspace lock coordinates real subprocesses and propagates authorized ownership", () => fixture((rootDir) => {
  const environment = {};
  const release = acquireWorkspaceLock("parent operation", { rootDir, environment });
  const script = `import { acquireWorkspaceLock } from ${JSON.stringify(new URL("../workspace-lock.mjs", import.meta.url).href)};
    acquireWorkspaceLock("child operation", { rootDir: process.argv[1] })();`;
  try {
    const blocked = spawnSync(process.execPath, ["--input-type=module", "-e", script, rootDir], {
      env: { ...process.env, WEBSITE_TOOLING_TOKEN: "" }, encoding: "utf8",
    });
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /Workspace is busy: parent operation/);
    const authorized = spawnSync(process.execPath, ["--input-type=module", "-e", script, rootDir], {
      env: { ...process.env, ...environment }, encoding: "utf8",
    });
    assert.equal(authorized.status, 0, authorized.stderr);
    assert.throws(() => acquireWorkspaceLock("still excluded", { rootDir, environment: {} }), /Workspace is busy/);
  } finally { release(); }
}));
