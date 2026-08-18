# Knowledge Transfer — Working on the Shiroor Matha Website

**This is the practical guide.** It covers how to run the project, how to make the
common kinds of changes, and what to do when something goes wrong.

For *why the system is built this way*, see [ARCHITECTURE.md](./ARCHITECTURE.md).

> ### ⚠️ Read this first — current status
>
> **The content system described here is built and working.** Adding a language, adding
> a blog post, and the dev/production split all function today.
>
> One thing is **not** finished: some text is still hardcoded inside page files rather
> than coming from `content/`. That means a few pages will not respond to translation or
> to placeholder mode until they are migrated. The build reports exactly which ones —
> see [ARCHITECTURE.md §11](./ARCHITECTURE.md#11-known-gaps-and-planned-work).

---

## 1. Who this guide is for

| You are… | Read |
|---|---|
| A translator adding a language | §4 |
| Someone writing a blog post or news item | §5 |
| Someone fixing a typo or changing text | §3 |
| A developer changing layout or behaviour | §2, §7, §8 |
| Setting up deployment | §7 |

**If you only want to change words or add content, you never need to open a code file.**
Everything lives in the `content/` folder.

---

## 2. Getting set up ✅

### Prerequisites

- **Node.js 20 or newer** — check with `node --version`
- **Git**

### First-time setup

```bash
git clone https://github.com/anooshaashetty/shiruru_final_21june.git
```

Then install dependencies:

```bash
npm install
```

### Run the site locally

```bash
npm run dev
```

Then open:

<http://localhost:3000/shiruru_final_21june/>

**Note the path on the end.** The dev environment is configured to be served from a
sub-path, because GitHub Pages hosts project sites at
`https://<user>.github.io/<repo>/`. Local dev matches the deployed dev site exactly, so
what you test is what gets published. Plain `http://localhost:3000` will 404 — that is
expected, not a broken install. The sub-path comes from `base_path` in `config/site.yml`.

**What you will see:** placeholder text like *"en·home hero body — content goes here"*
rather than real content. **This is correct and intentional** — see §6 for why, and how
to view real content when you need to.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the development server |
| `npm run content:build` | Regenerate content without running the site |
| `npm run build:dev` | Full dev build with verification, into `out/` |
| `npm run build:prod` | Full production build with verification, into `out/` |
| `npm run verify` | Re-run the output checks against an existing `out/` |
| `npm run lint` | Check code style |

---

## 3. Changing text on the site ✅

All text lives in `content/languages/`. There is one file per language.

1. Open `content/languages/en.json`
2. Find the key for the text you want to change
3. Edit the value, save
4. Refresh the browser

**Never edit text inside `src/`.** If you find text hardcoded in a component, that is a
bug — see §9.

**Remember to update the other languages too.** If you change an English string, the
Kannada version in `kn.json` still says the old thing. The build will not stop you, but
the site will be inconsistent.

---

## 4. Adding a new language ✅

This is designed to be the simplest possible task.

### Steps

1. Copy `content/languages/en.json` to `content/languages/<code>.json`
   — use the standard language code, e.g. `sa.json` for Sanskrit, `hi.json` for Hindi
2. Translate the values. **Leave the keys exactly as they are** — only change what is
   after the colon
3. Set the language's own display name near the top of the file, so it appears correctly
   in the language menu
4. Run `npm run dev` and use the language switcher to check your work
5. Open a pull request with just that one file

### That is the whole process

You do **not** need to edit the language switcher, register the language anywhere, or
touch any code. The build scans the folder and finds your file automatically.

### You do not have to translate everything

A partial translation is completely valid. Any key you leave out falls back to English.
The build prints a list of what fell back, so you can see what is left to do — it will
not block you.

**Tip:** delete the keys you have not translated rather than leaving English text in
them. Both work identically, but deleting makes the fallback report accurate.

---

## 5. Adding a blog post or news item ✅

### Steps

1. Create a folder: `content/blog/<url-slug>/`
   — the folder name becomes the web address, so use lowercase words with hyphens,
   e.g. `solar-power-installed`

2. Add `meta.json` inside it:

```json
{
  "date": "2026-07-14",
  "hero": "/media/solar-panels.jpg",
  "tags": ["news", "projects"]
}
```

3. Add `en.md` with the title and body:

```markdown
# Solar Power Installed at the Matha

The first paragraph of the article goes here.

Further paragraphs, **bold text**, and [links](https://example.com) all work.
```

4. Put any images in `public/media/` and reference them by path as shown above

5. Optionally add `kn.md` (or any other language) in the same folder for translations

### That is it

The post appears in the blog listing and gets its own page automatically. No page or
menu needs editing.

### Required fields

`date` and a title are mandatory. **A post missing either will fail the build** — this is
deliberate, because there is no sensible default for them. If the build fails after you
add a post, this is the first thing to check.

---

## 6. Why you see placeholder text, and how to see real content ✅

### Why

The development site deliberately shows placeholder text instead of real content, for
two reasons:

1. **Search engines must not index the development site**, where it would compete with
   the real site and confuse visitors who find it.
2. **It automatically catches hardcoded content.** If you ever see real Shiroor text on
   the dev site, somebody has bypassed the content system and written text directly into
   a component — see §9.

### To see real content locally

```bash
SITE_ENV=prod npm run dev
```

On Windows PowerShell:

```bash
$env:SITE_ENV = "prod"; npm run dev
```

**Use this when reviewing wording or content.** Use the default placeholder mode when
reviewing layout — placeholders are padded to roughly the real text's length, so layouts
still look representative.

---

## 7. How deployment works ✅

| Branch | Deploys to | Shows |
|---|---|---|
| `dev` | GitHub Pages (development site) | Placeholder content |
| `main` | Cloudflare Pages (live site) | Real content |

### What happens when you push

Pushing to `dev` automatically rebuilds and updates the development website. No manual
step is needed.

The site also rebuilds **once every day**, even with no changes pushed. This is not
redundant — some content is scheduled to appear or disappear on particular dates, and the
daily rebuild keeps the published pages correct for the current day.

### Running the deployment build locally

```bash
npm run build:dev
```

This runs exactly what the automated pipeline runs — generate content, export the static
site, then verify the output — which makes build problems far easier to diagnose than
repeatedly pushing commits to test them.

Use `npm run build:prod` to produce the production build.

### What the verification step checks

After every build, `build/verify.mjs` confirms:

1. `robots.txt` matches the environment's indexing policy
2. Non-production pages carry a `noindex` tag
3. Non-production pages contain no real content
4. Non-production pages contain none of the institution's brand terms

Checks 3 and 4 currently report **warnings** rather than failing the build, because the
migration of hardcoded text is still in progress. Once it is finished, set
`build.fail_on_hardcoded_content: true` in `config/site.yml` to make them enforced.

---

## 8. Project structure at a glance ✅

```
content/     ← all text, translations, and posts. Contributors work here.
public/      ← images and static files
src/app/     ← page routes (structure only, no content)
src/components/  ← reusable UI pieces (structure only, no content)
src/lib/     ← shared logic
config/      ← environment and build settings
build/       ← build and verification scripts
docs/        ← this guide and the architecture document
```

**The rule that explains the whole layout:** `src/` decides *how things look and behave*.
`content/` decides *what they say*. The two never mix.

---

## 9. Common problems

### The page is blank or 404s at http://localhost:3000

Add the sub-path: <http://localhost:3000/shiruru_final_21june/>. See §2.

### The build warns that a language is missing keys

That is informational, not an error. Those keys fall back to English. The message lists
which ones so you know what is left to translate.

### I see real Shiroor text on the development site

**This is a bug, and a useful one.** It means text has been hardcoded into a component
instead of coming from `content/`. Find the text in `src/`, move it into
`content/languages/en.json`, and reference it from the component.

Some pages are known to still do this — the migration is unfinished. Run
`npm run build:dev` and read the verification warnings for the current list.

### My new blog post does not appear

- Is the folder inside `content/blog/`?
- Does it contain both `meta.json` and at least `en.md`?
- Does `meta.json` have a valid `date` in `YYYY-MM-DD` form?
- Does `en.md` start with a `# Title` heading? It is required.
- Restart the dev server — new folders are picked up at startup.

### My images do not load

- Is the image inside `public/`?
- Does the path in your content file start with `/` and omit `public`?
  `public/media/photo.jpg` is referenced as `/media/photo.jpg`.
- Check capitalisation and the file extension exactly — `.JPG` and `.jpg` are different
  on the deployment server even though Windows treats them as the same.

### Changes to content do not show up

Content is compiled at startup. Stop the dev server and run `npm run dev` again.

---

## 10. What is not part of this project

This repository is the **frontend and static site only.** The following belong to the
backend team and are intentionally not implemented here:

- What happens after a volunteer form is submitted
- Payment and donation processing
- Storing or emailing feedback submissions
- Any live or user-specific data

Forms and lists in this repository are built up to the point of the submit action. If you
need to change what happens *after* submission, that is a backend request, not a change
to this repository.

---

## 11. Keeping the documentation current

If you change how any of this works, **update these documents in the same pull request.**
Structural and design changes go in [ARCHITECTURE.md](./ARCHITECTURE.md); changes to
how contributors do things go here.

Documentation that lies is worse than no documentation, because people trust it and then
waste hours.
