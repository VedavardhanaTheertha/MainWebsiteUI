# Shri Shiroor Matha — Architecture & Design

**This is the living design document for the project.** It describes what the system
is, why each decision was made, and what is planned next.

> **Maintenance rule:** any change to structure, the content system, environments, or
> the build pipeline **must** be reflected here in the same pull request. If this
> document and the code disagree, the document is a bug.

For *how to do things* (add a language, add a blog post, deploy), see [KT.md](./KT.md).

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
| Content and design drift apart over time | Design is structurally incapable of depending on specific content |

### How it is enforced, not just encouraged

The dev environment replaces all real text with placeholders (see §6). This makes the
rule **self-policing**: if real Shiroor text ever appears on the dev site, it proves
somebody hardcoded a string into a component instead of using the content system. The
build's verification step scans for exactly this and fails when it finds it.

This turns a convention people are asked to follow into a guarantee the build enforces.

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
├── docs/
│   ├── ARCHITECTURE.md         ← this file — the design contract
│   └── KT.md                   ← knowledge transfer / how-to guide
│
├── build/
│   ├── build.mjs               ← the real build logic (runs locally and in CI)
│   ├── verify.mjs              ← post-build checks (noindex, no leaked content)
│   └── README.md
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
│
├── public/media/               ← image files that content JSON points to
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

**Validation is deliberately stricter here than for translations.** A post missing a
title or date **fails the build**, because that is an authoring mistake with no sensible
fallback — unlike a missing translation key, which has one.

### 5.3 Images

Images live in `public/media/`. Content files reference them by path as plain strings.

A contributor adding a post supplies both the Markdown file and the image in the same
pull request. Images are pre-optimised at authoring time, because static export has no
image-optimisation service at runtime (see `next.config.ts`).

### 5.4 Bhakti collection

`build/build-bhakti-content.mjs` converts the Markdown and metadata from the library submodule's
`dasasahitya` source directory into `src/gen/bhakti/`. The site has one Bhakti collection, so no
tab manifest is generated. `src/gen/` is disposable, Gitignored build output and is recreated before
development and production builds. Its page labels, controls, and metadata are stored under
`library.bhakti.page` in each `content/languages/<lang>.json` file and follow the same fallback
and placeholder rules as the rest of the website UI. The collection is exposed through
`/library/bhakti`; there is no separate Dasa Sahitya navigation item or route.

---

## 6. Environments

Two environments. A third (`stage`) was considered and deliberately deferred — see §10.

| | **dev** | **prod** |
|---|---|---|
| Hosted on | GitHub Pages | Cloudflare Pages |
| Deploys from | `dev` branch | `main` branch |
| Content shown | Placeholders | Real content |
| `robots.txt` | `Disallow: /` | Allow |
| `noindex` meta tag | Yes | No |
| Canonical URL | Points to production | Self |

### 6.1 Placeholder content in dev

When `SITE_ENV` is anything other than `prod`, every content string is replaced with a
generated placeholder **before it enters the JavaScript bundle**. Real content is never
shipped to the dev site at all.

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

Machine-readable values — paths, URLs, ids, dates, style tokens — are preserved
untouched in every environment. Replacing an `href` would break navigation and replacing
an `id` would break item matching.

**Images are not replaced** — real images render in dev, because design review depends on
them and the search-engine concern is driven by text, not images.

### 6.2 Why dev must not be indexed

If the dev site were indexed by search engines, it would compete with production for the
same search terms and could confuse anyone who found it. The protections are layered:

1. `robots.txt` disallowing all crawling
2. A `noindex` meta tag in every page's head
3. A canonical URL pointing at production
4. **Placeholder content** — the real safety net

Layer 4 is what makes this genuinely safe. GitHub Pages on a public repository cannot do
password protection or custom HTTP headers, so layers 1–3 are the technical ceiling
there. But even in the worst case where all three fail and Google indexes the dev site,
every page reads "content goes here" and cannot possibly rank for "Shiroor Matha."

