# Developer Guide

## Setup

Use Node.js 22 LTS and npm 10 (the supported engine range is recorded in
`package.json`). Git access to both submodules is required. Their configured remotes
use SSH; configure your GitHub SSH access or an appropriate local Git URL rewrite.

```powershell
git clone --recurse-submodules <repository-url>
Set-Location MainWebsiteUI
npm ci
```

For an existing checkout:

```powershell
git submodule update --init --recursive
npm ci
```

Work on a focused, short-lived branch from `main` and open a pull request into `main`.
Do not rewrite shared protected history or discard another contributor's changes.

Before changing framework code, read the relevant installed Next.js guide under
`node_modules/next/dist/docs/`. This project's installed version is authoritative;
older Next.js conventions may not apply.

### Dependency maintenance

Keep `next` and `eslint-config-next` on matching stable versions. Update dependencies
with npm and include the resulting `package-lock.json`; do not edit resolved package
metadata manually. Prefer compatible patched versions and targeted transitive updates.
Do not force framework downgrades or suppress advisories to obtain a clean audit.

Run `npm audit` and `npm run ci` after dependency changes, and verify a clean checkout
with `npm ci`. Report unresolved advisories explicitly, including packages without a
published fix.

## Preview and build

| Command | Purpose |
|---|---|
| `npm run dev:local` | Generate local content and start the interactive development server |
| `npm run dev` | Generate content and start Next development mode for the selected environment |
| `npm run content:build` | Regenerate content, settings, indexes, and theme without exporting pages |
| `npm run build:local` | Full verified local export |
| `npm run build:dev` | Full verified development export |
| `npm run build:prod` | Full verified production export |
| `npm start -- dev` | Serve the existing development export under `/MainWebsiteUI` |
| `npm start -- local` | Serve the existing local export at the root |
| `npm start -- prod` | Serve the existing production export at the root |
| `npm run verify` | Verify an existing export without rebuilding |
| `npm run clean` | Remove disposable build output |
| `npm run test:unit` | Prepare generated content and run the unit/regression suite |
| `npm run check` | Prepare once, then lint, type-check, and run unit/regression tests |

Full builds write the static site to `out/`; each build replaces the previous export.
Use the matching environment when previewing an export. The development base path is
`/MainWebsiteUI`; local and production are mounted at the root.

All full-export commands select the Webpack bundler through `next build --webpack`.
Use these wrappers locally and in CI so generation, bundling, and verification stay
consistent across environments.

The environment is selected by the script argument, then `SITE_ENV`, then `dev`.
For generation with an explicit environment in PowerShell:

```powershell
$env:SITE_ENV = "local"
npm run content:build
```

Local startup and shared content preparation generate the theme before dependent
content. Test entry points also prepare their generated prerequisites.
Development and builds share generated files and framework caches in one checkout:
stop the development server before building, cleaning, or regenerating content.
Workspace coordination rejects conflicting lifecycle operations rather than mixing
environment paths. Use separate checkouts for independent concurrent environments.
The owner record lives in `node_modules/.cache/website-tooling.lock`; dead owners are
reclaimed automatically. The guard also detects Next's `.next/dev/lock` and
`.next/lock`, including servers started outside the wrapper. Do not delete a lock
belonging to a live process. Stop that process through its owning task first.
Use `npm run dev:local -- --webpack` when selecting Webpack; it uses the same
generation and ownership checks rather than invoking Next directly.

Local and development previews can switch between real and placeholder text.
Development exports start with placeholders. Production contains real copy only.
Switchable assets include real copy even when placeholders are shown, so do not
treat the preview or `noindex` as access control.

Static preview serves the existing export. Run the
matching `npm run build:dev`, `npm run build:local`, or `npm run build:prod` first,
then select that environment with `npm start -- dev|local|prod` (choose one value).
Without an argument, preview uses `SITE_ENV`, then `dev`. It binds to localhost on
port 3000; `PORT` overrides the port.

The preview server validates that exported asset URLs match the selected environment's
base path. It serves exported `.html` routes and assets, with real 404 responses for
missing pages rather than a single-page-app fallback. It also serves Next's flattened
segment-prefetch URLs from the matching nested export files.

## Where to make changes

