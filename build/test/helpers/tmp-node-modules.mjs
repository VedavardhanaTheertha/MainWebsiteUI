import * as moduleApi from "node:module";

const projectEntryUrl = new URL("../../../package.json", import.meta.url).href;

function isBareSpecifier(specifier) {
  return !specifier.startsWith(".") && !specifier.startsWith("/") && !specifier.startsWith("node:") && !specifier.startsWith("file:");
}

let registered = false;

/** Registers a Node module resolve hook so in-process and subprocess imports from tmpdir fixtures find repo node_modules. */
export function registerProjectModulesForTests() {
  if (registered) return;
  registered = true;
  if (typeof moduleApi.registerHooks === "function") {
    moduleApi.registerHooks({
      resolve(specifier, context, next) {
        return isBareSpecifier(specifier)
          ? next(specifier, { ...context, parentURL: projectEntryUrl })
          : next(specifier, context);
      },
    });
  }
}

/** CLI flags to pass to spawned Node subprocesses running scripts inside tmpdir fixtures. */
export const childProcessImportArgs = [
  "--import",
  new URL("./register-project-modules.mjs", import.meta.url).href,
];
