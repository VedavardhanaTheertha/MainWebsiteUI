# Shri Shiroor Matha — Architecture & Design

**This is the living design document for the project.** It describes what the system
is, why each decision was made, and what is planned next.

> **Maintenance rule:** any change to structure, the content system, environments, or
> the build pipeline **must** be reflected here in the same pull request. If this
> document and the code disagree, the document is a bug.

For *how to do things* (add a language, add a blog post, deploy), see
[DEVELOPER.md](./DEVELOPER.md).

**Status legend used throughout:** ✅ Built · 🚧 In progress · 📋 Planned

---

## 1. What this project is

A public, open-source website for Shri Shiroor Matha, a Madhwa religious institute in
Udupi, Karnataka. The site is multilingual, mobile-first, and published as a fully
static site (no server at runtime).

Because the project is open source, an explicit design goal is that **an outside
contributor can add content or a translation without being able to accidentally break
the design or the code.**

---

## 2. Scope — what is and is not part of this work

The project is split into two independent tracks, handled by different teams.

| Track | Owns | Status |
|---|---|---|
| **Part 1 — Frontend & static** (this work) | Design, pages, layout, content system, build, deploy | Active |
| **Part 2 — Backend & API** (other team) | Form submission handling, payments, dynamic seva data | Not started here |

**The boundary is the submit action.** Part 1 builds the volunteer form, the seva list,
and the feedback form up to and including the moment the user presses *Submit*. What
happens after that press belongs to Part 2.

Concretely, Part 1 is responsible for:

- Rendering the volunteer page and its form fields
- Rendering the seva list from static JSON
- Rendering the feedback form

Part 1 is **not** responsible for: processing submissions, storing data, payment
gateways, or authentication.

---

## 3. Core principle — content is data, structure is code

This is the single idea that everything else follows from.

> **Code never names content.** No page, component, or config file contains a hardcoded
> list of languages, blog posts, or content strings. Instead, the build scans folders
> and generates those lists automatically.

A contributor's entire job is to **put a file in the right folder.** The site discovers
it. Nobody edits a page, a menu, or a switcher to "register" new content.

### Why this matters

| Without it | With it |
|---|---|
| Adding Sanskrit means editing the language switcher, the build script, and type definitions | Adding Sanskrit means adding `sa.json` |
| A contributor's typo in a component breaks the layout for everyone | A contributor never opens a component |
| Content and design drift apart over time | Generated content and verification make accidental coupling less likely and visible during review |

### How it is enforced, not just encouraged

The dev environment renders placeholders by default and includes a copy selector (see
§6). Its downloadable client assets contain both real and placeholder copy; the post-build
verifier checks that exported HTML and the manifest remain placeholder-only, and checks
brand terms there at any length. This is a useful backstop, not a complete guarantee:
short, changed, non-default-language, client-only, or otherwise unrendered literals can
escape comparison, so source review remains mandatory. The public preview has no access
control, so `noindex` is a crawler directive, not a confidentiality boundary.

---

## 4. Repository layout