### 6.3 Fail-safe default

**`SITE_ENV` defaults to `dev` when unset.** A contributor running the project locally, or
a misconfigured deployment, gets placeholders. Showing real content requires explicitly
opting in. The system fails safe rather than failing open.

---

## 7. Build and deployment

### 7.1 Pipeline

```
content/languages/*.json ─┐
content/blog/*/          ─┼─→ generate-content.mjs ─→ src/gen/ ─→ next build ─→ out/
config/site.yml          ─┘            ↑                                                │
                                   SITE_ENV                                             ↓
                                                                                  verify.mjs
```

The generator performs four jobs:

1. **Discovers languages** by scanning `content/languages/*.json`; emits the list.
2. **Merges** each language over `en.json`; warns about keys that fell back.
3. **Discovers blog posts** by scanning `content/blog/*/`; emits the index and routes.
4. **Applies the environment transform** — placeholder substitution when not `prod`.

`verify.mjs` then checks the built output:

1. `robots.txt` matches the environment's indexing policy.
2. Non-production pages carry a `noindex` directive.
3. Non-production pages contain no real prose (matched above 30 characters, to avoid
   false positives on ordinary words).
4. Non-production pages contain none of the **brand terms** listed in
   `config/site.yml` — matched at *any* length, because a name like "Shiroor" is short
   but is precisely what someone would search for. Check 3 alone would miss it.

### 7.2 Build triggers

Both triggers run the same workflow, for different reasons:

| Trigger | Purpose |
|---|---|
| **On push to `dev`** | Deploy new code and content immediately |
| **Once daily** | Refresh date-scheduled content, and act as a canary that the build still works when nobody has pushed |

**Why a daily build is needed rather than merely tidy:** `src/lib/scheduler.ts` selects
which carousel items are shown based on *today's date* — content items carry
`launch_date`, `end_date`, and `pinned_date`. On a static site the HTML is generated once
and frozen. If the site is built on Monday and visited on Friday, the HTML initially
served still reflects Monday's selection; JavaScript corrects it after loading, but there
is a visible window of stale content. A daily rebuild keeps the served HTML aligned with
the current day.

> **Accuracy note:** `selectActiveItems` is currently **not called anywhere in the app**.
> The scheduling capability and the dated content both exist, but nothing consumes them
> yet. The daily build is therefore justified today only by its canary role; it becomes
> functionally necessary once the scheduler is wired up. See §11.

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
| Framework | Next.js 16 (App Router) | `output: "export"` — fully static |
| UI | React 19 | |
| Styling | Tailwind CSS v4 | |
| Animation | Framer Motion | |
| Icons | Lucide | |
| Language | TypeScript | |
| Hosting (dev) | GitHub Pages | |
| Hosting (prod) | Cloudflare Pages | |

**Why static export:** no server to run, host, secure, or pay for. The site is files on a
CDN. This is the correct choice for a content site with no per-user state, and it is what
makes free GitHub Pages hosting viable for the dev environment.

---

## 10. Decision log

Decisions recorded with their reasoning, so future maintainers can tell what was
deliberate from what was accidental.

| Decision | Reasoning |
|---|---|
| **Restructure the existing app, not rebuild** | ~30 routes and ~40 components already exist and were built against this design. Rebuilding costs weeks for no functional gain. The gaps (docs, config, environments, CI) are additive. |
| **JSON for languages** | Universal, tool-friendly for non-technical translators, no whitespace sensitivity. Replaces the original YAML. |
| **Markdown for blog prose** | Long-form text in JSON strings is unwritable and fragile. |
| **English *is* the default layer** | Avoids maintaining a separate placeholder-default file that would inevitably drift out of sync with the real content. |
| **Partial translations warn, malformed posts fail** | A missing translation has a sensible fallback (English). A post with no title does not. Strictness should match whether a fallback exists. |
| **Placeholders generated, not hand-written** | A hand-maintained dev content file would drift as keys are added. Generation keeps it permanently in sync at zero maintenance cost. |
| **`SITE_ENV` defaults to `dev`** | Real content requires opting in, so misconfiguration cannot leak production content or create duplicate search-engine entries. |
| **Build logic in `build/`, not in CI YAML** | Runnable locally for debugging; avoids CI provider lock-in. |
| **`stage` environment deferred** | Three environment names were originally planned, but only two deploy targets exist. Adding stage later is a small, known change: a third `SITE_ENV` value and a deploy target. |
| **Git history left intact** | The pre-open-source history is untidy but honest. Rewriting it would destroy the record for cosmetic gain. Leftover test files were removed going forward. |

