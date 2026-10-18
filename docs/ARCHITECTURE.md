# Architecture

## 1. Purpose and boundaries

This is the multilingual, statically exported website for Shri Shiroor Matha.
Next.js and React provide page structure and interactions; reviewed Markdown,
language JSON, and settings provide visitor-facing content. The deployed application
consists of static files.
External services handle registration, payments, and official communication.

Contributor commands are in [DEVELOPER.md](DEVELOPER.md).

## 2. Source ownership

| Source | Responsibility |
|---|---|
| `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/context/` | Routes, rendering, interactions, and typed runtime helpers |
| `content/languages/<code>.json` | Language descriptors, short UI labels, and media catalogs |
| `library/` | Canonical topic Markdown, devotional corpus, page-reference metadata, and environment-specific hero groups |
| `settings/` | Homepage composition, navigation, images, theme, search, and interaction behavior |
| `config/site.yml` | Default language, canonical production URL, environment matrix, and verification policy |
| `build/`, `scripts/` | Validation, content generation, export, preview, and output verification |
| `build/test/` | Node unit and regression tests for build tools, content contracts, and runtime behavior |
| `public/` | Tracked static assets |
| `src/gen/` | Disposable generated data, search indexes, and theme output; never edit manually |

`library/` and `settings/` are separate Git submodules. A website commit records their
commit references, not uncommitted files inside them. Publish reviewed submodule
changes before updating the website references.

### Content is data

Do not hardcode visitor-facing prose or a language list in `src/`. Components obtain
localized content through `useLang()` and generated data. A contributor must be able
to add a language or edit an article without registering it in a component.

Each fact has one canonical owner. Page introductions, metadata, and editorial
sections belong with their topic Markdown, rather than in duplicate UI JSON or
unused Markdown bodies. Short reusable controls belong in language JSON. Homepage
copy and composition belong in settings. Do not invent translations, dates,
contact details, enrollment links, or institutional claims.

The legal and policy documents retain their reviewed wording; changing a layout or
content source is not authorization to rewrite those policies. Preserve applicable
licenses, required attribution, and article citations.

## 3. Languages and editorial content

The generator discovers `content/languages/*.json`; the filename supplies the language
code. `_language` supplies human-readable switcher labels. The default comes from
`site.default_language` in `config/site.yml`, not a hardcoded runtime assumption.
Its optional `font_family` selects a theme font stack for the active script;
the same selection applies to body text, headings, and font utilities. Hero title
maps cover the discovered languages and use the configured default for missing copy.

Missing translated object keys inherit default-language values. Arrays are complete
replacement values, not item-by-item merges. The default language must be complete.
Library translation discovery and fallback follow the same configured language set;
missing translations are not a reason to fabricate a body.
Language, image-treatment, and preview preferences are persisted when browser storage is available;
otherwise they remain usable in memory for the current page session.

The Developer options page is exported only for `local` and `dev`. Its localized
entry is appended after the configured menu entries in both real and placeholder
catalogs; it is the last entry in desktop and compact navigation. The page contains
the copy-preview selector and an image-treatment checkbox. Local copy defaults to
real; development copy defaults to placeholders. Reset restores these build defaults
and disables the image treatment without changing the selected language.

`build/developer-options.mjs` owns the technical route and preference configuration.
The page uses `page.preview.tsx`; Next configuration recognizes the `preview.tsx`
extension only in local/dev while retaining all standard page extensions.
Production never registers the route. The page also has a defensive not-found guard.
The utility page is noindex and excluded from the public route inventory and sitemap.
Export verification checks its environment-specific presence separately.
Developer control copy is preserved in placeholder catalogs so controls remain readable.
Production exports neither this page nor its menu entry and always uses real copy,
regardless of the saved copy preference.

The image preference uses `site-image-treatment` in per-origin `localStorage`
(`on` or `off`, default `off`). The root preference subscriber updates
`data-image-treatment` after hydration; the server snapshot is always off.
The standalone hero reads the same key and follows cross-document storage events.
Production supports this browser-local image override without exposing a developer
page or enabling placeholder catalogs. These preferences are not runtime environment
variables, secrets, or an authorization mechanism.

