import { generateContent, runNode, runUnitTests } from "./pipeline.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("source checks");
generateContent();
runNode("node_modules/eslint/bin/eslint.js", [".", "--max-warnings=0"]);
runNode("node_modules/typescript/bin/tsc", ["--noEmit"]);
runUnitTests();
