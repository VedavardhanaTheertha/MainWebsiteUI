# Developer Guide

This is the setup, workflow, and practical how-to reference. For *what the project is,
why it's built this way, and its known gaps*, see
[ARCHITECTURE.md](./ARCHITECTURE.md).

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
[§8.1–§8.3](#81-changing-site-text) for exactly how.

If you want to *see* your change rendered before opening the PR, follow the full-setup
path below — §4 gets you a running preview in a few commands.

### Full-setup path

Anything under `src/`, `build/`, `scripts/`, or `config/` needs a local environment.
Continue with §2.

---

## 2. Prerequisites

| Requirement | Version | Verified from |
|---|---|---|
| Node.js | **20.9 through 24.x** (CI uses 22) | `package.json` engines and workflow setup |
| npm | **10 or newer** | `package.json` engines/packageManager |
| Git | any recent version | — |

The package manager declaration is npm 10.9.2; `npm ci` is the reproducible install.

---

## 3. Getting the code; branch model

```bash
git clone --recurse-submodules https://github.com/VedavardhanaTheertha/MainWebsiteUI.git
cd MainWebsiteUI
```

(The address above is `origin` in this checkout — verified with `git remote -v`. If
you've forked the repo, clone your fork instead.)

Existing checkouts must run `git submodule update --init --recursive`. The Bhakti
generator requires the library submodule and fails with this instruction when absent.

### Branch model

`main` is the single canonical branch. Use a short-lived branch for each change, open a
pull request into `main`, and delete the branch after merge. Both the permanent GitHub
Pages preview and the future production deployment build reviewed `main` revisions with
different environment settings.

Branch and PR conventions live in [`CONTRIBUTING.md`](../CONTRIBUTING.md) and
[`GUIDELINE_SOURCE_CODE.md`](./GUIDELINE_SOURCE_CODE.md). §9 below adds the
build-specific checks this project needs on top of them.

---

## 4. Previewing the site

### Hosted development preview

**You do not need to install anything to review the site.**

| | Link |
|---|---|
| **Development preview** | https://vedavardhanatheertha.github.io/MainWebsiteUI/ |
| **Build status** | [GitHub Actions](https://github.com/VedavardhanaTheertha/MainWebsiteUI/actions) |

Every push to `main` rebuilds and republishes the permanent preview automatically. Open
the preview to review the latest merged revision without a local setup.

The hosted preview deliberately shows placeholder text such as
`en·hero title — content goes here` instead of real wording. This is intentional:

- It keeps the preview out of search results so it cannot compete with the live site.
- It makes accidental hardcoded content visible and allows the build to detect it.

Review layout, spacing, images, colours, and navigation in the preview. Read the actual
wording in [`content/languages/en.json`](../content/languages/en.json). Images remain
real in the preview; only text is substituted.

### First local run

```bash
npm ci
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

| | |
|---|---|
| **Scope** | The website's frontend source code, build, and contributor documentation |
| **Content** | Devotional and library content comes from [WebsiteLibrary](https://github.com/VedavardhanaTheertha/WebsiteLibrary) |
| **Languages** | Languages are discovered by adding one correctly structured language file |
| **Pages** | Filesystem routes plus article routes discovered from content at build time |
| **Stack** | Next.js 16, React 19, and Tailwind CSS 4, exported as static files |
| **Hosting** | GitHub Pages preview; Cloudflare Pages production is not yet connected |

```
content/       all user-facing text and blog posts — the only folder most
               contributors touch (content/languages/*.json, content/blog/<slug>/)
config/        site.yml — environments, build flags, brand terms
docs/          this guide, ARCHITECTURE.md, and the
               CONTRIBUTE_*/GUIDELINE_* contributor guides
build/         build.mjs (runs the full build) and verify.mjs (checks the output)
scripts/       generate-content.mjs — turns content/ into src/gen/content.ts
src/app/       Next.js routes — structure only, never content
src/components/  reusable UI — structure only, never content
src/lib/       shared logic: content-types.ts, nav-types.ts, scheduler.ts
src/context/   LanguageContext.tsx — the useLang() provider (see §8)
src/gen/       generated website data — gitignored, recreated by each dev/build command
public/        images and static files served as-is
library/       required submodule → WebsiteLibrary (Bhakti source content)
test_media/    recursively initialized submodule → WebsiteTestMedia
.github/workflows/deploy-dev.yml  thin CI wrapper around build/build.mjs
```

Full rationale for this layout: [ARCHITECTURE.md §4](./ARCHITECTURE.md#4-repository-layout).

---

## 6. Build

CI runs the scripts under `build/`; developers can run the same pipeline locally.

| File | Purpose |
|---|---|
| `build.mjs` | Runs the whole build: clean → generate → export → normalize canonicals → verify |
| `clean.mjs` | Removes stale outputs before generation |
| `markdown.mjs` | Parses and sanitizes blog and Bhakti Markdown |
| `write-canonicals.mjs` | Derives each page's production canonical from its exported HTML path |
| `verify.mjs` | Checks the built output before it is published |

### Why build logic lives outside CI

`.github/workflows/deploy-dev.yml` and `.github/workflows/verify.yml` are thin wrappers
around `build.mjs`. This keeps the build portable and provides two practical benefits:

- Build problems can be reproduced locally with the same script CI invokes, without
  pushing commits merely to test the pipeline.
- Changing CI providers requires replacing a small workflow wrapper rather than
  reimplementing the build pipeline.

### Commands

| Command | Runs | Produces |
|---|---|---|
| `npm run content:build` | Bhakti and website content generators | `src/gen/`, `public/robots.txt` |
| `npm run clean` | Delete stale generated output | clean working build outputs |
| `npm run typecheck` | Generate content, then `tsc --noEmit` | pass/fail |
| `npm run test:unit` | Content utility and Markdown security tests | pass/fail |
| `npm run dev` | content:build, then `next dev` | a running dev server |
| `npm run build:dev` | `node build/build.mjs dev` — full pipeline: generate content → `next build` → verify | `out/` (dev/placeholder build) |
| `npm run build:prod` | same pipeline with `SITE_ENV=prod` | `out/` (production/real-content build) |
| `npm run verify` | `build/verify.mjs` against an existing `out/` | pass/fail report, no rebuild |
| `npm run lint` | ESLint | lint errors/warnings |
| `npm run ci` | Lint, typecheck, tests, and both builds | all local gates |

`npm run build:dev` / `build:prod` are exactly what CI runs — see
[`build/build.mjs`](../build/build.mjs). Run one locally before pushing rather than
using a push to test the pipeline.

### Environment variable

`SITE_ENV` selects the environment (`dev` or `prod`, defined in `config/site.yml`).
It defaults to `dev` when unset — showing real content is an explicit opt-in, never
the default. `npm run build:dev` / `build:prod` set it for you via their `node
build/build.mjs <env>` argument; set it yourself only when running `next dev` or
`next build` directly.

The equivalent direct invocation is:

```bash
SITE_ENV=dev node build/build.mjs
```

On Windows PowerShell:

```powershell
$env:SITE_ENV = "dev"; node build/build.mjs
```

Valid values come from `config/site.yml`. Passing the environment as an argument, as
in `node build/build.mjs prod`, takes precedence over `SITE_ENV`.

### Output verification

`build/verify.mjs` checks that:

1. The generated web manifest uses environment-correct paths.
2. `robots.txt` matches the selected environment's indexing policy.
3. Non-production pages carry a `noindex` directive.
4. Every non-error HTML file has exactly one production canonical matching its route;
  generated error documents have none.
5. Non-production HTML and the manifest contain no exact default-language JSON prose
  of at least 30 characters.
6. Institution brand terms do not leak into placeholder HTML or the manifest.
7. `sitemap.xml` contains one canonical production URL per non-error exported page.

The content comparison is an important backstop, not a complete source lint. It catches
exact default-language JSON prose at least 30 characters long and configured brand terms
in rendered HTML and the manifest. Short, changed, non-default-language, client-only,
or unrendered literals may evade it. Those matches fail when
`build.fail_on_hardcoded_content` is enabled; source review remains required.

Every full build removes `.next/`, `out/`, `dist/`, `src/gen/`, and the generated
`public/robots.txt` before regeneration. The library submodule is required; initialize
all submodules with `git submodule update --init --recursive`.

### Common failures

| Symptom | Cause |
|---|---|
| `SITE_ENV="…" is not defined in config/site.yml` | Typo in `$env:SITE_ENV`, or a new environment referenced before it's added to `config/site.yml` |
| `config/site.yml is missing` | Running the build from the wrong working directory, or the file was deleted |
| Build succeeds locally, fails in CI | You built against uncommitted files — see the CI-reproduction note in `AGENTS.md` and run the clean-clone check below |
| `[verify]` reports real content in a dev build | Text is hardcoded in a `.tsx` file instead of `content/languages/en.json` — see §8 |
| `[verify]` reports brand terms in a dev build | Same cause — a brand term from `config/site.yml`'s `brand_terms` list leaked into a non-production page |
| A blog post silently fails the build | Missing/invalid `date` in `meta.json`, or no `# Title` heading in `en.md` — this one fails rather than warns, deliberately (see [ARCHITECTURE.md §5.2](./ARCHITECTURE.md#52-blog-and-article-content)) |

Both content-leak cases fail the build because `build.fail_on_hardcoded_content` is
enabled in `config/site.yml` — see §7.

To reproduce exactly what CI checks out (catches the class of bug where a working
directory has files git doesn't track):

```bash
git clone . /tmp/ci-check && cd /tmp/ci-check && npm ci && node build/build.mjs dev
```

When local cloning is intentionally disallowed, use tracked-file and ignore checks plus
`npm ci`, `npm run clean`, and all gates; this is close but cannot perfectly model a
fresh checkout.

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

- `build.fail_on_hardcoded_content` — enabled; real prose and brand-term leaks in a
  placeholder build are fatal.
- `build.brand_terms` — words that must never appear on a non-production page, checked
  at any length (unlike general prose, which needs 30+ characters to count — see
  `build/verify.mjs`).
To add a third environment, add an entry under `environments:` in `config/site.yml` —
no code change needed (`build/build.mjs`, `next.config.ts`, and
`scripts/generate-content.mjs` all read the file at build time).

---

## 8. Content and i18n rules for developers

**Content is data; code is structure.** Pages and components do not contain display
wording or registries of languages and articles. The build discovers content from the
filesystem, allowing contributors to add a language or article without changing code.

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
  `config/site.yml`, and fails the build on any hit (§7).
- Before claiming a change is content-clean, run `npm run build:dev` and read the
  `[verify]` output — a passing type-check does not catch a hardcoded string.

If you find existing hardcoded text while working nearby, migrating it into
`content/languages/en.json` is welcome — see the tracked count in
[ARCHITECTURE.md §11](./ARCHITECTURE.md#11-known-gaps-and-planned-work) for what's
still outstanding.

### 8.1 Changing site text

All display text lives in `content/languages/`, with one JSON file per language:

1. Open `content/languages/en.json`.
2. Find the key whose value you want to change.
3. Edit only the value and save the file.
4. Restart the development server if the generated content does not refresh.
5. Update translated values where appropriate so languages do not drift apart.

Never edit display text inside `src/`. If text is hardcoded in a component, move it to
the default language file and consume it through the generated content API.

### 8.2 Adding a language

1. Copy `content/languages/en.json` to `content/languages/<code>.json`, using the
  standard language code for the file name.
2. Translate values without changing their keys or structure.
3. Set the language's own display name near the top of the new file.
4. Run `npm run dev` and select the language in the language switcher.
5. Submit the language file as a focused pull request.

No switcher, registry, component, or type file needs to be edited. The generator scans
the directory and discovers language files automatically.

Partial translations are valid. Missing keys fall back to the default language and are
listed during generation. Delete untranslated keys instead of copying default-language
values when you want the fallback report to accurately show remaining work.

### 8.3 Adding a blog post or news item

1. Create `content/blog/<url-slug>/`. Use lowercase words separated by hyphens; the
  directory name becomes the URL segment.
2. Add `meta.json` with at least a valid ISO date. Optional shared fields include the
  hero image and tags:

  ```json
  {
    "date": "2026-07-14",
    "hero": "/articles/<descriptive-file>.webp",
    "tags": ["news", "projects"]
  }
  ```

3. Add `en.md` with a level-one title and article body:

  ```markdown
  # Article title

  The first paragraph goes here.
  ```

4. Put new optimized article media under `public/articles/` and reference it as
  `/articles/<descriptive-file>.webp`. Older assets remain directly under `public/` or
  existing subdirectories such as `public/slide/`; `public/media/` does not exist.
5. Optionally add a Markdown file for each translation using its language code.
6. Add every new content or media asset to `ASSET_PROVENANCE.md`.
7. Run `npm run build:dev` and `npm run build:prod`.

The listing and article route are generated automatically; no page or menu registration
is needed. A valid date and level-one title are mandatory. Raw HTML is escaped, generated
HTML is sanitized, and links are limited to safe relative URLs plus `http`, `https`, and
`mailto`. Script, data, and protocol-relative URLs are rejected.

### 8.4 Placeholder and real-content previews

Development uses generated placeholders so search engines cannot index a duplicate of
the production site and so hardcoded content becomes detectable. Placeholders are padded
to approximately the real text length, making them suitable for layout review.

Use the default `npm run dev` for layout work. To review actual wording locally, use:

```bash
SITE_ENV=prod npm run dev
```

On Windows PowerShell:

```powershell
$env:SITE_ENV = "prod"; npm run dev
```

---

## 9. Branches, commits, PR checklist

Read [`CONTRIBUTING.md`](../CONTRIBUTING.md) and
[`GUIDELINE_SOURCE_CODE.md`](./GUIDELINE_SOURCE_CODE.md) first — they cover the general
rules. What follows is the build-specific part, from `AGENTS.md` and the maintenance
rules in `ARCHITECTURE.md` §12.

- Branch from `main`, with a descriptive name like `feature/add-events` or
  `fix/content-links` (see §3).
- Keep content changes (`content/`) and code changes (`src/`, `build/`, `scripts/`) in
  separate PRs where practical — a translator's PR should not need a code review.
- **If your change alters structure, the content system, environments, or the build
  pipeline, update `docs/ARCHITECTURE.md` in the same PR.**
- **If your change alters how a contributor does something day-to-day, update
  `docs/DEVELOPER.md` in the same PR.**
- Before opening the PR, run `npm run ci` and read both `[verify]` reports, not just the
  exit code. For anything you're not certain built from committed files, also run the
  clean-clone check in §6.
- No file under `src/` should name a language code or a blog post slug (§8) — grep for
  the language codes in `content/languages/` and the slugs in `content/blog/` if
  you're unsure whether you've introduced one.

`CONTRIBUTING.md` is at the repository root and is the canonical general checklist.
The repository's pull-request template records validation, documentation, security,
accessibility, and provenance considerations for reviewers.

---

## 10. Tests and the automatic build check

Automated checks are blocking in CI:

- `npm run lint` — ESLint (`eslint.config.mjs`).
- `npm run typecheck` checks TypeScript after generating content.
- `npm run test:unit` covers metadata validation and Markdown sanitization payloads.
- Playwright is intentionally not installed: there is no reliable e2e suite yet, and
  the project does not expose a fake `test:e2e` script.
- `build/verify.mjs` (run via `npm run verify`, or automatically inside `build:dev` /
  `build:prod`) is the closest thing to an automated check today. It inspects the
  exported `out/` directory and confirms:
  1. `robots.txt` matches the environment's indexing policy
  2. non-production pages carry `noindex`
  3. non-production pages contain no real prose from `content/languages/en.json`
  4. non-production pages contain none of `config/site.yml`'s `brand_terms`

  Checks 3 and 4 fail the build (`build.fail_on_hardcoded_content: true` — see §7).
  A `prod` build with `content_mode: real` skips those placeholder-specific checks by
  design.

Run `npm run ci` before a PR. CI performs the same lint, typecheck, unit-test, and
verified-build gates.

---

## 11. Deployment

| Branch | Target | How | Status |
|---|---|---|---|
| `main` | GitHub Pages preview | `.github/workflows/deploy-dev.yml`, placeholder build on merge and daily | ✅ working |
| `main` | Cloudflare Pages | — | ⏳ designed for, not yet connected |

The permanent preview always represents `main`; feature branches are validated by the
pull-request workflow but do not replace the shared preview. The Pages workflow runs:

- After every push to `main`, publishing the newly reviewed revision.
- Daily at 21:00 UTC from the default branch (`main`). Today this is a build canary.
  Once `src/lib/scheduler.ts` is used by rendered content, it will also refresh
  date-sensitive static output.
- Manually from the Actions tab. Checkout is explicitly pinned to `main`, so a manual
  run cannot accidentally publish an unreviewed feature branch.

The cron expression in `.github/workflows/deploy-dev.yml` is the sole schedule source;
environment configuration does not duplicate workflow timing.

There is no workflow file in this repo for a production/Cloudflare deploy — only
`deploy-dev.yml` exists under `.github/workflows/`. Cloudflare Pages connects directly
to a GitHub repo through its own dashboard rather than a committed workflow file, so
there's nothing to inspect here until that connection is made.

TODO(bawse): once Cloudflare Pages is connected, document the actual trigger (push to
`main`? manual promote?) and whether it runs `build:prod` or something Cloudflare
configures itself.

Development is trunk-based: create a short-lived branch from `main`, open a pull
request, obtain maintainer review, and merge only after lint, typecheck, unit tests, and
both builds pass. Roll back with a reviewed revert or a known-good artifact
redeployment; never rewrite shared history.

The GitHub Pages deploy job deliberately has no `actions/configure-pages` step — see
the explanation in `deploy-dev.yml` — because it fails when Pages is not enabled on the
repository, which would make a correct build look broken.

---

## 12. Troubleshooting

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

For content images, confirm the file is under `public/`, reference it without the
`public` prefix (new article media uses `/articles/<file>`), and match filename
capitalization and extension exactly. Windows may hide a capitalization error that
fails on Linux.

**The build reports missing language keys.**
This is informational. Missing keys fall back to the default language; the report shows
which translations remain.

**A new blog post does not appear.**
Confirm that it is directly under `content/blog/`, has `meta.json`, contains at least
`en.md`, uses a valid `YYYY-MM-DD` date, and begins with a level-one title. Restart the
development server because new content directories are discovered at startup.

**Content changes do not appear.**
Content is generated at startup. Stop the development server and run `npm run dev`
again.

---

## 13. Project boundary

This repository contains the frontend and static site only. It renders forms and static
lists up to the submit action, but does not implement:

- Volunteer-form processing.
- Payment or donation processing.
- Storage or email delivery of feedback submissions.
- Live or user-specific data.
- Authentication.

Those capabilities belong to backend services. A change to behavior after form
submission is therefore a backend request rather than a frontend implementation here.

---

## 14. Keeping documentation current

Update documentation in the same pull request as behavior. Structural, content-system,
environment, and build changes update [ARCHITECTURE.md](./ARCHITECTURE.md); practical
setup and contributor workflow changes update this guide. Documentation that disagrees
with the implementation is a defect.

---

## 15. Related docs

| Doc | For |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and the reasoning behind it |
| [README.md](../README.md) | Project landing page |
| [AGENTS.md](../AGENTS.md) | Rules that apply to any agent (human or AI) working in this repo |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | General contribution rules, for every kind of change |
| [GUIDELINE_SOURCE_CODE.md](./GUIDELINE_SOURCE_CODE.md) | Code standards and the PR checklist |
| [CONTRIBUTE_SOURCE_CODE.md](./CONTRIBUTE_SOURCE_CODE.md) | Step-by-step workflow for a code PR |