```
Shirooru/
├── content/                    ← the ONLY folder contributors need to touch
│   ├── languages/
│   │   ├── en.json             ← English. The default/base layer — must be complete.
│   │   ├── kn.json             ← Kannada
│   │   └── <lang>.json         ← any new language: just add the file
│   └── blog/
│       └── <post-slug>/
│           ├── meta.json       ← shared config: date, hero image, tags, author
│           ├── en.md           ← English title + body
│           └── <lang>.md       ← optional translation
│
├── config/
│   └── site.yml                ← environment matrix, feature flags, deploy settings
│
├── settings/
│   ├── dev/
│   │   ├── images.json          ← independent development image map
│   │   └── topsevas.json        ← ordered featured Seva IDs
│   └── prod/
│       ├── images.json          ← independent production image map
│       └── topsevas.json        ← ordered featured Seva IDs
│
├── docs/
│   ├── ARCHITECTURE.md         ← this file — the design contract
│   └── DEVELOPER.md            ← setup, knowledge transfer, and how-to guide
│
├── build/
│   ├── build.mjs               ← the real build logic (runs locally and in CI)
│   ├── clean.mjs               ← removes generated output before each build
│   ├── markdown.mjs            ← shared parser and sanitizer boundary
│   ├── write-canonicals.mjs     ← derives canonical URLs from exported paths
│   └── verify.mjs              ← post-build checks (noindex, no leaked content)
│
├── scripts/
│   └── generate-content.mjs    ← scans content/, emits src/gen/
│
├── src/
│   ├── app/                    ← routes. Structure only — never content.
│   ├── components/             ← UI. Structure only — never content.
│   ├── lib/                    ← shared logic (scheduler, types)
│   ├── context/                ← language provider
│   └── gen/                    ← generated website data. Never hand-edited. Gitignored.
│       ├── content.ts          ← environment-resolved site and article content
│       ├── hero-images/        ← standalone HTML rendering of the home hero carousel
│       ├── parampara/          ← lineage data module and standalone interactive HTML
│       ├── connect/            ← generated branch and connection-channel data
│       ├── bhakti/             ← generated devotional collection
│       ├── sevas/              ← generated sevas collection
│       └── events/             ← generated events collection and standalone HTML pages
│
├── public/                     ← existing static assets served from the site root
│   ├── articles/               ← consistent location for new article media
│   └── slide/                  ← existing legacy image collection
├── library/                    ← required content submodule
│   ├── branches/               ← bilingual branch front matter and detailed Markdown
│   ├── connect/                ← official connection-channel Markdown records
│   ├── dasasahitya/            ← devotional source collection
│   ├── parampara/              ← indexed Guru Parampara Markdown entries
│   ├── hero/                   ← environment-specific hero groups
│   │   ├── dev/                ← development and local hero sources
│   │   └── prod/               ← production hero sources
│   ├── sevas/                  ← bilingual Seva metadata and complete Markdown details
│   └── events/                 ← event Markdown entries (top-level only)
├── test_media/                 ← recursively initialized media submodule
│
└── .github/workflows/
    └── deploy-dev.yml          ← thin CI wrapper that calls build/build.mjs
```

### Why `build/` is separate from `.github/workflows/`

The workflow file stays roughly ten lines; all real logic lives in `build/`, which the
repository owns. Two benefits:

1. **You can run the exact CI build locally** to debug it, instead of pushing commits
   to test the pipeline.
2. **CI provider lock-in is avoided.** Moving to a different CI system means rewriting
   ten lines, not the whole pipeline.

---

## 5. The content system

### 5.1 Languages

**Format:** JSON, one file per language, in `content/languages/`.

**English is the default.** `en.json` is not a special "default file" sitting alongside
the languages — it *is* the base layer. Every other language is deep-merged on top of it.

```
en.json  (complete — every key must exist here)
   ↑ merged under
kn.json  (may be partial)
   ↑ merged under
sa.json  (may be partial)
```

**Consequences of this design:**

- A missing key in `sa.json` falls back to English rather than crashing the build.
- **Partial translations are valid.** A contributor can translate half the site, ship it,
  and the rest displays in English. The build prints a warning listing exactly which keys
  fell back — visible, but not blocking.
- The available-language list is generated by scanning the folder. The language switcher
  renders from that generated list, so a new file appears in the switcher automatically.

**Why JSON rather than YAML:** JSON is universally understood, every web-based
translation editor speaks it, and it has none of YAML's whitespace sensitivity (where a
stray tab from a non-technical translator breaks the build). The cost is that JSON has
no comments — mitigated by an auto-generated key reference (see §11).

### 5.2 Blog and article content

**One folder per post.** Shared configuration lives once; each language is one file
beside it.

```
content/blog/solar-power-installed/
├── meta.json     { "date": "2026-07-14", "hero": "/media/solar.jpg", "tags": [...] }
├── en.md         # English title + body
└── kn.md         # Kannada translation (optional — falls back to English)
```

**Why Markdown for the body but JSON for languages:** language files are short key/value
UI strings, which JSON handles perfectly. A thousand-word article crammed into a single
JSON string (`"body": "para one\n\npara two..."`) is painful to write and easy to break.
Markdown is the correct tool for prose. Different content types, different formats.

Both blog and Bhakti Markdown use `markdown-it` with raw HTML disabled, followed by
`sanitize-html` with explicit tag, attribute, and URL-protocol allowlists. Relative,
`http`, `https`, and `mailto` links are accepted. Security tests cover raw HTML,
JavaScript/data/protocol-relative URLs, encoded and malformed payloads, and quotes.

**Validation is deliberately stricter here than for translations.** A post missing a
title or date **fails the build**, because that is an authoring mistake with no sensible
fallback — unlike a missing translation key, which has one.

### 5.3 Images

