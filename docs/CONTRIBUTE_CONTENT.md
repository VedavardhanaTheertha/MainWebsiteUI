# How to Add or Update Content

Choose the canonical owner before editing:

| Content | Location |
|---|---|
| Short reusable UI labels and language descriptors | `content/languages/<code>.json` |
| Topic prose, page metadata, articles, and collection introductions | `library/<topic>/` Markdown |
| Homepage copy and card selection | `settings/home.json` |
| Homepage card metadata | `library/pages/*.md` |
| Environment-specific hero groups | `library/hero/{dev,prod}/*.hero.json` |
| Behavior, navigation, search, images, and theme | Relevant `settings/` JSON |

`library/` and `settings/` are separate repositories checked out as Git submodules.
Publish reviewed changes there before updating the website's submodule references.
Do not edit generated files under `src/gen/` or place visitor-facing text in `src/`.

## UI labels and translations

Edit the appropriate default-language value, preserving its key and type. The default
language is configured in `config/site.yml`. Add translations where they are genuinely
available; omitted object keys inherit the default. Arrays are replaced as complete
values, not merged item by item.

Language JSON files are discovered automatically. Follow
[CONTRIBUTE_LANGUAGE.md](CONTRIBUTE_LANGUAGE.md); no component registry is needed.

## Topic and collection Markdown

Follow an existing record of the same kind and retain stable IDs, frontmatter keys,
source attribution, citations, and review status. Structured page copy uses
language-keyed frontmatter fields; knowledge articles use the topic's supported
metadata and Markdown body schema. Do not duplicate frontmatter prose in an unused
body or in language JSON. Raw HTML is disabled and rendered Markdown is sanitized.

Common owners:

- `learn/index.md` and subject Markdown own learning labels, order, metadata, and
  suggested paths. Do not create a separate Learn settings file.
- `parampara/` owns guru facts and portraits; numeric filename prefixes determine
  order. Preserve optional facts and translation fallback.
- `branches/` owns verified branch details. Use an empty phone only where no verified
  number is available; do not invent contact data.
- `connect/` owns official channels used by Connect, footer, and public actions.
  Broadcast channels must not be used for private enquiries.
- `sevas/` owns offerings, booking destinations, and language-specific guideline
  bodies. `donations/pages/donation.md` owns the localized material-enquiry catalog;
  do not maintain a second catalog.
- `dasasahitya/` owns the Bhakti corpus. Preserve verse layout, IDs, attribution,
  ankita, and source metadata. The build indexes complete text; do not add manual
  search tags to song records.
- Knowledge topics such as `mantra/`, `shastra/`, `projects/`, and `remedies/` have
  validated section-specific metadata. Match the source schema and retain visible
  knowledge/review status.

Use the active articles and events collections for their respective published
material. Add page references only for routes that actually exist; a reference file
does not create a page.

Event dates use valid `YYYY-MM-DD` calendar values. Quoted and unquoted YAML dates
normalize to the same date-only output. A missing end date uses the start date;
leaving both dates absent preserves an undated event. An end date without a start,
a reversed range, an invalid calendar day, or a timestamp is rejected. Missing or
malformed event frontmatter fails generation with the source filename rather than
silently omitting the event.

## Homepage

The four curated lists in `settings/home.json` reference `library/pages/` filenames:
six top cards, five icon cards, six bottom cards, and three explore cards. Titles,
descriptions, image references, destinations, types, and footnotes live in the
multilingual page-reference Markdown.

Do not author `remidies_carousel` in settings. Generation selects three distinct
remedy articles and shares the selection across language/content variants; maintain
at least four eligible articles. Keep hero groups in their configured
environment folders.

## Accuracy, dates, and actions

Do not invent translations, dates, enrollment URLs, citations, or institutional claims.
The Yajna announcement owns its popup, associated page copy, and metadata in one
Markdown source. Update its count and `pages.local_copy.yajna_as_of_date` together,
using the same valid ISO date across translations. Do not substitute the build date.
Keep Panchanga's temporary test-data note visible.

Public action destinations belong in `settings/public_actions.json`; official
channel references resolve to `library/connect/` records. Preserve the configured
payment URL and its query parameters. Do not invent private-message destinations or
imply an unsubmitted form succeeded.

## Review and validation

1. Follow [GUIDELINE_CONTENT.md](GUIDELINE_CONTENT.md).
2. Have devotional, historical, and scholarly claims checked by an appropriate reviewer.
3. Preserve applicable licenses, required attribution, and article citations.
4. Check links, spelling, heading hierarchy, and mobile readability.
5. Run `npm run content:validate` for generation/schema feedback and `npm run ci`
   before requesting integration review. Read the build verification reports.
6. State which translations and factual reviews are incomplete, and disclose any
   validation that could not be performed.
