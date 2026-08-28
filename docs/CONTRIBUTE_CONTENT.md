# How to Add or Update Content

This project has three distinct content workflows. Choose the one that matches the
material; they are not interchangeable.

| Content | Repository and location | Format |
|---|---|---|
| Website labels, page copy, forms, and page metadata | This repository: `content/languages/<code>.json` | JSON |
| Blog/news articles | This repository: `content/blog/<slug>/` | JSON metadata plus Markdown bodies |
| Bhakti/library corpus | [WebsiteLibrary](https://github.com/VedavardhanaTheertha/WebsiteLibrary), checked out here as `library/` | Corpus metadata plus Markdown |

## Website UI text

1. Edit the value of the appropriate key in `content/languages/en.json`; do not rename
   keys or put display text in `src/`.
2. Update translated values where possible. A translation may omit unfinished keys;
   those keys fall back to the default language and are reported during generation.
3. Keep the `_language` descriptor intact. See
   [How to Add or Update Languages](./CONTRIBUTE_LANGUAGE.md) when adding a language.
4. Run `npm run ci` for a local code checkout, or explain in the pull request when local
   validation was not possible.

The generator discovers language JSON files automatically. No component, registry, or
type file needs to be updated for a content-only change.

## Blog or news article

1. Create `content/blog/<slug>/`, where `<slug>` is lowercase words separated by
   hyphens and becomes the URL segment.
2. Add `meta.json` with a required ISO `YYYY-MM-DD` date. Optional shared fields are
   `hero` and `tags`.
3. Add the default-language Markdown file. Its first line must be one level-one title;
   the remaining Markdown is the body. Do **not** add frontmatter.
4. Add optional translations as `<code>.md`. When one is absent, that article falls
   back to the default-language Markdown.
5. Put new optimized article media under the tracked `public/articles/` directory and
   reference it as `/articles/<descriptive-file>.webp`. Existing older assets remain
   directly under `public/` and `public/slide/`; do not move them as part of an article.
   Do not use `public/media/`; that directory does not exist.
6. Record new text and media provenance in `ASSET_PROVENANCE.md`.
7. Run `npm run ci`.

The build discovers article folders and creates listing, route, sitemap, and canonical
output automatically. Missing `meta.json`, an invalid date, a missing default-language
file, or a missing first-line title fails generation. Raw HTML is disabled and rendered
Markdown is sanitized.

## WebsiteLibrary corpus

Bhakti corpus changes belong in the
[WebsiteLibrary repository](https://github.com/VedavardhanaTheertha/WebsiteLibrary), not
in generated files under `src/gen/` and not as a blog post here.

1. Follow the corpus structure already present in WebsiteLibrary's `dasasahitya/`
   directory: Markdown source files are indexed by its `metadata.json`.
2. Update both the Markdown and the corresponding metadata entry in the library
   repository. Preserve its identifiers and required schema.
3. Submit and review that change in WebsiteLibrary first.
4. A later MainWebsiteUI change may advance the `library` submodule reference. Run
   `git submodule update --init --recursive` and `npm run ci` when validating that
   integration.

The MainWebsiteUI build reads `library/dasasahitya/metadata.json`, sanitizes each listed
Markdown file, and generates disposable output under `src/gen/bhakti/`.

## Review requirements

- Follow the [content guidelines](./GUIDELINE_CONTENT.md).
- Ask a subject-matter reviewer to check devotional, historical, and scholarly claims.
- Verify links, spelling, title hierarchy, permissions, and attribution.
- Keep each pull request focused on one content purpose and describe translations that
   are intentionally partial.