Image paths are centralized in independent maps under `settings/dev/` and
`settings/prod/`. The active `SITE_ENV` selects `dev/images.json` or
`prod/images.json` (`local` uses the dev map). Each map can
define entirely different filenames and paths; dev currently uses the WebsiteTestMedia
GitHub Pages base, while production uses `https://shiroormatha.org`. Content tokens
such as `@image.krishna` and direct component imports resolve against the selected map;
image filenames should not be hardcoded in content or source.

Static assets currently live in the external WebsiteTestMedia repository for dev and
under the production site's image paths for prod. Existing binaries are not duplicated
in this repository merely to make the layout uniform.

A contributor adding a post supplies both the Markdown file and the image in the same
pull request. Images are pre-optimised at authoring time, because static export has no
image-optimisation service at runtime (see `next.config.ts`).

Local storage is an interim delivery model. The original image set was approximately
94 MiB and was compressed to approximately 5.3 MiB; the current `public/` tree remains
approximately 5.3 MiB. The target architecture is to serve photographs from an image
CDN while retaining only icons and essential interface assets in this repository. Pages
should include dimensions and a small blurred preview so layout remains stable while the
full image loads.

The CDN provider and URL/content contract are not yet finalized. Cloudflare is the
current recommendation because production hosting is planned there, but implementation
must wait for an explicit decision covering ownership, cost, cache invalidation,
availability, asset provenance, and contributor workflow. Until then, new local images
must be optimized before review and recorded in `ASSET_PROVENANCE.md`.

### 5.4 Bhakti collection

`build/build-bhakti-content.mjs` discovers Markdown files in the library submodule's
`dasasahitya` source directory and reads each song's YAML front matter as its metadata source,
then converts the content into `src/gen/bhakti/`. There is no separate collection metadata file.
The site has one Bhakti collection, so no tab manifest is generated. `src/gen/` is disposable,
Gitignored build output and is recreated before development and production builds. Its page labels,
controls, and metadata are stored under
`library.bhakti.page` in each `content/languages/<lang>.json` file and follow the same fallback
and placeholder rules as the rest of the website UI. The collection is exposed through
`/library/bhakti`; there is no separate Dasa Sahitya navigation item or route.
CI initializes submodules recursively. A missing library checkout fails early with the
exact initialization command rather than an opaque file-not-found error.

The collection supports multi-language display (Kannada and English) driven directly by the
existing language switcher in the site header (`useLang().lang`):
1. **Build-Time Index Creation & Compression**: `src/gen/bhakti/index.json` stores lightweight song metadata
   including Kannada titles (`titleKn`), transliterated English titles (`titleEn`), author/ankita
   attributes in both scripts, and pre-tokenized, normalized search haystacks (`searchText`) built
   from the complete Kannada and transliterated English song text. Authors do not maintain separate
   search tags.
   `build/build-bhakti-content.mjs` pre-builds a complete `MiniSearch` index at build time with field
   weights (titles 3x, ankitas 2x, authors 1.5x) and serializes it to a gzip-compressed payload in
   `src/gen/bhakti/search-index.ts`. This index chunk is lazy loaded on demand (on idle or search focus)
   and decompressed in the browser via native `DecompressionStream("gzip")`, eliminating runtime indexing overhead
   and keeping initial page load small.
2. **Lazy-Loaded Language Chunks**: Songs are split into individual modules under
   `src/gen/bhakti/content/<id>.ts` and lazy loaded on demand via `loaders.ts` with card
   hover/focus prefetching. Each module exports both `htmlKn` (Kannada title, author line, and lyrics)
   and `htmlEn` (English title, author line, and transliterated lyrics).
3. **Instantaneous Language Switching**: When the reader toggles the language switch in the header,
   the catalog titles, attribution lines, and active reading view switch between Kannada and English
   immediately without additional network requests, preserving reading continuity.

### 5.5 Hero groups

The library submodule stores hero groups under `hero/dev/` and `hero/prod/`, with one
`*.hero.json` file per group in each environment. Local builds use `hero/dev/`, matching
the local image-settings rule. Each file defines `title_en`, `title_kn`, `href`, and a
non-empty `images` list. Images may be direct HTTP URLs or `@image.<name>` references.
The build validates references against the active environment's
`settings/<env>/images.json` but preserves every image value in the generated HTML:
HTTP URLs remain absolute and `@image.*` values remain references. It selects
`default.hero.json` and writes the standalone carousel to
`src/gen/hero-images/index.html`. Internal links receive the environment base path;
external links are preserved. Production uses `title_en` and `title_kn` exactly as
authored. Development and local builds replace both with the shared placeholder transform,
so library prose cannot leak through non-production output. The generated React data and
standalone HTML select the matching title when the page language changes.

