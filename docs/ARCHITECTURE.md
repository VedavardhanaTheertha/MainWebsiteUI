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
| `settings/` | Homepage composition, common webpage presentation, navigation, images, theme, search, and interaction behavior |
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
Language, UI settings, and preview preferences are persisted when browser storage is available;
otherwise they remain usable in memory for the current page session.

The Developer options page is exported only for `local` and `dev`. Its localized
entry is appended after the configured menu entries in both real and placeholder
catalogs; it is the last entry in desktop and compact navigation. The page exposes
every supported field in `settings/ui_elements.json` through generated, localized
checkboxes, numeric inputs, and choice controls. Edits remain drafts until **Apply
and reload** validates and saves them. The separate copy checkbox selects
placeholders when checked and real copy when unchecked. Local copy defaults to
real; development copy defaults to placeholders, and copy changes apply immediately.
Reset restores the configured UI values and environment-default copy, then reloads,
without changing the selected language. If storage is unavailable, Apply and Reset
apply settings in memory and show a warning instead of reloading away those changes.

`build/developer-options.mjs` owns the technical route and storage keys;
`settings/ui_elements.json` owns all UI defaults, including the image treatment,
image-backed tiles, desktop header shortcuts, and top Subscribe visibility (all initially false).
Copy-preview defaults remain environment-owned.
The page uses `page.preview.tsx`; Next configuration recognizes the `preview.tsx`
extension only in local/dev while retaining all standard page extensions.
Production never registers the route. The page also has a defensive not-found guard.
The utility page is noindex and excluded from the public route inventory and sitemap.
Export verification checks its environment-specific presence separately.
Developer control copy is preserved in placeholder catalogs so controls remain readable.
Production exports neither this page nor its menu entry and always uses real copy,
regardless of the saved copy preference.

`build/ui-settings-schema.mjs` is the shared build/browser validator and field
descriptor source. Generation rejects unknown or invalid settings and missing
localized control labels. Generated raw defaults and normalized aliases feed
`UiSettingsProvider`, which supplies runtime values to every interactive consumer.
The provider's server snapshot always uses configured defaults. When a complete
saved configuration loads or changes, a keyed provider remount initializes
pagination, sort/view/filter state, and reader size from those settings.

The browser stores a complete validated raw configuration as JSON in
`site-ui-settings` in per-origin `localStorage`. Invalid saved data produces a
warning and falls back to configured defaults. The browser-only compatibility
validator accepts older complete configurations missing `imageBackedTiles`,
`tileOverlayOpacity`, `tileCornerRadius`, and/or the entire `layout` group, inheriting those values
from current defaults without losing existing choices. A present but incomplete
layout group is invalid, except that older complete groups may omit the later
`centeredCarousel` flag and inherit its configured default.
Build-time settings remain strict. Legacy `site-image-treatment`,
`site-header-actions`, and `site-top-subscribe` values of `on` or `off` override the
corresponding presentation fields; absent or other values inherit the configuration.
Apply and Reset clear their precedence with `default`. Legacy-only changes do not
remount the site. The root image subscriber updates `data-image-treatment` after
hydration. The standalone generated hero embeds the same validator and defaults,
applies image/autoplay/interval/fade settings, and follows cross-document storage
events. Production supports all browser-local UI overrides without exposing a
developer page or enabling placeholder catalogs. These preferences are not runtime
environment variables, secrets, or an authorization mechanism.

### Optional layout comparisons

Eight independent booleans in `settings/ui_elements.json`'s `layout` group
normalize to `layoutSettings`; all default to false. The root preference
subscriber sets corresponding `data-*` attributes after hydration. Experiment CSS
is loaded after the baseline stylesheet and affects only explicitly marked
components. Existing layouts and homepage shortcut order remain the default.

- `adaptiveHero`: viewport-sensitive, clamped hero height, including the generated
  standalone hero. Its title stays over the image without a background panel.
- `featuredTiles`: a larger first configured item in the featured homepage grid,
  without changing content order or collection grids.
- `sectionHeaders`: consistent homepage headings and introductions. Mixed
  navigation groups do not invent a "view all" destination.
- `layoutProfiles`: wide visual, contained collection, and narrow reading wrappers
  with consistent gutters and section spacing; dialog and full-screen sizing stay independent.
- `compactCollections`: thumbnail rows for ordinary seva and library results,
  retaining details, booking, filters, and pagination. Compact rows take precedence
  over image-backed presentation; featured rails keep their photographic layout.
- `tileInformation`: stable category/title/summary/metadata placement in eligible
  cards, without removing independent actions or styling event posters.
- `carouselNavigation`: accessible previous/next buttons at the left/right
  edges, vertically centered alongside each rail, and a mobile next-card
  preview on opted-in rails. Scroll position and overflow determine disabled
  controls; manual navigation works independently of autoplay and honors reduced motion.
  Where a rail also has a pause control, it sits below Next with an 8px gap.
  Rails without the optional navigation retain their existing pause placement.
