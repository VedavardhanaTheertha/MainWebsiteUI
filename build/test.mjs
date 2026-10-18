import { generateContent, runUnitTests } from "./pipeline.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("unit tests and content preparation");
generateContent();
runUnitTests();
