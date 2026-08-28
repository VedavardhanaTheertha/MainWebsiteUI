# Content Contribution Guidelines

This document explains how to contribute content in a way that preserves spiritual
integrity, clarity, and consistency.

> **Which repository does your change belong in?**
>
> | You are changing | Repository | Path |
> |---|---|---|
> | Words shown on a page of the website | **this one** | `content/languages/<code>.json` |
> | A blog article | **this one** | `content/blog/<slug>/` |
> | Library corpus — stotras, dasa padas, archival texts | [WebsiteLibrary](https://github.com/VedavardhanaTheertha/WebsiteLibrary) | see that repo |
>
> The Bhakti page is generated from the `library` Git submodule. UI labels and blog
> articles come from this repository's `content/` tree. Initialize submodules recursively.

## 1. Respect the Tradition

- Use respectful language and avoid any wording that could be interpreted as promotional, controversial, or disrespectful.
- Prefer traditional terms and names as they are commonly accepted in Madhwa literature.
- When translating or explaining sacred text, maintain the meaning carefully.

## 2. Follow a Structured Format

- Use Markdown headings to create a clear structure.
- Separate metadata from body content if the site uses frontmatter or content metadata.
- Keep paragraphs concise and readable.

## 3. Cite Sources

- Provide references for scriptures, historical details, biographies, and scholarly commentary.
- If content is derived from a published work, mention the author and source.

## 4. Maintain High Quality

- Proofread for spelling, grammar, and clarity.
- Avoid large blocks of unformatted text.
- Use bullet lists, tables, and headings when appropriate.

## 5. Use Plain and Accessible Language

- Write for a broad audience that includes seekers, students, and global visitors.
- Avoid overly technical or academic jargon unless it is necessary and explained.

## 6. Review Before Submitting

- Verify factual accuracy in dates, names, and traditions.
- Check that links point to valid resources.
- Confirm that media files are licensed or free to use if referenced.
- Add or update the exact `ASSET_PROVENANCE.md` entry; public availability is not
	evidence of permission.

## 7. Preserve Cultural Sensitivity

- Avoid comparisons or framing that could upset cultural or religious sentiments.
- Respect the devotional context of all sacred material.
- When in doubt, keep the content simple and reverent.

## 8. Developer-Friendly Content

- Store all content in Markdown or structured text formats compatible with the website.
- Do not embed complex HTML, scripts, or layout-specific instructions inside content files.
- Raw HTML is disabled. Links may use relative paths, `http`, `https`, or `mailto` only.
- Keep media references separate from content when possible.

## 9. Collaboration and Feedback

- Provide a clear description of your changes in your pull request.
- Use GitHub issue discussions to ask for review on sensitive content.
- Welcome feedback and be ready to revise drafts.