### 5.6 Guru Parampara

`library/parampara/index.json` defines the ordered lineage and references one Markdown
file per guru. The generator validates that every file exists and that its heading and
summary match the index, then parses content after `## Details` as sanitized Markdown.
it writes `src/gen/parampara/data.ts` for the Next.js lineage and per-guru detail pages,
plus a self-contained interactive `src/gen/parampara/index.html`. Each indexed guru ID is
statically generated under `/history/parampara/<id>` and included in the sitemap. The
lineage modal shows a summary only; its full-details link opens that page. Development
output applies the standard placeholder transform and suppresses source image URLs;
production uses the verified library text.

English is the current source and automatically falls back for other languages. Future
translations can add `index.<lang>.json` and/or `<content-file-stem>.<lang>.md`; generated
data and both interfaces already select the active language through `useLang()` and the
`shiroor-lang` browser event contract.

#### Connect and branch collections

`library/branches/*.md` supplies bilingual branch summaries, contact information,
coordinates, and detailed Markdown. `library/connect/*.md` supplies official connection
channels, handles, optional audience figures, URLs, brand colours, and local icon paths. `generate-content.mjs`
discovers and validates both directories, sanitizes branch details, applies the normal
environment placeholder policy, and writes `src/gen/connect/data.ts`.

The statically exported `/connect` route renders every branch summary and connection
channel in its initial HTML. Selecting a branch hydrates a client-side details dialog
containing localized content, an embedded coordinate-based map, an external Google Maps
link, and a Google Maps directions link. Connection cards are ordinary external links.

The statically exported `/sevas` route is the only Seva navigation destination. The
build discovers all Markdown records under `library/sevas/`, generates typed client data,
and selects featured tiles in the order configured by
`settings/<env>/topsevas.json`. Local builds use the development setting. A missing or
empty setting falls back to Kanike, Donations, and Volunteer Sign-up. The page provides
category filtering, shared MiniSearch behavior, and a sanitized details
dialog. The generator stores independently sanitized English and Kannada guideline HTML,
so the dialog immediately renders only the active language. Its booking action remains
visible below the scrolling details and opens the record's `booking_url` in a new tab.
Development exports use generated placeholder Seva fields and links so real library prose
and brand terms cannot leak into non-production HTML; local and production exports use the
Markdown values.

The statically exported `/events` route uses the same centered `max-w-7xl` page rhythm
as the Seva and Connect experiences. Upcoming, recurring, and catalog sections render as
responsive three-column desktop card grids and collapse to touch-friendly mobile layouts.

### 5.7 Full-text search with MiniSearch and build-time compression

Client-side searching across the website is unified through `minisearch` via `src/lib/search.ts`
and React hooks in `src/hooks/useMiniSearch.ts`:
- **Mandatory Shared Defaults**:
  - Every search UI must use `useMiniSearch` or `useLazyMiniSearch`; it must not construct
    `MiniSearch` directly or implement a separate substring filter.
  - Every build-time index must use `withSearchDefaults` from `build/search-config.mjs`.
    This is the default contract for future search features as well as current ones.
- **Build-Time Indexing and Gzip Compression**:
  - **Dasasahitya (`BhaktiBrowser.tsx`)**: The full bilingual index is compiled at build time by
    `build/build-bhakti-content.mjs`, serialized, and compressed with gzip into `src/gen/bhakti/search-index.ts`.
  - **Sevas (`SevasBrowser.tsx`)**: Every `library/sevas/*.md` file is validated and
    generated into `src/gen/sevas/data.ts`; its full bilingual metadata and Markdown
    body are indexed and gzip-compressed into `src/gen/sevas/search-index.ts`.
  - **Events (`EventsExact.tsx`)**: All events from `library/events/*.md` are indexed and gzip-compressed
    at build time by `build/build-events-content.mjs` into `src/gen/events/search-index.ts`.
- **Streaming Lazy Loading (`useLazyMiniSearch`)**:
  - The compressed index modules are code-split into dynamic import chunks that are only loaded on demand
    (idle prefetch or input focus).
  - Decompression occurs in the browser using the native `DecompressionStream("gzip")` API with zero additional
    dependencies and automatic fallback to client-side indexing if needed.
  - An optimistic immediate filter prevents UI pauses while the chunk resolves.
- **In-Memory Local Search (`MediaGrid.tsx`)**:
  - Media photo and video catalogs are localized and indexed on the client with lightweight in-memory MiniSearch.
