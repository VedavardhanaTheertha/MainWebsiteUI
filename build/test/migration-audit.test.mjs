import assert from "node:assert/strict";
import test from "node:test";
import { findDisplayLiterals } from "../migration-audit.mjs";

test("migration audit detects literal JSX prose and accessible labels without flagging classes or content bindings", () => {
  const findings = findDisplayLiterals("Example.tsx", `
    export default function Example({ copy }) {
      return <section className="grid gap-4">
        <h1>{copy.title}</h1>
        <button aria-label="Previous item">Continue reading</button>
        <img alt={copy.imageAlt} src="/image.jpg" />
      </section>;
    }
  `);
  assert.deepEqual(findings.map(({ text }) => text), ["Previous item", "Continue reading"]);
  assert.ok(findings.every(({ line }) => line > 1));
});
