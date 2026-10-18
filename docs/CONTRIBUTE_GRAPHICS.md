# How to Add Icons and Graphics

This document explains how to add and update graphic assets for the website.

## 1. Choose the Right Asset Type

- Use icons for simple actions and navigation.
- Use images for banners, galleries, and supporting media.

## 2. Create or Select Graphics

- Design graphics that fit the site’s visual tone.
- Use vector formats like SVG for icons and logos.
- Optimize raster images for performance.

## 3. Name Assets Clearly

- Use descriptive file names like `festival-banner.webp` or `community-icon.svg`.
- Avoid spaces and special characters in file names.

## 4. Add Assets to the Repository

- Put new article media in `public/articles/`. Keep other static assets in their
  owning locations under `public/`; do not reorganize unrelated binaries.
- Reference public files from the site root, without the `public` prefix.
- Preserve applicable licenses and required attribution.

## 5. Update References in the Site

- Reference the new asset from the owning content record or image settings; do not
  hardcode editorial image URLs or labels in a component.
- Image-map relative paths are appended to the configured media-directory base,
  including paths beginning with `/`; absolute HTTPS targets bypass that base.
- Confirm the asset loads correctly in both development and production builds.

## 6. Document the Change

- In your pull request, explain what the graphic is used for.
- Note any design decisions or accessibility considerations.

## 7. Review and Optimize

- Check the asset on different screen sizes.
- Ensure icons and images remain clear and readable.
- Reduce file size while preserving visual quality.