| Change | Edit |
|---|---|
| Short UI labels or a language descriptor | `content/languages/<code>.json` |
| Topic prose, page metadata, learning content, or an article | Canonical `library/<topic>/` Markdown |
| Homepage copy and card selection | `settings/home.json` and referenced `library/pages/*.md` |
| Environment-specific hero slides | `library/hero/{dev,prod}/*.hero.json` |
| Menus/footer destinations | `settings/navigation.json` |
| Official channels and verified contact data | `library/connect/` and `library/branches/` |
| Public action routing | `settings/public_actions.json` and the owning topic source |
| Images and allowed image hosts | `settings/{dev,prod}/images.json`, `settings/image_policy.json` |
| Theme and interaction defaults | `settings/theme.json`, `settings/ui_elements.json` |
| Announcement visibility/schedule | `settings/announcements.json` |
| Announcement wording and dated progress | Its canonical `library/announcement/` Markdown |
| Search behavior | `settings/search.json` |
| Knowledge order/default images | `settings/knowledge_sections.json` |
| Environment behavior | `config/site.yml` |
| Rendering/interactions | `src/` |
| Validation/generation/export | `build/`, `scripts/` |

Do not edit `src/gen/`, `.next/`, or exported output. Do not put display strings or
language registries in `src/`. Use `useLang()` and the generated data contracts.
Keep one owner per fact; do not copy editorial prose back into language JSON.

### Languages

Language JSON filenames are discovered automatically. Add a descriptor and translate
values using the default language's shape. Missing object keys inherit the configured
default; arrays are replaced as a whole. Do not rename keys, translate identifiers,
or copy source-language text just to hide incomplete translations.

Topic translations remain with their canonical Markdown. Follow existing schemas and
the [language contribution guide](CONTRIBUTE_LANGUAGE.md); do not register a language
in a component or invent untranslated content.

### Content and homepage

Follow [CONTRIBUTE_CONTENT.md](CONTRIBUTE_CONTENT.md) and the existing topic record
schema. Required metadata, default-language content, identifiers, and paths are
validated during generation. Preserve attribution, citations, review status, and
source IDs. Raw HTML is disabled and rendered Markdown is sanitized.

Homepage lists resolve `library/pages/` filenames: top six, icons five, bottom six,
and explore three. Card prose and images belong in page-reference Markdown. The
generated `remidies_carousel` selects three distinct remedies once per generation;
keep at least four eligible articles and do not add that generated list to settings.
Keep hero slide selection separate from card curation.

Keep all five `icon_carousel` links visible together, without horizontal scrolling,
at widths of 320px and above. Use equal-width grid columns, wrapping labels, and
touch targets of at least 44px. Check both supported languages at phone, tablet,
touch-laptop, and desktop widths; this strip is distinct from `bottom_carousel`.

For Yajna figures, update the count and required `pages.local_copy.yajna_as_of_date`
together in the announcement Markdown. All
translations must use the same valid ISO date. Never substitute the build date.
Panchanga's localized `panchanga_notice`
lives in its topic Markdown. Keep that test-data note and knowledge review status
visible until the underlying content is genuinely verified. Projects show both the
article's editorial `status` and its operational project badge; related cards retain
authored status, and homepage remedy cards use that status as their footnote.

### Actions and media

Edit public action destinations in `settings/public_actions.json` and official
channel records in `library/connect/`. Preserve the complete configured payment URL,
including its query parameters; its QR is built from the same source.
Material enquiries use the localized catalog in
`library/donations/pages/donation.md` and the configured email destination.
Do not use broadcast channels for private enquiries or imply message delivery.

Image targets pass through `build/image-resolution.mjs`. Absolute HTTPS targets
bypass the configured base; relative paths, including leading-slash paths, are
appended to the media-directory base. Keep both environment aliases valid and align
remote hosts with the image policy. Record rights/provenance before adding assets.

Horizontal rails must retain touch scrolling, desktop dragging, interaction pause,
and reduced-motion behavior when settings or layouts change. Use the shared
settings-aware scroll API. Canceled touches
resume through the normal delay, and hidden/nonmoving rails do not schedule
continuous animation work. Keep hero pause/resume controls separate from linked slides.

Use shared category tones, featured/collection presentation variants, and focus
treatments rather than equivalent one-off styles. Policy text and utility controls
use shared readable text and touch-target roles. Optional language descriptor
`font_family` selects a theme stack consistently for body text and font utilities.

## Submodule workflow