- **Search Quality**:
  - Infix matching expands indexed terms into suffixes and combines that with MiniSearch prefix
    matching, so a query can begin anywhere within a word.
  - Adaptive fuzzy matching (`fuzzy: (term) => (term.length > 3 ? 0.2 : false)`) tolerating typos.
  - Automatic fallback from `AND` to `OR` combinations on multi-word queries.

### 5.8 Events collection

`build/build-events-content.mjs` converts individual event Markdown files directly from
`library/events/*.md` (top-level only, no index JSON required or created) into `src/gen/events/`.
`src/gen/` is disposable, Gitignored build output and is recreated on every development, local,
and production build (`npm run events:build`).

1. **Partitioned Catalogs**: Events are partitioned by date into `upcoming` and `past` collections,
   alongside a filtered `recurring` collection. Generated files reside at `src/gen/events/`
   (`data.ts`, `past-data.ts`, `search-index.ts`, `past-search-index.ts`, and `loaders.ts`),
   while past events are split into `past-data.ts` to enable on-demand lazy loading.
2. **Build-Time Search Indexing & Compression**: Separate MiniSearch indexes for future and past
   events are pre-built and gzip-compressed into `src/gen/events/search-index.ts` and `past-search-index.ts`.
3. **Reactive UI Integration**: Events are consumed by Next.js components:
   - `EventsExact.tsx`: Category tabs starting with "All Upcoming", individual category filters, and an "All Past Events" tab. Selecting "All Past Events" lazy loads `past-data.ts`. MiniSearch searches past events only when on the past events tab, and future events on all other tabs. Clicking any card opens `EventDetailModal`.
   - `UpcomingEventRail.tsx`: Highlights up to 6 upcoming events occurring in the next 30 days, or displays an empty state message if no upcoming events are scheduled.
   - `EventsAccordion.tsx`: Displays a row of tiles for recurring events (`recurring: true`), automatically hidden if no recurring events exist.
   - `EventDetailModal.tsx`: Interactive accessible modal displaying complete event details, performers, schedule, and gallery in the user's selected language.
   - `MilestonesEvents.tsx`: Homepage spotlight rail.
4. **Environment Isolation**: Placeholders in dev/preview builds prevent content leaks through
   SSR verification, while production renders full verified copy and imagery. Real and placeholder
   variants are switchable via the preview control without impacting images.
5. **Dev & Local Test Event Duplication**: In `dev` and `local` builds, `build/build-events-content.mjs`
   duplicates all past events and shifts their dates forward equally such that the earliest event
   falls on the current day (`today`), making them available in the upcoming events collection for
   interactive testing. Titles and descriptions are prefixed with `Duplicate event for testing:`.
   These duplicates are added in addition to the original past events and are strictly excluded from
   production builds.

---

## 6. Environments

Three build environments separate local copy review from hosted preview and production.

| | **local** | **dev** | **prod** |
|---|---|---|---|
| Purpose | Local UI and copy testing | Hosted GitHub Pages preview | Live Cloudflare Pages build |
| Base path | Site root | `/MainWebsiteUI` | Site root |
| Content shown | Runtime-selectable real or placeholders | Placeholders only | Real only |
| `robots.txt` | `Disallow: /` | `Disallow: /` | Allow |
| `noindex` meta tag | Yes | Yes | No |
| Canonical URL | Points to production | Points to production | Self |

### 6.1 Placeholder content in dev

In a placeholder-only environment, generated visitor-facing content strings are replaced
with placeholders before they enter the JavaScript bundle. In a switchable environment,
the placeholder and real variants are both generated; `default_variant` selects the
server-rendered copy and first-visit choice. Preserved metadata keys and machine values
remain unchanged.

A placeholder is derived from its key path and prefixed with the language code, so
`home.hero.body` renders as *"en·home hero body — content goes here…"*.

Three details that matter in practice:

- **The language code is included** so that switching language visibly changes the text.
  Without it every language would render identically and the switcher could not be
  tested outside production.
- **Placeholders are padded to approximate the real string's length.** Dev is where the
  design gets reviewed, and a five-character placeholder standing in for five hundred
  characters would hide genuine layout bugs.
- **List items are numbered** (`en·label 1`, `en·label 2`). Several components use a
  content string as a React key, so identical placeholders across a list produced
  duplicate-key errors — and an unnumbered list of stand-ins cannot be matched back to
  the entry it came from.

Machine-readable values — paths, URLs, ids, dates, phone numbers, email addresses, and
style tokens — are preserved untouched in every environment. Replacing an `href` would
break navigation and replacing an `id` would break item matching.

