# Project Status — Requirements, Progress, and What Remains

**Last updated:** 1 August 2026

This page is written to be readable **without a technical background**. It records what
was asked for, what has been built, and what still needs doing.

- For *how to use it*, see [KT.md](./KT.md).
- For *how it is designed and why*, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## How to review the work

**Open https://vedavardhanatheertha.github.io/MainWebsiteUI/ — nothing to install.**

The site rebuilds and republishes itself on every change. If the link does not load, the
build status is on the [Actions tab](../../actions).

Remember the preview shows **placeholder wording** on purpose — see the note in the
[README](../README.md). Judge the layout, images, and navigation there; read the actual
wording in `content/languages/en.json`.

---

## Scope — who does what

The project has two halves, handled by different teams.

| | Covers | Status |
|---|---|---|
| **Part 1 — Website & design** (this repository) | Pages, layout, content system, build, publishing | **Active** |
| **Part 2 — Backend & API** (other team) | What happens after a form is submitted, payments, live data | Not started |

**The dividing line is the Submit button.** This repository builds the volunteer form,
the seva list, and the feedback form right up to the moment someone presses Submit.
Everything after that press belongs to the backend team.

---

## Requirements and their status

| # | Requirement | Status |
|---|---|---|
| 1 | Match the mobile design exactly | ⏳ Not yet verified page by page |
| 2 | Desktop version designed to match the mobile design | ❌ Not started |
| 3 | Open source, hosted on GitHub | ✅ Done |
| 4 | Preview site on GitHub Pages | ✅ Done |
| 5 | Live site on Cloudflare Pages | ⏳ Built for, not yet connected |
| 6 | Forms stop at Submit; backend handles the rest | ✅ Done |
| 7 | Seva list from a static file | ⏳ Waiting on backend team's data format |
| 8 | Organised folder structure | ✅ Done |
| 9 | One settings file controlling environments, without touching code | ✅ Done — `config/site.yml` |
| 10 | Contributors cannot accidentally change the design | ✅ Enforced by the build |
| 11 | **Adding a language = adding one file** | ✅ Done and tested |
| 12 | All wording comes from content files, not code | 🟡 Mostly — see "What remains" |
| 13 | Content differs per environment | ✅ Done |
| 14 | Build runs automatically every day | ✅ Done |
| 15 | **Preview site shows placeholder text, never real content** | ✅ Done |
| 16 | **Preview site can never appear in Google** | ✅ Done |
| 17 | Images served from a CDN, repository keeps only icons | ❌ Not started — needs a decision |

✅ done · 🟡 partly done · ⏳ blocked or unverified · ❌ not started

---

## What has been built

### Adding a language takes one file

This was tested, not assumed. A `sa.json` file containing just **three** Sanskrit words
was added. The result:

- The site built successfully
- Sanskrit appeared in the language menu **on its own**, with no code changed
- The three translated words showed in Sanskrit; everything else fell back to English
- The build listed the 98 words still needing translation

**A translator can therefore contribute a half-finished translation safely.** Nothing
breaks, and they get a checklist of what is left. The test file was then removed.

### The preview site cannot leak real content or reach Google

Four independent protections:

1. Search engines are told not to crawl it (`robots.txt`)
2. Every page carries a "do not index" instruction
3. Pages point search engines to the real site instead
4. **The real wording is never included in the preview at all** — it is replaced before
   the site is even assembled

The fourth is what makes this genuinely safe. Even if the first three failed, every page
reads "content goes here" and could not possibly rank for "Shiroor Matha".

### The build checks itself

After every build, an automatic check confirms the preview contains no real wording and
none of the institution's names. This turns a rule people are *asked* to follow into one
the computer *enforces*.

It is currently set to warn rather than fail, because the cleanup below is unfinished.

### Articles work the same way as languages

Adding a folder under `content/blog/` with a date and a text file publishes a new
article, with its own page and a listing entry. No page or menu is edited.

---

## What remains

### 1. Wording still written inside page files — the main cleanup

Some wording is still typed directly into page files instead of living in the content
files. Those pages will not translate and will not switch to placeholder text.

Progress so far, measured by the automatic check:

| Term | Before | Now |
|---|---|---|
| "Shirooru" | all 36 pages | **0** |
| "Shiroor" | all 36 pages | 28 |
| "Paryaya" | all 36 pages | 12 |

The shared header and footer are fixed, which cleared every page at once. What remains
sits in individual pages — chiefly *About*, *Contact*, *History* and *Library*. Roughly
180 pieces of text across 46 files.

**When this is finished**, one setting is switched on and the build will *fail* rather
than warn — making the guarantee absolute.

### 2. Images need to move to a CDN

Requirement 17. The images were **94MB**, which is far too large — one photograph alone
was 25MB, unusable on a phone.

They have been compressed to **5.3MB** (94% smaller) as an interim measure, so the site
loads properly today. The full solution is still to do:

- Photographs move to a CDN
- The build embeds a tiny blurred preview of each so pages never jump about
- Full images download in the browser, from the CDN
- The repository keeps only icons

**This needs one decision: which CDN.** The recommendation is Cloudflare, since the live
site will already be hosted there — one supplier, one bill.

### 3. Desktop design

There is no desktop design file — only mobile. The plan is to keep the mobile design's
colours, fonts and spacing exactly, while rearranging the layout for wider screens
(side-by-side instead of stacked, a top menu instead of a hamburger). Not started.

### 4. Checking the design matches, page by page

Requirement 1. The site was clearly built from the design, but has not been compared
screen by screen. This should be done before launch.

### 5. Connecting the live site

Cloudflare Pages is designed for and configured, but not yet connected.

### 6. Smaller items

- The seva and events lists are not yet contributor-editable, pending the backend team's
  data format
- `sitemap.xml` is hand-maintained, out of date, and lists 5 of 36 pages
- Scheduled content (items that appear and disappear on set dates) is written but not yet
  switched on

---

## Decisions taken, and why

| Decision | Reason |
|---|---|
| Improve the existing site rather than rebuild | Roughly 36 pages already existed and matched the design |
| Content in JSON files | Any translator can edit it, including with free online tools |
| English is the fallback language | A missing translation shows English rather than an empty page |
| Half-finished translations allowed | A contributor should not be blocked from helping |
| A missing article date stops the build | Unlike a translation, there is no sensible substitute |
| Preview shows placeholders by default | Real content must be switched on deliberately, so it can never leak by accident |
| Staging environment postponed | Two environments were enough; adding a third later is a small change |

---

## Recent changes

**1 August 2026** — Moved to this repository. Compressed images from 94MB to 5.3MB. Fixed
an image filename that would have broken once published (it worked on Windows only).
Pointed the build at this repository's address.

**30–31 July 2026** — Built the content system: languages discovered automatically,
English fallback, placeholder preview content, search-engine protection, article
publishing, the automatic build check, and the daily rebuild.
