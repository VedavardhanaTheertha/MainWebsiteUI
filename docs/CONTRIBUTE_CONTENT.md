# How to Add or Update Content

> **Which repository does your change belong in?**
>
> | You are changing | Repository | Path |
> |---|---|---|
> | Words shown on a page of the website | **this one** | `content/languages/<code>.json` |
> | A blog article | **this one** | `content/blog/<slug>/` |
> | Library corpus — stotras, dasa padas, archival texts | [WebsiteLibrary](https://github.com/VedavardhanaTheertha/WebsiteLibrary) | see that repo |
>
> The Bhakti page is generated from the `library` Git submodule. Blog articles and UI
> text are built from this repository's `content/` tree.

This document explains the contribution workflow for adding new devotional, educational, or heritage content.

## 1. Find the Right Location

- Browse the repository structure to locate the section that best fits your content.
- If you are contributing a stotra, article, or historical write-up, add it under the appropriate content folder.

## 2. Create or Update a Markdown File

- Create a new `.md` file with a descriptive filename.
- Use the naming convention that matches existing content pages, if any.
- If you are updating existing content, edit the Markdown file directly.

## 3. Add Metadata and Frontmatter

- If the site uses frontmatter metadata, include:
  - title
  - date or publication date
  - author or contributor
  - language
  - category or section
- If frontmatter is not required, simply ensure the document begins with a clear title.

## 4. Write the Content

- Follow the editorial guidelines in `docs/GUIDELINE_CONTENT.md`.
- Keep sections clearly labeled and structured.
- Use headings, lists, and short paragraphs.
- Add translations or notes if the content has multiple language versions.

## 5. Add Supporting Resources

- If the content references audio, images, or documents, include a clear credit and file name.
- Ensure that attached media is stored in the appropriate repository location.
- Record its creator, source, license or permission evidence, modifications, and review
  date in `ASSET_PROVENANCE.md`.

## 6. Preview and Validate

- Preview the Markdown locally if you can.
- Check that links, headings, and formatting render correctly.

## 7. Submit a Pull Request

- Create a branch for your changes.
- Add a descriptive commit message.
- Open a pull request with a summary of what you added or updated.
- Include links to any related issues or discussions.

## 8. Ask for a Review

- Request review from maintainers or contributors familiar with the Matha’s tradition.
- If your content is devotional or scholarly, ask for a second pair of eyes on meaning and accuracy.

## 9. Update Based on Feedback

- Respond to comments in the pull request.
- Revise the content to address any review suggestions.
- Keep the contribution focused and well-organized.