**Images are not replaced** — real images render in dev, because design review depends on
them and the search-engine concern is driven by text, not images.

### 6.2 Why dev must not be indexed

If the dev site were indexed by search engines, it would compete with production for the
same search terms and could confuse anyone who found it. The protections are layered:

1. `robots.txt` disallowing all crawling
2. A `noindex` meta tag in every page's head
3. A canonical URL pointing at production
4. Placeholder substitution plus rendered-output leak checks

GitHub Pages on a public repository cannot provide password protection or custom HTTP
headers, so the text controls reduce risk when crawler directives are ignored. They do
not create an absolute indexing or leak guarantee; the verifier has the comparison
limits documented in §3 and §7.1.

### 6.3 Fail-safe default

**`SITE_ENV` defaults to `dev` when unset.** A contributor running the project locally, or
a misconfigured deployment, gets placeholder copy by default. The local and dev copy
selectors can opt into real copy for review; the system still starts with the safer
placeholder variant.

### 6.4 Switchable local and dev content

The `local` and `dev` environments use `content_mode: switchable`. Generation emits both
merged real content and its placeholder transform. `local` defaults to real copy;
`dev` sets `default_variant: placeholder`. The copy control inside `LanguageProvider`
selects the variant and persists the choice in `localStorage`; the external-store server
snapshot uses the configured default, preventing a hydration mismatch. Changing copy mode
does not change the selected language. The control labels are translated content under
`local_preview` and are exempt from placeholder transformation so the control remains
understandable. Since dev is publicly hosted, its real copy is available in client assets
to anyone who downloads them, even though the exported pages default to placeholders.

The `prod` generator emits only real content; its alternate content fields are `null` and
the control renders nothing. It does not ship placeholder copy or expose the preview
control.

Static export executes Server Components at build time. Consequently the local selector
updates client components that consume `useLang()` (including generated blog article copy).
Server-rendered route layouts keep their structure, but display strings and image alt text
use the `LocalizedCopy` and `LocalizedImage` client leaves to read the active context.
The home hero and Parampara browser/detail pages select between generated real and
placeholder datasets from the active copy mode. Metadata, manifests, and initial exported
HTML remain at the configured default; after hydration, visible localized leaves reflect
the visitor's selected mode.

---

## 7. Build and deployment

### 7.1 Pipeline

```
content/languages/*.json ─┐
content/blog/*/          ─┤
library/parampara/*      ─┤
library/branches/*.md    ─┤
library/connect/*.md     ─┤
library/hero/<env>/*.hero.json ─┼─→ generate-content.mjs → src/gen/ → next build → out/
config/site.yml          ─┘            ↑                                    │
                                   SITE_ENV                                 ↓
                                                       canonical normalization → verify
```

The generator performs the following jobs:

1. **Discovers languages** by scanning `content/languages/*.json`; emits the list.
2. **Merges** each language over `en.json`; warns about keys that fell back.
3. **Discovers blog posts** by scanning `content/blog/*/`; emits the index and routes.
4. **Applies the environment transform** — both variants for switchable `local` and `dev`
  builds (with environment-specific defaults), and real-only for `prod`.
5. **Discovers static routes** from page files plus blog folders for `sitemap.xml`.
6. **Discovers hero groups** from `library/hero/<env>/*.hero.json` (`local` uses `dev`),
  selects `default`, applies environment title handling, validates and preserves image
  values, and renders React hero data plus `src/gen/hero-images/index.html`.
7. **Discovers Guru Parampara entries** from `library/parampara/`, validates and parses
  Markdown, applies language fallback and environment placeholders, and renders the
  generated data module plus standalone interactive HTML.
8. **Discovers branches and connection channels** from `library/branches/*.md` and
  `library/connect/*.md`, validates required fields and secure links, sanitizes branch
  details, applies environment placeholders, and emits `src/gen/connect/data.ts`.

After Next.js exports the site, `write-canonicals.mjs` maps each HTML output path back
to its public route and writes the corresponding URL under `site.production_url`. This
central output-derived step covers filesystem and discovered article routes without a
duplicated canonical declaration in every page module. It removes canonical links from
Next's generated error documents. `verify.mjs` independently recomputes and checks the
mapping, including development exports whose assets use a base path while canonicals
still point to the production origin.

`verify.mjs` then checks the built output:

1. The generated web manifest uses the selected environment's base path.
2. `robots.txt` matches the environment's indexing policy.
3. Non-production pages carry a `noindex` directive.
4. Non-production pages and manifest contain no real prose (matched above 30 characters, to avoid
   false positives on ordinary words).