`library/` and `settings/` are separate Git repositories. Review changes
inside each repository independently. Publish the reviewed submodule commits first,
then stage their updated references in the website repository. A parent commit cannot
publish uncommitted submodule files.

Do not advance a submodule to an unpublished commit. When reviewing a pull request,
check both the reference change and the referenced repository's actual diff.

## Validation

Use the smallest relevant tests while developing, then run the full gate before
requesting review:

```powershell
npm run check
npm run build:dev
npm run build:prod
# Equivalent full gate:
npm run ci
```

Build-tool and regression tests live in `build/test/`; production build scripts
remain directly in `build/`. The unit runner supports focused files, for example:

```powershell
node --test build/test/image-resolution.test.mjs
```

### Responsive and interaction checks

Check mobile portrait and landscape, tablet portrait and landscape, hybrid touch
laptops, and desktop widths. Include both sides of navigation breakpoints, 200%
text sizing, long translated labels, and short viewports with a virtual keyboard.
Compact/full navigation switches at `80rem`; check both `1279px` and `1280px`
at the default browser text size, as well as the tablet-landscape `1024px` case.
Browser viewport resizing does not prove touch or physical-device behavior; identify
which input modes and devices were actually tested.

- Open compact navigation, cross the full-header breakpoint, and verify scrolling.
- Operate every submenu with touch/click and Tab, Enter/Space, and Escape.
- Check dialog height, close controls, focus containment/restoration, and field names.
- Verify announcements hide during dialogs and return afterward unless dismissed.
- Select and leave a Bhakti reader using only the keyboard.
- Check photo pinch zoom independently from single-finger swipe and mouse dragging.
- Toggle reduced motion while the page is open; decorative loops stop and manual
  controls remain usable. Test interrupted touch gestures and paused/hidden rails.
- Switch preview catalogs before and after search indexes finish loading.
- Check denied browser storage: language and preview selection remain usable without
  persistence.
- Inspect initial Learn, Learn-subject, and Panchanga titles/descriptions, not only
  the rendered headings.

Read the build-verification output, not just its exit code. Placeholder-default
HTML and manifest checks detect exact default-language prose of at least 30
characters and configured brand terms. They do not prove the absence of every
short, altered, or non-default-language literal. Review source for display strings.

### Reproduce a committed checkout

A local build can accidentally use ignored or uncommitted files. Confirm required
build scripts are tracked, and check a clean clone of the candidate commit:

```powershell
git ls-files build scripts config
git clone --recurse-submodules . .ci-check
Set-Location .ci-check
npm ci
node build/build.mjs dev
```

Use an unused project-local scratch path, do not commit it, and remove it when done.
A clone only includes committed work; it does not validate staged or unstaged edits.
Ensure submodule references are published and available to CI before relying on this
check.

## Deployment

GitHub Actions verifies pull requests and `main` with lint, type checking, unit tests,
and development/production builds. The development deployment workflow publishes
reviewed `main` to GitHub Pages under the configured base path.

Deploy the verified static export, not `.next/` or a development server. Production
uses the root base path and the canonical URL in `config/site.yml`; maintainers must
confirm domain ownership, DNS, HTTPS, and the hosting binding. Never place hosting
credentials or service secrets in public settings.

## Troubleshooting

- **Missing library/settings files:** initialize submodules and confirm the expected
  commits are checked out.
- **Missing package or tool:** install from the lockfile with `npm ci`; do not patch
  generated files to bypass a missing dependency.
- **Assets or links fail only in dev:** check the `/MainWebsiteUI` mount path and
  preview/build environment match.
- **Content edits are absent:** regenerate content or restart `npm run dev:local`.
  Search, hero, and knowledge changes require their generated data too.
- **Invalid metadata or duplicate authority:** fix the canonical source identified
  by the generator; do not suppress validation or duplicate the same fact elsewhere.
- **Placeholder verification fails:** inspect rendered output and the owning source;
  look for hardcoded prose, metadata, labels, or an incorrect content variant.
- **Works locally but fails CI:** inspect tracked files and published submodule
  commits, then reproduce the committed checkout.

Update [ARCHITECTURE.md](ARCHITECTURE.md) for structural changes and this guide for
changed contributor steps. Document existing behavior and explicit restrictions;
exclude historical implementation notes, removed or unimplemented features, and
duplicated configuration values. State explicitly which checks were and were not run.
