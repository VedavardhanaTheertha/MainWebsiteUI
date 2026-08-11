# Developer Environment Setup

This document explains how to set up a local development environment for the Matha website.

## 1. Prerequisites

- Git
- Node.js and npm or Yarn (depending on the project stack)
- A code editor such as Visual Studio Code
- Optional: a local browser preview extension

## 2. Clone the Repository

```bash
git clone https://github.com/VedavardhanaTheertha/MainWebsiteUI/
cd MainWebsiteUI
```

## 3. Install Dependencies

- If the project uses npm:
  ```bash
  npm install
  ```
- If the project uses Yarn:
  ```bash
  yarn install
  ```

## 4. Set Up the Local Environment

- If there is an `.env.example` file, copy it to `.env` and update configuration values.
- Make sure any required API keys or environment variables are added.

## 5. Run the Development Server

- With npm:
  ```bash
  npm run dev
  ```
- With Yarn:
  ```bash
  yarn dev
  ```

## 6. Build for Production

- With npm:
  ```bash
  npm run build
  ```
- With Yarn:
  ```bash
  yarn build
  ```

## 7. Test Locally

- If tests exist, run them with:
  ```bash
  npm test
  ```
  or
  ```bash
  yarn test
  ```

## 8. Common Troubleshooting

- If dependencies fail to install, delete `node_modules` and reinstall.
- If the site does not start, confirm the node version is compatible.
- Check the terminal output for missing environment variables.

## 9. Contribution Workflow

- Create a feature branch for your changes.
- Keep commits focused and descriptive.
- Open a pull request with a summary of your work.
- Tag reviewers for code, design, or content changes.
