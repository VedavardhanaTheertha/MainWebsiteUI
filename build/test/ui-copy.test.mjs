import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import yaml from "js-yaml";
import { loadEditorialContent } from "../editorial-content.mjs";
import { findDisplayLiterals } from "../migration-audit.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const defaultLanguage = yaml.load(readFileSync(path.join(root, "config", "site.yml"), "utf8")).site.default_language;

test("canonical UI labels exactly implement the active interface", () => {
  const labels = JSON.parse(readFileSync(path.join(root, "content", "languages", `${defaultLanguage}.json`), "utf8"));
  const file = path.join(root, "src", "lib", "ui-copy-types.ts");
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const shape = source.statements.find((node) => ts.isInterfaceDeclaration(node) && node.name.text === "UiCopy");
  assert.ok(shape);
  assert.deepEqual(Object.keys(labels.ui).sort(), shape.members.map((member) => member.name.text).sort());
  assert.ok(Object.values(labels.ui).every((value) => typeof value === "string" && value.trim()));
  assert.equal(labels.legacy_ui, undefined);
  assert.equal(labels.donation, undefined);
});

test("material enquiries use the preserved catalog and authored prices in both translations", () => {
  for (const language of ["en", "kn"]) {
    const { editorial: copy } = loadEditorialContent(root, language);
    assert.deepEqual(copy.donation.material_options.map(({ id }) => id), ["rice", "ghee", "oil", "jaggery", "flowers", "coconut"]);
    assert.deepEqual(copy.donation.material_options.map(({ unit }) => unit.match(/\d+/u)?.[0]), ["60", "650", "220", "80", "150", "40"]);
    assert.ok(copy.donation.material_options.every(({ label, desc, icon }) => label && desc && icon));
    assert.equal(copy.donation.upi, undefined);
    assert.equal(copy.volunteer, undefined);
  }
});

test("retained UI obtains display prose and accessibility labels from content", () => {
  for (const component of ["DonateModal", "QRModal", "PaymentQr", "MobileHeader", "SiteHeader", "SiteFooter", "TopBar"]) {
    const file = path.join(root, "src", "components", `${component}.tsx`);
    assert.deepEqual(findDisplayLiterals(file, readFileSync(file, "utf8")), [], component);
  }
});

test("removed fake registration and donation panel implementations stay absent", () => {
  for (const file of ["src/components/VolunteerModal.tsx", "src/hooks/useVolunteerModal.ts", "src/components/seva/DonationPanel.tsx"]) {
    assert.equal(existsSync(path.join(root, file)), false);
  }
  const donation = readFileSync(path.join(root, "src", "components", "DonateModal.tsx"), "utf8");
  assert.match(donation, /setSelectedMaterial\(item\)/);
  assert.match(donation, /material: selectedMaterial\?\.label/);
  assert.doesNotMatch(donation, /usePathname|setSubmitted|qr_placeholder|donation_whatsapp_message/);
  assert.match(donation, /useDialog\(isOpen, handleClose\)/);
});
