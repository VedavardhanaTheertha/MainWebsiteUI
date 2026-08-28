<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

## Content never goes in code

All user-visible text lives in `content/languages/*.json`; articles live in
`content/blog/<slug>/`. **Never hardcode a display string in `src/`.** Components read
content through `useLang()`. This is what allows a contributor to add a language or an
article without touching code. `build/verify.mjs` fails on the detectable leak classes
described below.

No file in `src/` may name a language or a blog post. Both are discovered from the
filesystem at build time by `scripts/generate-content.mjs`.

## Keep the documentation true

Any change to the structure, content system, environments, or build pipeline **must**
update `docs/ARCHITECTURE.md` in the same change. Changes to how contributors do things
update `docs/DEVELOPER.md`. Documentation that lies is worse than none, because people trust it.

## Before claiming something works

Run `npm run build:dev` and read the verification output. In rendered HTML and the web
manifest, it detects exact default-language JSON prose of at least 30 characters and
configured brand terms at any length. This catches important leaks that type-checking
cannot, but it is not a complete source-level guarantee: short, altered, or non-default
language literals may evade it. Review `src/` for display strings as well.

**A passing local build does not prove CI will pass.** Local builds run against the
working directory, which includes files git ignores; CI only gets what is committed. A
`.gitignore` rule once excluded the whole `build/` directory, so every local build passed
while CI failed instantly on a missing script.

Before trusting a build, reproduce what CI actually checks out:

```bash
git clone . /tmp/ci-check && cd /tmp/ci-check && npm ci && node build/build.mjs dev
```

If a file is needed at build time, confirm `git ls-files` lists it.