Structured page copy uses multilingual frontmatter, for example:

```yaml
---
kind: localized-copy
fields:
  pages.example.title:
    en: Example title
---
```

The dotted field names are the generated dictionary contract. Copy belongs in the
appropriate `library/<topic>/` source, not simultaneously in its frontmatter, body,
and language JSON. Active shared control and editorial namespaces are `ui` and
`editorial`.

### Canonical collections

| Collection | Canonical source and important rules |
|---|---|
| Bhakti | `library/dasasahitya/*.md`; preserve source identifiers, attribution, and verse layout |
| Sevas | `library/sevas/*.md`; localized offerings and language-specific guideline bodies |
| Material enquiries | `library/donations/pages/donation.md`; one localized catalog preserving the selected material names and prices |
| Events | `library/events/`; validated calendar dates and metadata drive catalog/detail pages; malformed records fail generation |
| Guru Parampara | `library/parampara/`; numeric filename prefixes determine order; translations inherit missing optional facts |
| Learn | `library/learn/index.md` and subject Markdown; collection order, page labels, suggested paths, and subject metadata live together |
| Branches and official channels | `library/branches/` and `library/connect/`; generated data supplies locations and shared official destinations |
| Institutional and policy pages | Corresponding topic Markdown, including `library/general/` |
| Announcement | `library/announcement/krishna-mantra-lekhana-yajna.md`; one owner for popup, associated page copy, and metadata |
| Knowledge sections | Topic Markdown in `library/mantra/`, `shastra/`, `jnana/`, `dharma/`, `projects/`, `stories/`, `articles/`, `symbolism/`, `remedies/`, `science/`, and `pilgrim/` |

Knowledge section routes and supported IDs are defined in
`build/library-sections.config.mjs`. Their display order and default image references
come from `settings/knowledge_sections.json`. Section-specific schemas validate
metadata such as project status or verified outcomes; use existing records and
`build/knowledge-schema.mjs` as the field reference. Collection index documents are
not ordinary articles.

Markdown is rendered with raw HTML disabled and sanitized before use. Source IDs,
required default-language content, metadata types, and safe paths are validated at
generation time. Authored knowledge/review status must remain visible to readers;
sample or unreviewed content must not appear to be verified institutional guidance.

### Dated and temporary information

The Yajna progress figures are an authored snapshot.
Update the count and `pages.local_copy.yajna_as_of_date` together in the announcement
Markdown. The date must be valid and identical across translations; rebuilding must
not substitute today's date. Panchanga currently carries a temporary test-data note.
Its localized `panchanga_notice` belongs in Panchanga topic Markdown. Keep that
limitation visible until verified production data replaces it. Project collections
show editorial article status separately from operational project status; related
cards retain authored status, and homepage remedy footnotes expose it too.

## 4. Homepage and navigation

`settings/home.json` selects page-reference records from `library/pages/`. The
homepage has six top cards, five icon cards, six bottom cards, and three explore
cards. Card titles, descriptions, images, types, destinations, and footnotes belong
in those multilingual Markdown records, not repeated in settings.

The five `icon_carousel` links use equal-width grid columns without horizontal
scrolling. Icons scale from 44px on narrow phones to 54px on larger screens, and
localized labels wrap within their columns without truncation. The six-card
`bottom_carousel` is a separate collection.

The generated `remidies_carousel` contains three distinct remedies drawn from
`library/remedies/` per content generation. Selection is shared by all languages and
content variants for that generation; keep at least four eligible remedy articles.
The existing key spelling is part of the data contract.

Environment-specific hero groups live in `library/hero/{dev,prod}/*.hero.json`.
Local preview uses the development groups. Preserve their selection and ordering
when changing image resolution or controls.

`settings/navigation.json` owns menus, route destinations, footer policy links, and
official social `connectId` references. Labels are localized separately. Only concrete
active routes belong in page references, navigation, and sitemaps; a metadata record
does not create a route.

