import { generateContent } from "./pipeline.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("content generation");
generateContent();
