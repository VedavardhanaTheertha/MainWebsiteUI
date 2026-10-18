import { generateContent, runNode } from "./pipeline.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

const args = process.argv.slice(2);
const envName = args[0] && !args[0].startsWith("-") ? args.shift() : process.env.SITE_ENV || "dev";
process.env.SITE_ENV = envName;
holdWorkspaceLock(`development server (${envName})`);
generateContent();
runNode("node_modules/next/dist/bin/next", ["dev", ...args]);