Compact navigation serves widths below `80rem`, including intermediate
tablet/small-laptop widths; full navigation and its utility bar start at `80rem`.
Menu groups
support touch/click and keyboard disclosure, expose their expanded state, and close
on Escape. Crossing into full navigation closes an open compact menu and releases
its scroll lock.

Learn and Panchanga use server route wrappers for content-owned metadata and client
components for language-aware interactions. Each Learn subject supplies its own
title and description rather than inheriting homepage metadata.

## 5. Images, media, and interactions

Environment image maps in `settings/{dev,prod}/images.json` resolve stable aliases.
`build/image-resolution.mjs` is the shared resolution rule:

- An absolute HTTPS target bypasses the media base.
- A relative target is appended to the configured media-directory base, including
  when it begins with `/`. It does not replace the base directory.
- Unsafe schemes, traversal, credentials, and malformed targets are rejected.

`settings/image_policy.json` separately controls framework image optimization and
allowed remote hosts. `settings/theme.json` owns theme tokens; the generator emits
`src/gen/settings/theme.css`. Layout and responsive behavior remain source code.
Category tones share semantic mappings across event rails, lists, and badges.
Content photographs, posters, portraits, and thumbnails use
`src/components/presentation/ContentImage.tsx`. By default, foreground images cover
their frames and the decorative layer is hidden. Enabling the browser-local image
option contains the sharp foreground over a statically blurred and darkened copy
of the same source; foreground padding preserves image edges inside rounded frames.
In both modes, captions, badges, and navigation controls
sit outside the artwork; foreground images do not zoom. Natural-size annotated
illustrations retain their image-relative annotation coordinates. Logos, QR codes,
functional icons (including failed-image placeholders), and full-screen album playback
retain their own presentation.
The standalone generated hero uses the same preference-gated two-layer treatment.
Shared featured/collection presentation variants preserve their distinct layouts
while keeping spacing, controls, focus, and result states consistent. Policy text
uses a readable shared size; utility controls have touch-friendly targets.

Media albums are built from language catalog data. Use stable explicit IDs
and valid image/video metadata; do not infer publication rights from remote availability.

`settings/ui_elements.json` supplies collection pagination, reader controls, viewer
boundaries, default filters/sorting, upcoming-event limits, slideshow timing,
interaction delays, and horizontal auto-scroll behavior. Horizontal rails preserve
manual touch scrolling, desktop dragging, interaction pause/resume, and reduced-motion
preferences. Turning autoplay off does not disable manual navigation. Runtime callers
use the shared settings-aware scroll API.
Rails suspend animation work when movement is unavailable, recover from canceled
touches, and preserve manual input. Decorative loops stop under reduced motion.
Hero autoplay has a separate pause/resume control and responds to motion-preference
changes while the page is open.

Dialogs own focus, restore it on close, and keep controls reachable in short
viewports through constrained panels and scrollable content. Photo viewing permits
pinch zoom without treating multi-touch as item navigation. Reader transitions move
focus into the reading view and restore it to the originating result on return.
Announcements remain visually on top during normal browsing, are temporarily hidden
while a dialog is open, and return afterward unless dismissed.
Dialog and menu scroll locks are reference-counted so closing one overlay cannot
release another overlay's active lock.

Search uses MiniSearch with generated indexes and runtime loading where appropriate.
`settings/search.json` supplies matching options and collection field weights.
Content, generated indexes, and runtime searches must use the same configuration.
Runtime indexes follow the active catalog; switching copy mode invalidates stale
indexes and ignores asynchronous completions for the previous catalog.

## 6. Environments

`config/site.yml` is authoritative:

| Environment | Base path | Content | Indexing |
|---|---|---|---|
| `local` | Site root | Switchable real/placeholder copy | Disabled |
| `dev` | `/MainWebsiteUI` | Switchable; exported default is placeholder | Disabled |
| `prod` | Site root | Real copy | Enabled |

The environment is selected by the build argument, then `SITE_ENV`, then `dev`.
Internal links and static assets honor the configured base path.

