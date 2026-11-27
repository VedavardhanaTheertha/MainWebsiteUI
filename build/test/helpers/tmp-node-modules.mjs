import * as moduleApi from "node:module";

const projectEntryUrl = new URL("../../../package.json", import.meta.url).href;

function isBareSpecifier(specifier) {
  return !specifier.startsWith(".") && !specifier.startsWith("/") && !specifier.startsWith("node:") && !specifier.startsWith("file:");
}

let registered = false;

/** Registers a Node module resolve hook so in-process imports from tmpdir fixtures find repo node_modules. */
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
  `data:text/javascript,${encodeURIComponent(
    `import * as m from "node:module";
    const p = ${JSON.stringify(projectEntryUrl)};
    const r = (s, c, n) => (!s.startsWith(".") && !s.startsWith("/") && !s.startsWith("node:") && !s.startsWith("file:")) ? n(s, { ...c, parentURL: p }) : n(s, c);
    if (typeof m.registerHooks === "function") m.registerHooks({ resolve: r });
    else m.register(${JSON.stringify(`data:text/javascript,${encodeURIComponent(`export async function resolve(s, c, n) { return (!s.startsWith(".") && !s.startsWith("/") && !s.startsWith("node:") && !s.startsWith("file:")) ? n(s, { ...c, parentURL: ${JSON.stringify(projectEntryUrl)} }) : n(s, c); }`)}`)});`,
  )}`,
];
