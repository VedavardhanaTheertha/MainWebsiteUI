import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { loadActionSettings, parseActionSettings, resolveActionSettings, validateActionCopy } from "../action-settings.mjs";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";

const defaults = {
  headerWhatsApp: { connectId: "whatsapp" },
  subscribe: { connectId: "youtube" },
  donationWhatsApp: { connectId: "whatsapp" },
  donationEmail: { url: "mailto:seva@example.org" },
  payment: { url: "https://pay.example.org/?entity_id=3&event_id=4&seva_id=3" },
  volunteer: { url: "https://volunteer.example.org/" },
  yajna: { url: "https://yajna.example.org/" },
};
const connections = [
  { id: "whatsapp", url: "https://whatsapp.com/channel/example" },
  { id: "youtube", url: "https://www.youtube.com/@example" },
  { id: "email", url: "mailto:contact@example.org" },
];

test("public actions resolve canonical connection records and explicit donation contacts", () => {
  const result = resolveActionSettings(defaults, connections);
  assert.equal(result.headerWhatsApp, connections[0].url);
  assert.equal(result.subscribe, connections[1].url);
  assert.equal(result.donationWhatsApp, connections[0].url);
  assert.equal(new URL(result.donationWhatsApp).search, "");
  const changed = resolveActionSettings({
    ...defaults, headerWhatsApp: { url: "https://chat.whatsapp.com/example" },
    donationEmail: { connectId: "email" },
  }, connections);
  assert.equal(changed.headerWhatsApp, "https://chat.whatsapp.com/example");
  assert.equal(changed.donationEmail, connections[2].url);
  assert.throws(() => resolveActionSettings(defaults, []), /unknown connectId/);
  assert.throws(() => resolveActionSettings({ ...defaults, headerWhatsApp: { connectId: "email" } }, connections), /HTTPS/);
});

test("public actions reject missing, ambiguous, malformed, and unsafe destinations", () => {
  for (const entry of [null, [], {}, { url: "https://example.org", connectId: "whatsapp" }, { connectId: "../file" }]) {
    assert.throws(() => parseActionSettings({ ...defaults, headerWhatsApp: entry }), /headerWhatsApp/);
  }
  assert.throws(() => parseActionSettings({ ...defaults, extra: {} }), /unknown action/);
  for (const url of ["javascript:alert(1)", "http://example.org", "https://user:pass@example.org", "https://example.org/%0d%0a"]) {
    assert.throws(() => parseActionSettings({ ...defaults, subscribe: { url } }), /subscribe/);
  }
  for (const url of ["https://example.org/1234567", "https://wa.me/123456789", "https://whatsapp.com/channel/example?text=old", "https://whatsapp.com:4430/channel/example"]) {
    assert.throws(() => parseActionSettings({ ...defaults, donationWhatsApp: { url } }), /donationWhatsApp/);
  }
  for (const url of ["mailto:not-an-address", "mailto:first@example.org,second@example.org", "mailto:a@example.org?bcc=b@example.org", "mailto:a%0abcc@example.org"]) {
    assert.throws(() => parseActionSettings({ ...defaults, donationEmail: { url } }), /donationEmail/);
  }
});

test("configured default action references exist in the official connection library", async () => {
  const links = [];
  for (const name of (await readdir(new URL("../../library/connect/", import.meta.url))).filter((name) => name.endsWith(".md"))) {
    const raw = await readFile(new URL(`../../library/connect/${name}`, import.meta.url), "utf8");
    links.push(parseMarkdownFrontmatter(raw, name).metadata);
  }
  const config = loadActionSettings();
  const resolved = resolveActionSettings(config, links);
  for (const [action, entry] of Object.entries(config)) {
    assert.equal(resolved[action], entry.url ?? links.find((link) => link.id === entry.connectId).url);
  }
});

test("contact messages preserve Unicode and encode user input without changing routing", async () => {
  const exports = {};
  const source = await readFile(new URL("../../src/lib/action-links.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, URL });
  const { formatActionMessage, withActionParameters } = exports;
  const message = formatActionMessage("Name: {name}\n{note}", { name: "A & B {unknown}", note: "ಕನ್ನಡ + rice?" });
  const email = new URL(withActionParameters(defaults.donationEmail.url, { subject: "Rice & flowers", body: message }));
  assert.equal(email.pathname, "seva@example.org");
  assert.equal(email.searchParams.get("subject"), "Rice & flowers");
  assert.equal(email.searchParams.get("body"), message);
  assert.throws(() => formatActionMessage("{missing}", {}), /Unknown action-message placeholder/);
});

test("translated action templates are validated before placeholder generation", async () => {
  const content = JSON.parse(await readFile(new URL("../../content/languages/en.json", import.meta.url), "utf8"));
  validateActionCopy(content.public_actions, "language.json");
  assert.throws(() => validateActionCopy({
    ...content.public_actions, donation_email_subject: "{unknown}",
  }, "language.json"), /language.json public_actions.donation_email_subject.*unknown placeholder/);
  assert.throws(() => validateActionCopy({
    ...content.public_actions, send_email: "",
  }, "language.json"), /public_actions.send_email/);
});