Switchable previews include both copy variants in public assets. Placeholder output
and `noindex` are testing/search controls, not confidentiality boundaries. Production
canonical URLs use `site.production_url`; maintainers must verify DNS, HTTPS, and the
hosting custom-domain binding before launch.

Development/local synthetic event copies are controlled by
`settings/dev/synthetic_events.json`. Originals remain unchanged, and production does
not generate synthetic copies.

## 7. Build and deployment

`package.json` declares dependencies and `package-lock.json` records their resolved
versions for `npm ci`. Next.js and its ESLint configuration use matching stable
versions.

The deployment entry point is `build/build.mjs`. It cleans generated output, builds
theme/settings, media, Bhakti, Sevas, Events, and knowledge sections, generates the
remaining website content, runs Next's static export, normalizes canonical URLs, and
verifies the result. Shared preparation includes theme generation for local
development as well as builds. Test entry points prepare required generated content;
CI can reuse preparation across lint, type checking, and tests while full environment
builds remain independent. `next.config.ts` enables static export. The deployment
entry point selects Webpack with `next build --webpack` for every export environment.

The exported site is written to `out/`. Only one environment's export occupies that
directory at a time. `npm start -- dev|local|prod` (choose one environment) serves the
matching existing export with its configured mount path; it does not regenerate
content. Selection defaults to `SITE_ENV`, then `dev`. Preview validates exported
asset base paths, serves clean exported HTML routes and assets, and returns real
404 responses without a single-page-app fallback. Next's flattened segment-prefetch
URLs are mapped to their existing nested export files so client navigation can load
its static payloads. It binds to localhost:3000 unless
`PORT` is set.

Development, generation, cleaning, and full builds coordinate ownership of shared
workspace output. Do not run a build or cleanup against a workspace serving active
development; stop that server first. Separate checkouts can run independently.
Ownership is recorded in `node_modules/.cache/website-tooling.lock`, inherited by
authorized generator subprocesses, and reclaimed when its owner is no longer alive.
Next's own development/build locks also block writes by the tooling entry points.
`npm run check` prepares content once before lint, type checking, and unit tests.

Verification checks exported HTML and the manifest for detectable real-content leaks
when placeholders are the default, checks routing/metadata expectations, and fails
the build on configured violations. Exact default-language prose of at least 30
characters and configured brand terms are detectable; short, altered, or non-default
language literals can escape that check. Review source for display strings too.
Sitemap verification compares exact canonical route membership and rejects duplicate,
missing, and unexpected URLs rather than relying only on a URL count.

GitHub workflows verify pull requests and `main`; the development workflow publishes
the reviewed `main` export to GitHub Pages. The production configuration targets a
root-hosted static site. Deployment credentials and hosting setup are operational
concerns, not visitor-facing settings.

A passing working-directory build is not sufficient evidence for CI: required files
must be tracked and submodule commits available to the checkout. The clean-checkout
procedure is in the Developer Guide.

## 8. Official actions and trust boundaries

`settings/public_actions.json` owns public action destinations. Its `connectId`
references resolve to canonical `library/connect/` records. Do not invent destinations
inside components.

The payment QR is generated at build time from the configured payment destination.
Preserve the complete URL and its query parameters. External services handle payment
processing and confirmation.

Material enquiries use the localized catalog in
`library/donations/pages/donation.md` and the configured email destination.
Display only real submission/contact capabilities; do not show a successful
registration or enquiry when nothing was sent.

The official WhatsApp record is a **broadcast channel**, not a direct-message inbox.
Use it for following announcements, not for prefilled private enquiries or promised
message delivery.
Public configuration must never contain credentials.

## 9. Maintenance

Update this guide when ownership, structure, environments, or the pipeline changes.
Update the Developer Guide when contributor steps change. Keep tests and validation
at the layer that owns the behavior. Document existing behavior and explicit
restrictions. Exclude migration narratives, removed or unimplemented features,
historical implementation notes, and duplicated configuration values.
