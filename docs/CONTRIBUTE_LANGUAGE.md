# How to Add or Update Languages

This document explains how to contribute translations or add support for new languages.

## 1. Identify the Target Language

- Confirm whether the repository already has a section for the language you want to add.
- If the language does not exist yet, choose an appropriate two-letter code for the folder or file extension.

## 2. Create Language Files or Folders

- Add a new folder such as `language/kn/` or `language/hi/` if the repository structure supports language-specific directories.
- Alternatively, add language-specific Markdown files such as `page.en.md` and `page.kn.md`.

## 3. Translate Page Metadata

- Ensure translated pages include the same metadata fields as the original.
- Translate:`
  - title
  - summary
  - category
  - author or contributor details
  - publication date, if applicable

## 4. Translate the Main Text

- Translate headings, body text, lists, and captions.
- Keep the flow and meaning consistent with the source content.
- Use the guidance from `docs/GUIDELINE_LANGUAGE.md`.

## 5. Add Transliteration When Appropriate

- For sacred verses and devotional names, add transliteration if the target audience may not read the original script.
- Include the original script alongside transliteration and translation where possible.

## 6. Update Navigation or Language Switcher

- If the website has a language selector or navigation menu, add the new language entry in the relevant configuration files.
- Consult maintainers before changing global navigation settings.

## 7. Preview the Translation

- Check the rendered Markdown to confirm headings, sections, and formatting remain intact.
- Validate any links or special characters.

## 8. Document Your Contribution

- In the pull request, explain the new language support or translation update.
- List the files you added or changed.
- Note whether the translation covers the full page or only a subset.

## 9. Request Review

- Ask a reviewer who is fluent in both the source and target languages to validate the translation.
- Seek feedback on meaning, tone, and cultural accuracy.
