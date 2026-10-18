# Content Types

This document describes all the types of content used in the Matha website and how each
type is intended to be structured. **All content should be of Madhwa Siddantha.**

> **Which repository does your change belong in?**
>
> | You are changing | Repository | Path |
> |---|---|---|
> | Short UI labels and media catalogs | **this one** | `content/languages/<code>.json` |
> | Editorial pages and Learn | **WebsiteLibrary** | `library/<topic>/` Markdown |
> | Articles and essays | **WebsiteLibrary** | Canonical knowledge-topic Markdown, such as `library/articles/` |
> | Homepage copy and configuration | **Settings submodule** | `settings/` JSON |
> | Library corpus — stotras, dasa padas, archival texts | [WebsiteLibrary](https://github.com/VedavardhanaTheertha/WebsiteLibrary) | see that repo |
>
> Short UI text comes from `content/` in this repository. Editorial, Learn,
> Bhakti and knowledge collections come from WebsiteLibrary; homepage copy is settings
> JSON. Canonical sources are assembled at build time. See
> [ARCHITECTURE.md](ARCHITECTURE.md) for current ownership and integration.

## 1. Sacred Texts & Scriptures

Includes stotras, dasa padas, mantras, slokas, and other devotional compositions.

- Purpose: Preserve and share traditional devotional material.
- Recommended structure:
  - title
  - kruti (creator)
  - original text
  - transliteration in English
  - source or reference
  - collection-supported metadata (Bhakti indexes the complete text, not manual tags)

## 2. Articles & Essays

Includes educational articles, historical essays, spiritual teachings, and discourses.

- Purpose: Explain context, history, and meaning for a broad audience.
- Recommended structure:
  - title
  - introduction
  - body sections with clear headings
  - summary or conclusion
  - references or citations

## 3. News & Announcements

Includes event notices, festival updates, program schedules, and important announcements.

- Purpose: keep devotees informed of current and upcoming Matha activities.
- Recommended structure:
  - headline
  - date
  - summary
  - full details
  - location/time
  - registration or contact details

## 4. Cultural Heritage & History

Includes biographies, lineage accounts, temple histories, and traditional lore.

- Purpose: preserve and share the Matha’s cultural and spiritual heritage.
- Recommended structure:
  - title
  - timeline or history summary
  - key figures and events
  - cultural significance
  - supporting sources

## 5. Educational Resources

Includes tutorials, study guides, glossaries, and reference material.

- Purpose: support students, scholars, and devotees who want to deepen their understanding.
- Recommended structure:
  - title
  - learning objectives
  - content sections
  - practice or reflection questions
  - further reading recommendations

## 6. Multimedia Content

Includes audio, video, image galleries, and media-rich presentations.

- Purpose: make devotional and cultural content accessible through audio-visual formats.
- Recommended structure:
  - title
  - description
  - media type and format
  - author or source credits
  - usage guidance

## 7. Best Practices

- Keep content accurate and respectful of Madhwa tradition.
- Use clear headings and readable Markdown formatting.
- Provide references or sources when possible.
- Keep the website’s global audience in mind.
- Separate content and presentation: content files should be ready for website rendering without relying on styling notes.
