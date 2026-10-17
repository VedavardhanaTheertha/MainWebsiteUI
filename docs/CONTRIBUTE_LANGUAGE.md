# How to Add or Update Languages

Website interface translations are JSON files in `content/languages/`. Topic and
article translations live with their canonical Markdown in `library/`.

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
3. Add translated keys using the same nesting and value types as the configured default-language
   JSON. Never translate key names, paths, identifiers, dates, or URLs.
4. A partial file is valid. Missing object keys are deep-merged from the default
   language and reported during generation. Arrays are replaced as complete values,
   not merged item by item, so translate or omit an entire array.
5. Run `npm run dev:local` to inspect the language with real copy selected, and run
   `npm run ci` before requesting review. The default development export starts
   with placeholders; local/development previews can switch copy variants.

The configured default language must remain complete because every other interface
language falls back to it. For a partial translation, omit unfinished keys rather than
copying default-language text; this keeps the fallback report useful.

## Update an interface translation

- Edit values only, preserving JSON syntax, keys, nesting, and value types.
- Save the file as UTF-8 and review long labels at mobile widths.
- Compare devotional terms, names, punctuation, numbers, and links with the source.
- State in the pull request whether review was performed by a fluent speaker.

## Translate topic content

Interface JSON does not contain editorial article bodies. Follow the translation
schema of the canonical source in `library/<topic>/`: some records use
language-keyed frontmatter and body sections, while collections may use translated
sibling files. Preserve shared IDs, dates, paths, citations, and factual metadata.
Missing translations inherit the configured default where supported; do not invent
content to fill a gap.

Translate homepage copy in settings JSON and page-reference text in `library/pages/`.
Keep short reusable UI labels in language JSON. Learn's page-owned labels live with
its Markdown collection. No language names need to be registered in `src/`.

See the [language quality guidelines](./GUIDELINE_LANGUAGE.md) and the
[content workflow](./CONTRIBUTE_CONTENT.md) before submitting.
