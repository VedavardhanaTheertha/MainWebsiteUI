# Shri Shiroor Matha — Official Website Source repository

Welcome to the official open-source repository for the website of [**Shri Shiroor Matha**](https://www.shiroormatha.org/), one of the Ashta Mathas of Udupi established by Jagadguru Shri Madhwacharya.

This project serves as a digital bridge connecting devotees globally with the spiritual heritage, daily rituals, scholarly traditions, and cultural initiatives of the Matha. By making this project entirely open-source, we ensure that its spiritual content, library materials, and core web technology remain community-owned, transparent, and enduring for generations to come.

---

## 👀 See it running

**You do not need to install anything to review the site.**

| | Link |
|---|---|
| **Development preview** | https://vedavardhanatheertha.github.io/MainWebsiteUI/ |
| **Build status** | [Actions tab](../../actions) |

Every push to a development branch rebuilds and republishes the preview automatically.
Open the link and look at the site — that is the whole review process.

> ### ⚠️ Why the preview shows "content goes here"
>
> The preview deliberately shows **placeholder text** instead of the real wording, like
> `en·hero title — content goes here`. **This is intentional, not a bug.**
>
> - It keeps the preview out of search results, so it can never compete with the live
>   site or confuse someone searching for the Matha.
> - It proves the design is separate from the wording. Any real text appearing there
>   means somebody hardcoded it by mistake — the build reports those automatically.
>
> **Review layout, spacing, images, colours and navigation in the preview.** The real
> wording lives in [`content/languages/en.json`](content/languages/en.json) and can be
> read directly. Images are real in the preview; only text is substituted.

### What is in this repository

| | |
|---|---|
| **Scope** | The website's frontend source code, its build, and contributor documentation |
| **Content** | Devotional and library content lives in [WebsiteLibrary](https://github.com/VedavardhanaTheertha/WebsiteLibrary) |
| **Languages** | English and Kannada, with more addable by dropping in one file |
| **Pages** | 36, built from 34 route files (the blog route expands per article) |
| **Stack** | Next.js 16, React 19, Tailwind CSS 4 — exported as plain static files |
| **Hosting** | GitHub Pages (preview) · Cloudflare Pages (live, not yet connected) |

### The one idea behind the whole thing

**Content is data. Code is structure.** No page or component contains the words shown on
screen, or a list of languages, or a list of articles. The build scans folders and finds
them. This is what lets a contributor add a language or an article without touching code.

---

## 🌟 Vision Statement

> **"To create a timeless, open, and globally accessible digital sanctuary that preserves, illuminates, and disseminates the sacred traditions, scholarly heritage, and spiritual wisdom of the matha—empowering devotees, scholars, and future generations worldwide through collaborative technology and community devotion."**

### Key Pillars Supporting the Vision

- **Universal Accessibility:** Delivering a seamless, multi-lingual, and mobile-first experience so that every devotee—regardless of location, device, or background—can connect with the Matha’s daily rituals, teachings, and heritage.

- **Living Digital Library:** Cultivating a open-source repository of stotras, dasa padas, articles, historical archives, and traditional knowledge that grows dynamically through collective devotion and contribution.

- **Community-Owned & Enduring:** Grounding the platform in open-source principles to ensure that the preservation of spiritual heritage remains transparent, resilient, and community-driven for generations to come.

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

- **Modern Tech Stack:** Work with a clean, high-performance tech stack.
- **Clean Architecture:** Participate in a project designed around a "Content as Data, Code as Structure" paradigm, built for speed, security, and static export reliability.
- **High-Impact Features:** Build search functionality for the digital library, interactive event calendars, photo galleries, audio player integrations, interactive learning tools for a global audience and new ides for the community.

### 🎨 For Designers & Media Artists

- **Sacred Aesthetics:** Design accessible, mobile-first interfaces and elegant graphics honoring the cultural ethos of the Matha.

---

## 🚀 How to Get Started

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
- **Understand the design:** Read [Architecture](docs/ARCHITECTURE.md) — how the site is
  built and why it is built that way.
- **Day-to-day work:** Read [KT](docs/KT.md). For what is done and what remains, see
  [STATUS](docs/STATUS.md).

```bash
npm install
npm run dev
```

Then open **http://localhost:3000/MainWebsiteUI/** — note the path; it mirrors the
deployed preview exactly.

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build:dev` | Full preview build + verification, into `out/` |
| `npm run build:prod` | Full production build + verification |
| `npm run lint` | ESLint |


### 🎨 UI/UX & Graphic Design

- **UI/UX Guidelines & Process:** Read [UI/UX Guidelines](docs/GUIDELINE_UIUX.md) and [How to Update Website Design](docs/CONTRIBUTE_UIUX.md).
- **Icons & Visual Media:** Read [Graphics Guidelines](docs/GUIDELINE_GRAPHICS.md) and [How to Add Icons/Graphics](docs/CONTRIBUTE_GRAPHICS.md).

### 💡 Ideas, Feedback & Issue Reporting

- **Report Bugs:** Read [Issue Reporting Guidelines](docs/GUIDELINE_REPORT_ISSUE.md) and [How to Report an Issue](docs/CONTRIBUTE_REPORT_ISSUE.md).
- **Suggest Features:** Read [Idea Submission Guidelines](docs/GUIDELINE_SUBMIT_IDEA.md) and [How to Submit an Idea](docs/CONTRIBUTE_SUBMIT_IDEA.md).

---

## 📜 License

This repository and all community-contributed materials are published under open-source terms. See the [LICENSE](LICENSE) file for complete details.
