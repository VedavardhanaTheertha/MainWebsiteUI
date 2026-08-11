# How to Contribute Source Code

This document explains the workflow for contributing code to the Matha website.

## 1. Choose a Task

- Pick an open issue or propose a new feature.
- If you are fixing a bug, reproduce the issue locally first.

## 2. Create a Branch

- Create a descriptive branch from the latest main branch.
  ```bash
git checkout main
git pull
 git checkout -b feature/your-change
  ```

## 3. Make Your Changes

- Implement the feature or fix in the correct module.
- Add comments only when necessary.
- Keep your code aligned with existing patterns.

## 4. Test Your Work

- Run the local development server.
- Confirm the change works and the page renders correctly.
- Run tests if available.

## 5. Document the Change

- Update docs, or comments for behavior changes.
- Add notes for any configuration or environment changes.

## 6. Commit and Push

- Use meaningful commit messages.
- Keep each commit focused on a single logical change.
- Push your branch to the repository.

## 7. Open a Pull Request

- Describe the problem and your solution.
- List the files changed and any special steps to test.
- Reference related issues if applicable.

## 8. Review and Merge

- Respond to review feedback.
- Update the branch if requested.
- Merge once approvals are received.
