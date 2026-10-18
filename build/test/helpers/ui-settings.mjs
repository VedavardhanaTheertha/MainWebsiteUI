import { readFileSync } from "node:fs";
import { parseUiSettings } from "../../ui-settings-schema.mjs";

export const testUiSettings = parseUiSettings(JSON.parse(
  readFileSync(new URL("../../../settings/ui_elements.json", import.meta.url), "utf8"),
));