5. Non-production pages and manifest contain none of the **brand terms** listed in
   `config/site.yml` — matched at *any* length, because a name like "Shiroor" is short
   but is precisely what someone would search for. The prose check alone would miss it.
6. Every non-error exported HTML file has exactly one production canonical derived from
   its exported route; generated `404.html` and `_not-found.html` have no canonical.
7. `sitemap.xml` has one canonical production URL per non-error exported HTML page.

Every full build first removes `.next/`, `out/`, `dist/`, `src/gen/`, and generated
`robots.txt`, preventing stale routes or one environment's output from contaminating
another. CI gates lint, typecheck, unit tests, and the deployment builds. Local builds are
an additional developer gate. The Pages
deployment repeats lint, typecheck, tests, and the verified dev build before publishing.

### 7.2 Preview source and scheduled rebuilds

The permanent preview and production site are two environment-specific builds of the
same reviewed `main` revision. This preserves trunk-based development and prevents an
unreviewed integration branch from becoming a second source of truth. GitHub Pages
renders placeholders by default and includes both variants in client assets for the copy
selector; production receives real content only.

Static output is rebuilt daily as a build-health canary. Once date-sensitive selection
is connected to rendered content, the same rebuild will also keep generated pages aligned
with the current date. Workflow triggers, timing, and manual deployment procedures are
operational concerns documented in [DEVELOPER.md](./DEVELOPER.md#11-deployment).

---

## 8. Design strategy

### 8.1 Mobile is the source of truth

The design was authored as a mobile-only prototype (`Design/`). That prototype is
authoritative for **visual identity**: colours, typography, spacing rhythm, corner radii,
iconography, imagery treatment.

### 8.2 Desktop is an adaptation, not a stretch

There is no desktop design file. Desktop layouts reuse the mobile design's visual
language exactly, but re-flow the layout using standard responsive patterns.

**Why not replicate mobile literally:** a 375px-wide layout blown up to 1440px looks
broken — vast empty margins, unreadably wide single-column text, oversized touch targets.
"Exactly the same design" is meaningful at the level of design tokens and identity, not
literal pixel layout, because the two media have genuinely different constraints.

Adaptation patterns used:

| Mobile | Desktop |
|---|---|
| Bottom navigation / hamburger | Persistent top navigation |
| Single-column card stack | 2–3 column grid |
| Vertical hero | Split image + text hero |
| Single-item carousel | Multiple items visible |

Desktop design and desktop implementation are the same step, since the codebase is
component-based — the adaptation is expressed as responsive utility classes on existing
components rather than as a separate design artefact.

---

## 9. Technology stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 16.3.2 (App Router) | `output: "export"` — fully static |
| UI | React 19 | |
| Styling | Tailwind CSS v4 | |
| Animation | Framer Motion | |
| Icons | Lucide | |
| Language | TypeScript | |
| Hosting (dev) | GitHub Pages | |
| Hosting (prod) | Cloudflare Pages | Planned; not connected |

**Why static export:** no server to run, host, secure, or pay for. The site is files on a
CDN. This is the correct choice for a content site with no per-user state, and it is what
makes free GitHub Pages hosting viable for the dev environment.

---

## 10. Decision log

Decisions recorded with their reasoning, so future maintainers can tell what was
deliberate from what was accidental.

| Decision | Reasoning |
|---|---|
| **Restructure the existing app, not rebuild** | The existing route and component system was already built against this design. Rebuilding would add cost without functional gain; the identified gaps are additive. |
| **JSON for languages** | Universal, tool-friendly for non-technical translators, no whitespace sensitivity. Replaces the original YAML. |
| **Markdown for blog prose** | Long-form text in JSON strings is unwritable and fragile. |
| **English *is* the default layer** | Avoids maintaining a separate placeholder-default file that would inevitably drift out of sync with the real content. |
| **Partial translations warn, malformed posts fail** | A missing translation has a sensible fallback (English). A post with no title does not. Strictness should match whether a fallback exists. |
| **Placeholders generated, not hand-written** | A hand-maintained dev content file would drift as keys are added. Generation keeps it permanently in sync at zero maintenance cost. |
| **`SITE_ENV` defaults to `dev`** | Real content requires opting in, so misconfiguration cannot leak production content or create duplicate search-engine entries. |
| **Build logic in `build/`, not in CI YAML** | Runnable locally for debugging; avoids CI provider lock-in. |
| **Generated web manifest** | The obsolete static manifest referenced missing assets and root-only paths. The App Router now generates environment-aware metadata from content and configuration. |
| **No Playwright suite yet** | The unused dependency was removed. Add it only with reliable static-output smoke/accessibility tests. |
| **`stage` environment deferred** | Three environment names were originally planned, but only two deploy targets exist. Adding stage later is a small, known change: a third `SITE_ENV` value and a deploy target. |
| **Git history left intact** | The pre-open-source history is untidy but honest. Rewriting it would destroy the record for cosmetic gain. Leftover test files were removed going forward. |

---

## 11. Known gaps and planned work

✅ **Built and verified**

- `content/languages/en.json` + `kn.json`, replacing the previous YAML files
- Language auto-discovery and deep-merge fallback; missing keys are reported without
  relying on a fixed historical key count
- Deep-merge fallback with a build-time report of what fell back
- `SITE_ENV` placeholder transform, defaulting to `dev`
- `config/site.yml`, `build/build.mjs`, `build/verify.mjs`, `.github/workflows/deploy-dev.yml`
- Blog auto-discovery from `content/blog/`, with a sample post and a `[slug]` route
- Environment-aware `robots.txt` and `noindex`, plus route-specific production
  canonicals normalized and verified from static-export paths
- `base_path` handling so GitHub Pages project URLs resolve correctly

✅ **Detected hardcoded-content migration and enforcement**

Exact default-language JSON prose of at least 30 characters and configured institution
brand terms detected in rendered placeholder HTML or the manifest fail a development
build. This covers route metadata, page arrays, and server-rendered content when they
match those inputs, but does not replace source review for literals outside that scope.

Page metadata is grouped under `page_metadata`; page-specific structured copy is under
`pages`. Server components read the generated default-language content directly, while
interactive components continue to use `useLang()`. Both paths receive placeholder
content in development builds.

📋 **Planned — agreed, not yet built**

- Migrate the image paths still hardcoded inside `.tsx` components
- Move photographs to the selected image CDN, generate blurred previews, and retain only
  icons and essential interface assets in the repository; provider selection remains an
  open prerequisite (see §5.3)
- Desktop responsive adaptation across all pages
- Complete a pre-launch, page-by-page comparison against the source mobile design. The
  implementation was derived from that design, but visual fidelity has not yet been
  verified screen by screen.
- Auto-generated content key reference (replacing the comments lost in the YAML→JSON move)
- Wire up `src/lib/scheduler.ts`; date-scheduled content is not yet active (see §7.2)

📋 **Deferred by decision**

- `stage` environment
- Auto-discovery for seva, events, and library content — these wait until the backend
  team defines the data contract, since designing their shape now would likely be wrong

🔭 **Suggested future work — not yet agreed**

- **Accessibility audit.** A religious institute's site serves elderly visitors; contrast,
  font scaling, and screen-reader labelling deserve a dedicated pass.
- **Content preview for non-technical editors.** A web-based editor writing to
  `content/` via pull request would let temple staff update text without using git.
- **Automated visual regression testing.** Playwright is not currently installed; add
  it with a reliable screenshot comparison suite to catch design drift, because
  "exactly the same design" is a stated project requirement.
- **Performance budget in CI.** Fail the build if page weight or image size regresses.
- **Structured data** for production after canonical institutional facts are approved.

## 12. Supply chain, licensing, and releases

`package-lock.json` is authoritative and CI uses `npm ci`. Dependabot covers npm and
GitHub Actions. Dependency Review blocks newly introduced moderate-or-higher
advisories; CodeQL and OpenSSF Scorecard run with explicit permissions.

Development is trunk-based: short-lived branches target `main`, require review and all
checks, then are deleted. Releases will use immutable Semantic Versioning tags; until a
formal release, changes stay under `Unreleased`. Rollback is a
reviewed revert or redeployment of the last known-good revision, never history rewrite.

Apache-2.0 covers code and documentation contributed under it. It does not establish
rights to pre-existing devotional content, institutional names/logos, photographs, or
media. New content/media requires an `ASSET_PROVENANCE.md` entry and rights evidence;
the existing inventory remains explicitly unaudited and must be cleared before launch.

---

## 13. How to keep this document alive

This document is only useful if it stays true. Two mechanisms:

1. **`AGENTS.md` instructs any AI agent** working in this repository to update this file
   as part of any structural change.
2. **The pull request checklist** asks human contributors the same question.

If you are reading this and something below §4 no longer matches the code, fixing this
document is part of the next change — not a separate task for later.