- `centeredCarousel`: emphasize the tile nearest a scrolling rail's center,
  with smaller neighboring tiles. Autoplay slides one card into the center,
  holds it stationary, then advances; at either boundary it reverses one card at
  a time. Hold and slide durations come from `autoScroll.holdDurationMs` and
  `autoScroll.slideDurationMs` in [UI settings](../settings/ui_elements.json).
  Manual movement also updates emphasis and smoothly settles on the nearest card
  after scrolling and pointer gestures end, even with autoplay paused or disabled.
  Settling is immediate under reduced motion and pauses autoplay until it finishes.
  Mobile layouts include neighboring previews. Static, non-scrolling
  desktop grids remain unchanged. This comparison is independent of the navigation
  controls and autoplay, respects reduced motion, and retains actual first/last
  boundaries rather than duplicating content for an infinite loop.
  Saved browser preferences missing only the newer hold/slide fields inherit their
  configured defaults; invalid provided values are still rejected.

Control and navigation copy comes from language JSON. These switches share the
existing validated Apply/reset, denied-storage, and production browser-local
override behavior; none enables the production Developer page.

The final homepage guidance group omits the temporary-content footer and its
separator in every layout mode; other homepage grids retain configured footnotes.
`presentation.tileCornerRadius` independently controls shared collection-card and
homepage photographic-card corners through `--tile-corner-radius`. Its default
20px preserves the existing shape; integers from 0 to 48 are accepted, with 0
making square corners. The `collection-tile` marker also covers event cards without
changing their image/text treatment. Hero banners share the value only on their
bottom corners, including the generated standalone hero; top corners stay square.
Shortcut icons, dialogs, and full-screen playback do not opt in.

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
allowed remote hosts. `settings/common.json` owns shared webpage presentation defaults:
fixed unscrollable full-page background images positioned behind main content, font
family stacks (`fontFamily`), and the uniform semantic font size scale (`fontSize`:
`micro`, `caption`, `ui`, `nav`, `body`, `badge`, `formLabel`, `formInput`,
`actionButton`, `meta`), which the root layout injects as `--font-*` and `--text-*`
CSS custom properties consumed by utility classes in `src/app/globals.css`.
`settings/theme.json` owns color, spacing, radius, and shadow tokens; the generator emits
`src/gen/settings/theme.css`. Layout and responsive behavior remain source code.
Category tones share semantic mappings across event rails, lists, and badges.
Content photographs, posters, portraits, and thumbnails use
`src/components/presentation/ContentImage.tsx`. By default, foreground images cover
their frames and the decorative layer is hidden. Enabling the browser-local image
option contains the sharp foreground over a statically blurred and darkened copy
of the same source; foreground padding preserves image edges inside rounded frames.
By default, captions, badges, and navigation controls
sit outside the artwork; foreground images do not zoom. Natural-size annotated
illustrations retain their image-relative annotation coordinates. Logos, QR codes,
functional icons (including failed-image placeholders), and full-screen album playback
retain their own presentation.
The hero title is always overlaid on its image, independently of the tile option,
using warm-white text with a subtle text shadow and no background panel. The standalone
generated hero mirrors that overlay and the preference-gated two-layer image treatment.
Shared featured/collection presentation variants preserve their distinct layouts
while keeping spacing, controls, focus, and result states consistent. Policy text
uses a readable shared size; utility controls have touch-friendly targets.

The independent, default-off `presentation.imageBackedTiles` flag sets
`data-image-backed-tiles` on the root after hydration. Eligible cards explicitly
opt in with `visual-tile`, `visual-tile-art`, and `visual-tile-body` hooks. Their
images fill the tile behind a lightly darkened text panel with a
fade above the text. The shared CSS honors either cover or contain/blur image
treatment without changing its renderer. In image-backed tile mode, eligible
foregrounds align top-centre with either image-fit setting. The ordinary
image-above-text layout and blurred backdrops retain their centred alignment.
Text shadows aid readability, but contrast remains image-dependent with this
deliberately translucent treatment.
`presentation.tileOverlayOpacity` controls panel opacity from 0 to 100 percent
(default 40), through the root `--tile-overlay-opacity` custom property. It never
changes hero text or image opacity. Titles wrap without line clamping,
and cards grow for translated text. Stretched detail links and separate actions
retain their original positioning and keyboard behavior.
Home photo tiles, section hubs, library previews, seva and learning cards,
album covers/items, and illustrated lineage entries participate. Event poster
surfaces, detail views, full-screen album playback, and icon-only tiles do not.
The hero's overlay is always enabled rather than controlled by this flag.
Forced-color mode uses system text/panel colors.

Media albums are built from language catalog data. Use stable explicit IDs
and valid image/video metadata; do not infer publication rights from remote availability.

`settings/ui_elements.json` supplies collection pagination, reader controls, viewer
boundaries, default filters/sorting, upcoming-event limits, slideshow timing,
interaction delays, presentation flags, and horizontal auto-scroll behavior.
The obsolete `hero.zoomDurationMs` option is unsupported; foreground images do not
zoom. `searchPreloadDelayMs` is the fallback preload delay when idle callbacks are
unavailable. Reading-speed overrides affect estimates, not authored reading times.
Horizontal rails preserve
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
