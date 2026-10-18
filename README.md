# Shri Shiroor Matha — Official Website Source Repository

Welcome to the official open-source repository for the website of [**Shri Shiroor Matha**](https://www.shiroormatha.org/), one of the Ashta Mathas of Udupi established by Jagadguru Shri Madhwacharya.

This project aims to connect devotees globally with the spiritual heritage, daily rituals,
scholarly traditions, and cultural initiatives of the Matha. The code and documentation
contributed under Apache-2.0 are open source. Devotional works, institutional names
and logos, photographs, and media remain subject to their applicable licenses and
attribution requirements.

---

## 🌟 Vision Statement

> **"To create a timeless, open, and globally accessible digital sanctuary that preserves, illuminates, and disseminates the sacred traditions, scholarly heritage, and spiritual wisdom of the matha—empowering devotees, scholars, and future generations worldwide through collaborative technology and community devotion."**

### Key Pillars Supporting the Vision

- **Universal Accessibility:** Delivering a seamless, multilingual, and mobile-first experience so that every devotee—regardless of location, device, or background—can connect with the Matha’s daily rituals, teachings, and heritage.

- **Living Digital Library:** Cultivating an accessible repository of stotras, dasa padas, articles, historical archives, and traditional knowledge that grows through community contributions.

- **Community-Driven & Enduring:** Grounding the code and documentation in open-source principles while preserving applicable licenses and required attribution for cultural and media assets.

- **Harmonious Blend of Tradition & Technology:** Utilizing modern, high-performance static web technologies while honoring the sacred ethos and cultural integrity of Madhwa philosophy.

---

## ❤️ Why Join Us as a Contributor?

Preserving and sharing our sacred heritage requires a collective effort. Serving through your unique skills—whether seva through scholar curation, linguistic translation, design, or coding—helps make the teachings and traditions of the Matha accessible to millions globally.

### 📜 For Scholars & Content Creators

- **Digital Seva & Heritage Preservation:** Help organize, digitize, and curate sacred stotras, dasa padas, articles, and historical archives.

- **No Coding Knowledge Required:** Content is strictly decoupled from site code. You can write and update articles directly on GitHub using structured Markdown files.

### 🗣️ For Language Experts & Translators

- **Expand Reach:** Translate content between Kannada, English, and other regional languages so devotees from all geographies can connect with the Matha and tradition.

- **Simple File System:** Adding or updating a language is as straightforward as editing a single localization file.

### 💻 For Developers & Tech Enthusiasts

The site uses Next.js static export with filesystem-discovered languages, searchable
Markdown collections, media albums, and settings-driven interactions. Content and
configuration are reviewed separately from rendering code.

### 🎨 For Designers & Media Artists

- **Sacred Aesthetics:** Design accessible, mobile-first interfaces and elegant graphics honoring the cultural ethos of the Matha.

---

## 🚀 Getting Started

For a local checkout, use Node.js 22 LTS and npm 10:

```powershell
git clone --recurse-submodules <repository-url>
Set-Location MainWebsiteUI
npm ci
npm run dev:local
```

`library/` and `settings/` are Git submodules and must be initialized. UI labels live
in `content/languages/`, canonical topic content in `library/`, and homepage/navigation
behavior in `settings/`. Do not edit generated files in `src/gen/`.

Use `npm run build:dev` or `npm run build:prod` for a verified static export. Read the
[Developer Guide](docs/DEVELOPER.md) for preview commands, base paths, validation,
and clean-checkout checks.

After a matching build, `npm start -- dev` previews the existing development export
at `http://localhost:3000/MainWebsiteUI/`. Use `local` or `prod` instead after building
that environment; both preview at the site root. Preview does not rebuild content.

- **General contribution guide:** Read [CONTRIBUTING.md](CONTRIBUTING.md).

Choose the path that best aligns with your background and interests:

### ✍️ Content & Scholarship

- **Explore Content Types:** Read [Types of Content](docs/CONTENT_TYPES.md).
- **Review Editorial Guidelines:** Read [Content Contribution Guidelines](docs/GUIDELINE_CONTENT.md).
- **Start Contributing:** Follow [How to Add or Update Content](docs/CONTRIBUTE_CONTENT.md).

### 🌐 Translations & Languages

- **Review Language Standards:** Read [Language Contribution Guidelines](docs/GUIDELINE_LANGUAGE.md).
- **Start Translating:** Follow [How to Add or Update Languages](docs/CONTRIBUTE_LANGUAGE.md).

### 💻 Software Development

- **Set Up Your Environment:** Read [Developer Environment Setup](docs/DEVELOPER.md).
- **Review Code Guidelines:** Read [Software Contribution Guidelines](docs/GUIDELINE_SOURCE_CODE.md).
- **Submit Pull Requests:** Follow [How to Contribute to Source Code](docs/CONTRIBUTE_SOURCE_CODE.md).
- **Understand the design:** Read [Architecture](docs/ARCHITECTURE.md) for current
  content ownership, environments, build flow, and trust boundaries.

### 🎨 UI/UX & Graphic Design

- **UI/UX Guidelines & Process:** Read [UI/UX Guidelines](docs/GUIDELINE_UIUX.md) and [How to Update Website Design](docs/CONTRIBUTE_UIUX.md).
- **Icons & Visual Media:** Read [Graphics Guidelines](docs/GUIDELINE_GRAPHICS.md) and [How to Add Icons/Graphics](docs/CONTRIBUTE_GRAPHICS.md).

### 💡 Ideas, Feedback & Issue Reporting

- **Report Bugs:** Read [Issue Reporting Guidelines](docs/GUIDELINE_REPORT_ISSUE.md) and [How to Report an Issue](docs/CONTRIBUTE_REPORT_ISSUE.md).
- **Suggest Features:** Read [Idea Submission Guidelines](docs/GUIDELINE_SUBMIT_IDEA.md) and [How to Submit an Idea](docs/CONTRIBUTE_SUBMIT_IDEA.md).

---

## 📜 License

Code and documentation intentionally contributed here are available under
[Apache-2.0](LICENSE). Preserve applicable licenses and required attribution for
devotional works, institutional names/logos, photographs, and media.
