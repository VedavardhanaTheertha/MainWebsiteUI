# Developer Guide

This is the setup-and-workflow reference. For *what the project is and why it's built
this way*, see [ARCHITECTURE.md](./ARCHITECTURE.md). For *how to do specific
content/editing tasks* (add a language, add a blog post), see [KT.md](./KT.md). For
*current status and what's left*, see [STATUS.md](./STATUS.md).

---

## 1. Who this is for

| You are… | Use this path |
|---|---|
| An outside contributor fixing wording, adding a translation, or adding a blog post | **Quick-fix path** — you can do this without running the project locally at all |
| An outside contributor or internal team member changing layout, components, or build behaviour | **Full-setup path** — clone, install, run locally |
| Internal team, deploying or configuring environments | Full-setup path, plus §11 |

### Quick-fix path

All user-facing wording lives in `content/languages/en.json`, and blog posts live in
`content/blog/<slug>/`. Both are plain files. You can edit them directly in GitHub's web
UI and open a pull request — no Node install, no local build required. See
[KT.md §3–§5](./KT.md) for exactly how.

If you want to *see* your change rendered before opening the PR, follow the full-setup
path below — §4 gets you a running preview in a few commands.

### Full-setup path

Anything under `src/`, `build/`, `scripts/`, or `config/` needs a local environment.
Continue with §2.

---

## 2. Prerequisites

| Requirement | Version | Verified from |
|---|---|---|
| Node.js | **20** | `.github/workflows/deploy-dev.yml` pins `node-version: 20` for CI; [KT.md](./KT.md) says "20 or newer" |
| npm | ships with Node 20 | `package-lock.json` is `lockfileVersion: 3`, which needs npm ≥ 7 |
| Git | any recent version | — |

`package.json` does not declare an `engines` field, so nothing enforces this locally —
matching CI's Node 20 is on you.

TODO(bawse): confirm whether an exact Node 20.x patch version is required, or any 20.x
is fine — CI just says `20`, which resolves to the latest 20.x at run time.

---

## 3. Getting the code; branch model

```bash
git clone https://github.com/VedavardhanaTheertha/MainWebsiteUI.git
cd MainWebsiteUI
```

