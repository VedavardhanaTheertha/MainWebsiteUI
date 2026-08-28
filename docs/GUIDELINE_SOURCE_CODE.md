# Software Contribution Guidelines

This document explains the source code contribution practices for the Matha website.

## 1. Follow the Repository Structure

- Understand how the project is organized before making changes.
- Keep content and code separate.
- Add new features in the appropriate folder.

## 2. Write Clean Code

- Use consistent naming and formatting.
- Keep functions and components small and focused.
- Add comments only when they clarify intent.

## 3. Respect Accessibility and Performance

- Ensure UI changes are accessible with keyboard and screen readers.
- Optimize images, fonts, and bundles.
- Avoid unnecessary JavaScript where static content suffices.

## 4. Keep Configuration Simple

- Use environment variables for sensitive values.
- Do not commit secrets.
- Document any new configuration in `docs/DEVELOPER.md`.

## 5. Document Your Work

- Describe feature changes clearly in the pull request.
- Update documentation when behavior changes.
- Include usage notes for new developer-facing code.

## 6. Test Changes

- Run the mandatory local gate, `npm run ci`, before requesting review.
- Add unit or integration tests for new logic.
- Read the post-build verification output and report any check that could not be run.

## 7. Review and Iterate

- Request review from maintainers before merging.
- Be ready to revise code based on feedback.
- Keep commits clean and avoid unrelated changes.

## 8. Version Control Practices

- `main` is the single canonical branch. Use a descriptive, short-lived branch and open
  a pull request into `main`; fork contributors follow the same model in their fork.
- Never rewrite a shared protected branch. Use the repository's allowed merge method
  after required review and checks pass.
- Keep commits and pull requests focused; avoid unrelated changes.

## 9. Pull Request Checklist

- Is the branch based on current `main` and is the contribution focused?
- Did `npm run ci` pass, including both verified builds?
- Are new behaviors tested and relevant documentation updated?
- Does the pull request clearly explain purpose, changed behavior, validation, and
  related issues?
- Have accessibility, security, and asset rights been considered where applicable?

See the [Developer Guide](./DEVELOPER.md) for commands, environment behavior, and
troubleshooting; do not duplicate those operational details here.
