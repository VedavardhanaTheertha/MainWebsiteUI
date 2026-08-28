# How to Add or Update Languages

Website interface translations are JSON files in `content/languages/`. Blog article
translations are separate Markdown files in each article folder.

## Add an interface language

1. Choose a stable language code and create `content/languages/<code>.json`. The file
   name is authoritative: the build scans all JSON files and uses `<code>` for the
   generated language map and HTML language value. No registry change is needed.
2. Start with this descriptor:

   ```json
   {
     "_language": {
       "code": "hi",
       "name": "Hindi",
       "native_name": "हिन्दी",
       "label": "HI",
       "short_label": "Hi"
     }
   }
   ```

   `name`, `native_name`, `label`, and `short_label` control switcher labels. The
   descriptor's `code` should match the filename for clarity, although discovery uses
   the filename. When a descriptor label is absent, the generator falls back to the
   name, filename code, or uppercase code as appropriate.
3. Add translated keys using the same nesting and value types as the default-language
   JSON. Never translate key names, paths, identifiers, dates, or URLs.
4. A partial file is valid. Missing object keys are deep-merged from the default
   language and reported during generation. Arrays are replaced as complete values,
   not merged item by item, so translate or omit an entire array.
5. Run `npm run ci`. To inspect real wording locally, run `SITE_ENV=prod npm run dev`
   (PowerShell: `$env:SITE_ENV = "prod"; npm run dev`). The default development
   environment intentionally shows placeholders.

The configured default language must remain complete because every other interface
language falls back to it. For a partial translation, omit unfinished keys rather than
copying default-language text; this keeps the fallback report useful.

## Update an interface translation

- Edit values only, preserving JSON syntax, keys, nesting, and value types.
- Save the file as UTF-8 and review long labels at mobile widths.
- Compare devotional terms, names, punctuation, numbers, and links with the source.
- State in the pull request whether review was performed by a fluent speaker.

## Translate a blog article

Interface JSON does not contain blog bodies. In `content/blog/<slug>/`, add
`<code>.md` beside the required default-language Markdown file. The first line must be
`# Translated title`; the remainder is the translated body. Do not add frontmatter.
Shared date, hero, and tags remain in that article's `meta.json`. If a language-specific
Markdown file is absent, the article falls back to the default-language version.

See the [language quality guidelines](./GUIDELINE_LANGUAGE.md) and the
[content workflow](./CONTRIBUTE_CONTENT.md) before submitting.