(The address above is `origin` in this checkout — verified with `git remote -v`. If
you've forked the repo, clone your fork instead.)

### Branches, as they actually exist today

| Branch | Purpose per the docs | CI trigger | Currently exists on `origin`? |
|---|---|---|---|
| `main` | Canonical source: the code, its build, and contributor docs | ✅ (`verify.yml` — build check, no deploy) | ✅ |
| `dev` | Preview source; deploys to GitHub Pages | ✅ (`deploy-dev.yml`) | ❌ not currently pushed |
| `Design2code` | — | ✅ (`deploy-dev.yml`) | ✅ — this is the active work branch |

`ARCHITECTURE.md` §6 and `KT.md` §7 describe a `dev` branch as the preview source. In
the repository as checked out, that branch doesn't exist yet — active work happens on
`Design2code`, which `.github/workflows/deploy-dev.yml` builds and deploys to GitHub
Pages identically to how `dev` would. Branch from `main` — it now carries the full
source, its build, and the contributor docs; check `git branch -a` if you're unsure
which branches exist.

Branch and PR conventions live in [`CONTRIBUTING.md`](../CONTRIBUTING.md) and
[`GUIDELINE_SOURCE_CODE.md`](./GUIDELINE_SOURCE_CODE.md). §9 below adds the
build-specific checks this project needs on top of them.

---

## 4. First run; expected output

```bash
npm install
npm run dev
```

Open:

```
http://localhost:3000/MainWebsiteUI/
```

**The trailing path matters.** It comes from `base_path: "/MainWebsiteUI"` for the
`dev` environment in `config/site.yml`, because GitHub Pages serves this project from
`https://<user>.github.io/MainWebsiteUI/`. Plain `http://localhost:3000` 404s — that's
expected.

> Note: `KT.md` §2 shows a different path
> (`http://localhost:3000/shiruru_final_21june/`), from an earlier repository name. The
> path above matches the current `config/site.yml` and `README.md` — use it, not the one
> in `KT.md`.

**What you should see:** placeholder text everywhere, e.g. *"en·hero title — content
goes here"*, not real Shiroor Matha wording. That's intentional — see §7. To see real
content locally instead:

```bash
$env:SITE_ENV = "prod"; npm run dev    # PowerShell
```

```bash
SITE_ENV=prod npm run dev              # bash
```

---

## 5. Repository map

```
content/       all user-facing text and blog posts — the only folder most
               contributors touch (content/languages/*.json, content/blog/<slug>/)
config/        site.yml — environments, build flags, brand terms
docs/          this guide, ARCHITECTURE.md, KT.md, STATUS.md, and the
               CONTRIBUTE_*/GUIDELINE_* contributor guides
build/         build.mjs (runs the full build) and verify.mjs (checks the output)
scripts/       generate-content.mjs — turns content/ into src/gen/content.ts
src/app/       Next.js routes — structure only, never content
src/components/  reusable UI — structure only, never content
src/lib/       shared logic: content-types.ts, nav-types.ts, scheduler.ts
src/context/   LanguageContext.tsx — the useLang() provider (see §8)
src/gen/       generated website data — gitignored, recreated by each dev/build command
public/        images and static files served as-is
library/       submodule → WebsiteLibrary (devotional content; not needed to build)
test_media/    submodule → WebsiteTestMedia (media fixtures; not needed to build)
.github/workflows/deploy-dev.yml  thin CI wrapper around build/build.mjs
```

Full rationale for this layout: [ARCHITECTURE.md §4](./ARCHITECTURE.md#4-repository-layout).

---

## 6. Build

This section is the usage-facing companion to
[`build/README.md`](../build/README.md) — read that file for the reasoning behind
keeping build logic out of CI YAML; this section is commands, outputs, and failures.

### Commands

| Command | Runs | Produces |
|---|---|---|
| `npm run content:build` | Bhakti and website content generators | `src/gen/`, `public/robots.txt` |
| `npm run dev` | content:build, then `next dev` | a running dev server |
| `npm run build:dev` | `node build/build.mjs dev` — full pipeline: generate content → `next build` → verify | `out/` (dev/placeholder build) |
| `npm run build:prod` | same pipeline with `SITE_ENV=prod` | `out/` (production/real-content build) |
| `npm run verify` | `build/verify.mjs` against an existing `out/` | pass/fail report, no rebuild |
| `npm run lint` | ESLint | lint errors/warnings |

`npm run build:dev` / `build:prod` are exactly what CI runs — see
[`build/build.mjs`](../build/build.mjs). Run one locally before pushing rather than
using a push to test the pipeline.

### Environment variable

`SITE_ENV` selects the environment (`dev` or `prod`, defined in `config/site.yml`).
It defaults to `dev` when unset — showing real content is an explicit opt-in, never
the default. `npm run build:dev` / `build:prod` set it for you via their `node
build/build.mjs <env>` argument; set it yourself only when running `next dev` or
`next build` directly.

### Common failures

| Symptom | Cause |
|---|---|
| `SITE_ENV="…" is not defined in config/site.yml` | Typo in `$env:SITE_ENV`, or a new environment referenced before it's added to `config/site.yml` |
| `config/site.yml is missing` | Running the build from the wrong working directory, or the file was deleted |
| Build succeeds locally, fails in CI | You built against uncommitted files — see the CI-reproduction note in `AGENTS.md` and run the clean-clone check below |
| `[verify] WARNING: real content found in a dev build` | Text is hardcoded in a `.tsx` file instead of `content/languages/en.json` — see §8 |
| `[verify] WARNING: brand terms found in a dev build` | Same cause — a brand term from `config/site.yml`'s `brand_terms` list leaked into a non-production page |
| A blog post silently fails the build | Missing/invalid `date` in `meta.json`, or no `# Title` heading in `en.md` — this one fails rather than warns, deliberately (see [ARCHITECTURE.md §5.2](./ARCHITECTURE.md#52-blog-and-article-content)) |

The two `[verify] WARNING:` cases above currently only warn, per
`build.fail_on_hardcoded_content: false` in `config/site.yml` — see §7.

To reproduce exactly what CI checks out (catches the class of bug where a working
directory has files git doesn't track):

```bash
git clone . /tmp/ci-check && cd /tmp/ci-check && npm ci && node build/build.mjs dev
```

---

## 7. Configuration and environments

Everything environment-specific is in [`config/site.yml`](../config/site.yml) — nothing
in `src/` should ever branch on environment name directly. Full design rationale:
[ARCHITECTURE.md §6](./ARCHITECTURE.md#6-environments).

| Setting | `dev` | `prod` |
|---|---|---|
| `base_path` | `/MainWebsiteUI` | `""` |
| `content_mode` | `placeholder` | `real` |
| `indexable` | `false` | `true` |
| Hosted on | GitHub Pages | Cloudflare Pages (not yet connected — see §11) |

Build-wide flags also live there:

- `build.fail_on_hardcoded_content` — `false` today. Flip to `true` once the hardcoded-
  content migration (§8) is finished; this turns the two verify warnings above into
  build failures.
- `build.brand_terms` — words that must never appear on a non-production page, checked
  at any length (unlike general prose, which needs 30+ characters to count — see
  `build/verify.mjs`).
- `build.daily_rebuild` / `daily_rebuild_hour` — GitHub Actions also rebuilds on a
  cron schedule, independent of pushes; see `.github/workflows/deploy-dev.yml`.

To add a third environment, add an entry under `environments:` in `config/site.yml` —
no code change needed (`build/build.mjs`, `next.config.ts`, and
`scripts/generate-content.mjs` all read the file at build time).

---

## 8. Content and i18n rules for developers

**No user-facing wording may be written into a page or component file.** Every string a
visitor reads comes from `content/languages/en.json` (and its per-language overrides),
never a literal in `src/`. This is stated in `AGENTS.md` and is not optional.

- Read content through `useLang()` (`src/context/LanguageContext.tsx:69`), which
  returns `{ lang, tr, languages, setLang }`. `tr` is the merged, typed content object
  for the active language — pull strings from `tr`, not from a local constant.
- No file in `src/` may name a specific language code or a specific blog post slug.
  Both are discovered from the filesystem by `scripts/generate-content.mjs` — see
  [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-core-principle--content-is-data-structure-is-code).
- This is **enforced by the build**, not just a convention: `build/verify.mjs` scans
  every non-production page for real prose and for the brand terms in
  `config/site.yml`, and reports any hit — currently as a warning (§7), soon as a
  build failure once `build.fail_on_hardcoded_content` flips to `true`.
- Before claiming a change is content-clean, run `npm run build:dev` and read the
  `[verify]` output — a passing type-check does not catch a hardcoded string.

If you find existing hardcoded text while working nearby, migrating it into
`content/languages/en.json` is welcome — see the tracked count in
[ARCHITECTURE.md §11](./ARCHITECTURE.md#11-known-gaps-and-planned-work) for what's
still outstanding.

---

## 9. Branches, commits, PR checklist

Read [`CONTRIBUTING.md`](../CONTRIBUTING.md) and
[`GUIDELINE_SOURCE_CODE.md`](./GUIDELINE_SOURCE_CODE.md) first — they cover the general
rules. What follows is the build-specific part, from `AGENTS.md` and the maintenance
rules in `ARCHITECTURE.md` §12 and `KT.md` §11.

- Branch from `main`, with a descriptive name like `feature/add-events` or
  `fix/content-links` (see §3).
- Keep content changes (`content/`) and code changes (`src/`, `build/`, `scripts/`) in
  separate PRs where practical — a translator's PR should not need a code review.
- **If your change alters structure, the content system, environments, or the build
  pipeline, update `docs/ARCHITECTURE.md` in the same PR.**
- **If your change alters how a contributor does something day-to-day, update
  `docs/KT.md` in the same PR.**
- Before opening the PR:
  1. `npm run lint`
  2. `npm run build:dev` — read the `[verify]` output, not just the exit code
  3. For anything you're not 100% sure built from committed files, run the clean-clone
     check in §6
- No file under `src/` should name a language code or a blog post slug (§8) — grep for
  the language codes in `content/languages/` and the slugs in `content/blog/` if
  you're unsure whether you've introduced one.

`CONTRIBUTING.md` is at the repository root and is the canonical general checklist.
There is still no PR template (`.github/pull_request_template.md`) — worth adding if PR
descriptions start to drift.

---

## 10. Tests and the automatic build check

There is currently **no automated test suite** beyond linting and the build
verification:

- `npm run lint` — ESLint (`eslint.config.mjs`).
- `playwright` is a `devDependency` in `package.json`, but there is no `test` script
  and no test files in the repo — it isn't wired up yet.
  [ARCHITECTURE.md §11](./ARCHITECTURE.md#11-known-gaps-and-planned-work) lists
  automated visual regression testing (using Playwright) as suggested future work, not
  yet agreed or started.
- `build/verify.mjs` (run via `npm run verify`, or automatically inside `build:dev` /
  `build:prod`) is the closest thing to an automated check today. It inspects the
  exported `out/` directory and confirms:
  1. `robots.txt` matches the environment's indexing policy
  2. non-production pages carry `noindex`
  3. non-production pages contain no real prose from `content/languages/en.json`
  4. non-production pages contain none of `config/site.yml`'s `brand_terms`

  Checks 3 and 4 warn rather than fail today (`build.fail_on_hardcoded_content: false`
  — see §7). There is no equivalent check for production builds; a `prod` build with
  `content_mode: real` skips checks 3 and 4 entirely, by design.

Until a real test suite exists, `npm run build:dev` plus a manual look at the running
dev server (§4) is the practical verification step before a PR.

---

## 11. Deployment

| Branch | Target | How | Status |
|---|---|---|---|
| `dev` (or, today, `Design2code` — see §3) | GitHub Pages | `.github/workflows/deploy-dev.yml`, automatic on push, plus a daily cron rebuild at 21:00 UTC (`config/site.yml: build.daily_rebuild_hour`) | ✅ working |
| `main` | Cloudflare Pages | — | ⏳ designed for, not yet connected (per [STATUS.md](./STATUS.md), requirement 5) |

There is no workflow file in this repo for a production/Cloudflare deploy — only
`deploy-dev.yml` exists under `.github/workflows/`. Cloudflare Pages connects directly
to a GitHub repo through its own dashboard rather than a committed workflow file, so
there's nothing to inspect here until that connection is made.

TODO(bawse): once Cloudflare Pages is connected, document the actual trigger (push to
`main`? manual promote?) and whether it runs `build:prod` or something Cloudflare
configures itself.

The GitHub Pages deploy job deliberately has no `actions/configure-pages` step — see
the comment in `deploy-dev.yml` and the commit `87851c4` — because it fails when Pages
isn't yet enabled on the repo, which would make a correct build look broken.

---

## 12. Troubleshooting

For content-editing problems (blog post not appearing, missing translation keys,
localhost 404), see [KT.md §9](./KT.md#9-common-problems) first — this section only
covers setup/build issues KT.md doesn't.

**`npm run build:dev` passes locally but fails in CI.**
Local builds see every file in your working directory, including anything
`.gitignore`d. CI only sees what's committed. Run the clean-clone check from §6 before
trusting a local pass. This exact failure mode happened once before — a stray
`.gitignore` rule excluded all of `build/`, so CI had no build script at all (see the
note at the top of `.gitignore` and `AGENTS.md`).

**`SITE_ENV="…" is not defined in config/site.yml`.**
Check for a typo, and check `config/site.yml`'s `environments:` block for the exact
key spelling.

**Dev server shows real Shiroor Matha text instead of placeholders.**
Either `SITE_ENV=prod` is set in your shell from a previous session (check `$env:SITE_ENV`
/ `echo $SITE_ENV`), or something is hardcoded outside `content/` — see §8.

**Assets/links 404 locally but the page itself loads.**
You're probably hitting `localhost:3000` without the `/MainWebsiteUI` base path — see
§4.

---

## 13. Related docs

| Doc | For |
|---|---|
| [STATUS.md](./STATUS.md) | Requirements, what's built, what's left — non-technical |
| [KT.md](./KT.md) | How to add a language, add a blog post, edit text — day-to-day contributor tasks |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and the reasoning behind it |
| [build/README.md](../build/README.md) | Build script implementation detail |
| [README.md](../README.md) | Project landing page |
| [AGENTS.md](../AGENTS.md) | Rules that apply to any agent (human or AI) working in this repo |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | General contribution rules, for every kind of change |
| [GUIDELINE_SOURCE_CODE.md](./GUIDELINE_SOURCE_CODE.md) | Code standards and the PR checklist |
| [CONTRIBUTE_SOURCE_CODE.md](./CONTRIBUTE_SOURCE_CODE.md) | Step-by-step workflow for a code PR |
