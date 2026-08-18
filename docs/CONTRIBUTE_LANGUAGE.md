# How to Add or Update Languages

This document explains how to contribute translations or add support for new languages.

## 1. Identify the Target Language

- Look in `content/languages/` to see which languages already exist. Today that is
  `en.json` (English) and `kn.json` (Kannada).
- If yours is not there, choose its [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)
  — `hi` for Hindi, `ta` for Tamil, and so on.

## 2. Create the Language File

**One language is one file.** Copy `content/languages/en.json` to
`content/languages/<code>.json` and translate the values — never the keys.

```bash
cp content/languages/en.json content/languages/hi.json
```

Set the `_language` block at the top to describe your language:

```json
{
  "_language": {
    "code": "hi",
    "name": "Hindi",
    "native_name": "हिन्दी",
    "label": "HI",
    "short_label": "Hi"
  },
  ...
}
```

English (`en`) is the fallback language and must contain every key; any key you leave
out of your file falls back to it, so a partial translation is safe to submit.

**You do not need to register the file anywhere.** The build scans
`content/languages/` and discovers it — that is why adding a language requires no code
change. Confirm with `npm run build:dev`.

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

## 6. Navigation and the Language Switcher

**Nothing to do.** The language switcher is built from whatever files exist in
`content/languages/`, using the `_language` block in each. Your language appears in it
automatically. If it does not, the `_language` block is malformed — compare it against
`en.json`.

## 7. Preview the Translation

```bash
npm run dev
```

Open <http://localhost:3000/MainWebsiteUI/> and switch to your language with the
switcher. Note that the preview substitutes placeholder text by default; to see real
wording, run `SITE_ENV=prod npm run dev` (`$env:SITE_ENV = "prod"; npm run dev` in
PowerShell). See [DEVELOPER.md](DEVELOPER.md) §4.

- Check that headings, lists and formatting still render correctly.
- Validate links and any special characters or conjunct glyphs in your script.

## 8. Document Your Contribution

- In the pull request, explain the new language support or translation update.
- List the files you added or changed.
- Note whether the translation covers the full page or only a subset.

## 9. Request Review

- Ask a reviewer who is fluent in both the source and target languages to validate the translation.
- Seek feedback on meaning, tone, and cultural accuracy.