---

## 11. Known gaps and planned work

✅ **Built and verified**

- `content/languages/en.json` + `kn.json`, replacing the previous YAML files
- Language auto-discovery — verified by adding a 3-key `sa.json`: the build succeeded,
  warned about the 98 missing keys, showed Sanskrit for its own keys and English for the
  rest, and the switcher picked it up without any code change
- Deep-merge fallback with a build-time report of what fell back
- `SITE_ENV` placeholder transform, defaulting to `dev`
- `config/site.yml`, `build/build.mjs`, `build/verify.mjs`, `.github/workflows/deploy-dev.yml`
- Blog auto-discovery from `content/blog/`, with a sample post and a `[slug]` route
- Environment-aware `robots.txt`, `noindex`, and canonical URL
- `base_path` handling so GitHub Pages project URLs resolve correctly

🚧 **The main outstanding gap — hardcoded content**

**182 occurrences of brand terms across 50 files** are still written directly into
`.tsx` files rather than coming from `content/`. The shared header and footer have been
migrated, which removed the terms from every page at once; the remainder sit in
individual pages.

Current state, as reported by `build/verify.mjs` on a dev build:

| Term | Pages affected |
|---|---|
| `Shiroor` | 28 |
| `Paryaya` | 12 |
| `Shri Krishna Matha` | 1 |
| `Shirooru` | 0 (fixed) |

There are also 16 distinct longer prose strings hardcoded in pages such as `about`,
`contact`, `history/*` and `library/*`.

**Until this is finished, `build.fail_on_hardcoded_content` in `config/site.yml` stays
`false`**, so these are reported as warnings rather than failing the build. Flip it to
`true` once the migration is complete — that is what turns the rule into a guarantee.

📋 **Planned — agreed, not yet built**

- Migrate the remaining hardcoded content above into `content/languages/`
- Migrate the image paths still hardcoded inside `.tsx` components
- Desktop responsive adaptation across all pages
- Auto-generated content key reference (replacing the comments lost in the YAML→JSON move)
- Wire up `src/lib/scheduler.ts` — it is written and tested-by-design but **not currently
  called anywhere**, so date-scheduled content is not yet active (see §7.2)

📋 **Deferred by decision**

- `stage` environment
- Auto-discovery for seva, events, and library content — these wait until the backend
  team defines the data contract, since designing their shape now would likely be wrong

🔭 **Suggested future work — not yet agreed**

- **Accessibility audit.** A religious institute's site serves elderly visitors; contrast,
  font scaling, and screen-reader labelling deserve a dedicated pass.
- **Content preview for non-technical editors.** A web-based editor writing to
  `content/` via pull request would let temple staff update text without using git.
- **Automated visual regression testing.** Playwright is already a dependency; screenshot
  comparison per page would catch design drift automatically, which matters because
  "exactly the same design" is a stated project requirement.
- **Performance budget in CI.** Fail the build if page weight or image size regresses.
- **Sitemap and structured data** for production, to help the real site rank properly.

---

## 12. How to keep this document alive

This document is only useful if it stays true. Two mechanisms:

1. **`AGENTS.md` instructs any AI agent** working in this repository to update this file
   as part of any structural change.
2. **The pull request checklist** asks human contributors the same question.

If you are reading this and something below §4 no longer matches the code, fixing this
document is part of the next change — not a separate task for later.
