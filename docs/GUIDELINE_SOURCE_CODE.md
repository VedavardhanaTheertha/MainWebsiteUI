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

- Run existing tests when available.
- Add unit or integration tests for new logic.
- Verify the site builds successfully.

## 7. Review and Iterate

- Request review from maintainers before merging.
- Be ready to revise code based on feedback.
- Keep commits clean and avoid unrelated changes.

## 8. Version Control Practices

- For External users: Fork and create pull requests
- For Organization users: Branch from `main` or the appropriate base branch.
- For Organization users: Use descriptive branch names like `feature/add-events` or `fix/content-links`.
- Rebase or squash commits when necessary to keep history clear.

## 9. Pull Request Checklist

- Is working repository/branch in Sync with the latest `main` branch?
- Is contribution small and single-purpose?
- Is the commit message has clear description explaining purpose?
- Is the list files changed verified?
- Does the commit message has reference to related issues or discussions?
