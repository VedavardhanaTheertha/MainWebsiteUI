import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const tokenVariable = "WEBSITE_TOOLING_TOKEN";

function alive(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== "ESRCH";
  }
}

function readOwner(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`Workspace tooling lock is unreadable: ${file}. Another operation may be starting.`, { cause: error });
  }
}

export function acquireWorkspaceLock(purpose, {
  rootDir = projectRoot, environment = process.env, watchNext = true,
} = {}) {
  const file = path.join(rootDir, "node_modules", ".cache", "website-tooling.lock");
  mkdirSync(path.dirname(file), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    if (existsSync(file)) {
      const owner = readOwner(file);
      if (owner && alive(owner.pid)) {
        if (owner.token === environment[tokenVariable]) return () => {};
        throw new Error(`Workspace is busy: ${owner.purpose} (PID ${owner.pid}). Stop or finish it before ${purpose}.`);
      }
      const reclaim = `${file}.reclaim`;
      try {
        writeFileSync(reclaim, String(process.pid), { flag: "wx" });
      } catch (error) {
        if (error.code === "EEXIST") throw new Error(`Workspace lock recovery is in progress: ${reclaim}. Retry after it finishes.`);
        throw error;
      }
      try {
        const current = readOwner(file);
        if (current && alive(current.pid)) continue;
        rmSync(file, { force: true });
      } finally {
        rmSync(reclaim);
      }
    }
    const owner = { pid: process.pid, purpose, token: randomUUID() };
    try {
      writeFileSync(file, JSON.stringify(owner), { flag: "wx" });
    } catch (error) {
      if (error.code === "EEXIST") continue;
      throw error;
    }
    const previous = environment[tokenVariable];
    const release = () => {
      if (readOwner(file)?.token === owner.token) rmSync(file);
      if (previous === undefined) delete environment[tokenVariable];
      else environment[tokenVariable] = previous;
    };
    if (watchNext) {
      const nextLock = [path.join(".next", "dev", "lock"), path.join(".next", "lock")]
        .find((relative) => existsSync(path.join(rootDir, relative)));
      if (nextLock) {
        release();
        throw new Error(`Next.js owns ${nextLock}. Stop the existing server/build before ${purpose}; do not clean its output while it is running.`);
      }
    }
    environment[tokenVariable] = owner.token;
    return release;
  }
  throw new Error(`Workspace became busy before ${purpose}; retry after the other operation finishes.`);
}

export function holdWorkspaceLock(purpose) {
  const release = acquireWorkspaceLock(purpose);
  process.once("exit", release);
  return release;
}
