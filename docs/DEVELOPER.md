# Developer Environment Setup

This document explains how to set up a local development environment for the Matha website.

## 1. Prerequisites

- Git
- Node.js and npm or Yarn (depending on the project stack)
- A code editor such as Visual Studio Code
- Optional: a local browser preview extension

## 2. Clone the Repository

```bash
git clone --recurse-submodules https://github.com/VedavardhanaTheertha/MainWebsiteUI/
cd MainWebsiteUI
```

For an existing clone, initialize the content repositories with:

```bash
git submodule update --init --recursive
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Set Up the Local Environment

The library is generated from the content submodule before development and production builds.

- `library/<collection>/metadata.json` is the searchable catalog.
- `library/<collection>/*.md` contains the literature.
- `build/tabs.config.mjs` defines visible tabs, translated tab text, and content-folder mappings.
- `build/build-content.mjs` validates metadata and converts Markdown into safe HTML.
- `src/config/site.config.js` defines supported languages and translated interface titles and text.
- `src/generated/<collection>/` contains each generated catalog and its HTML.
- `src/` contains all browser application, styling, configuration, and generated website content.

To add a language, add its locale to `siteConfig.locales`, provide its interface strings in
`siteConfig.text`, and provide matching tab translations in `build/tabs.config.mjs`.

To regenerate only the website data:

```bash
npm run content:build
```

## 5. Run the Development Server

```bash
npm run dev
```

The command regenerates library data and a unique placeholder text set before starting Vite. In
development, a **Text source** selector appears in the header. Use it to switch between actual
translated text and generated placeholders. The selection is retained in local browser storage.

## 6. Build for Production

```bash
npm run build
```

This is an alias for `npm run build:production`. Production always uses the actual translated text,
regardless of the development selector's saved value.

To create a stage build:

```bash
npm run build:stage
```

Stage always uses generated placeholder strings. Every build creates a new placeholder set in
`src/config/generated.placeholder.json`, identified by a unique build ID. Interpolation tokens such
as `{shown}` and `{total}` are retained so dynamic UI behavior can still be tested.

Both deployable static builds are written to `dist/`.

## 7. Test Locally

```bash
npm test
```

The tests verify content cleanup, source-file safety, and metadata validation.

## 8. Common Troubleshooting

- If `library/` is empty, run `git submodule update --init --recursive`.
- If content generation fails, confirm every metadata `sourceFile` exists in its collection folder.
- If dependencies fail to install, delete `node_modules` and run `npm install` again.
- If the site does not start, confirm a current Node.js LTS version is installed.

## 9. Contribution Workflow

- Create a feature branch for your changes.
- Keep commits focused and descriptive.
- Open a pull request with a summary of your work.
- Tag reviewers for code, design, or content changes.
