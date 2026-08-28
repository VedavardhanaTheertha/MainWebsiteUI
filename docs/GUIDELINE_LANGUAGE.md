# Language Contribution Guidelines

## Accuracy and cultural care

- Use fluent, natural language rather than literal word-for-word substitution.
- Preserve meaning, devotional tone, sacred names, established titles, and the Matha's
  preferred terminology. Add transliteration or a short explanation when it genuinely
  helps the target audience.
- Ask a fluent reviewer with relevant cultural or subject knowledge to check the work.
- Do not introduce new factual claims while translating.

## Interface JSON

- Store one interface language in `content/languages/<code>.json`; the filename code is
  what the build auto-discovers.
- Preserve keys, nesting, value types, paths, identifiers, dates, and URLs. Translate
  only visitor-facing values.
- Keep `_language.name`, `_language.native_name`, `_language.label`, and
  `_language.short_label` readable and consistent. Keep `_language.code` aligned with
  the filename even though the filename is authoritative.
- Partial object translations are supported: omitted keys fall back to the configured
  default language and are reported by the generator. Arrays are all-or-nothing values;
  they do not merge item by item.

## Blog Markdown

- Put an article translation in `content/blog/<slug>/<code>.md`; do not place article
  prose in the interface JSON.
- Begin with exactly one level-one translated title and continue with the body. Do not
  add frontmatter; shared article metadata stays in `meta.json`.
- Preserve heading order, link destinations, quotations, citations, and verse layout.
  An absent article translation falls back to the default-language Markdown.

## Readability and encoding

- Save JSON and Markdown as UTF-8 and use Unicode characters directly.
- Prefer clear sentences, paragraph breaks, and lists; test wrapping at mobile widths.
- Use consistent spelling and transliteration throughout a contribution.
- Run `npm run ci` and disclose whether linguistic review is complete.

For exact file-creation steps, see
[How to Add or Update Languages](./CONTRIBUTE_LANGUAGE.md).
