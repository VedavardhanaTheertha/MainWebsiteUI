# How to Contribute Source Code

The project uses one canonical branch: `main`. Contributors work on short-lived
branches and open pull requests back to `main`.

## Workflow

1. Choose or propose a focused task. Reproduce a reported defect before changing it.
2. Follow the [Developer Guide](./DEVELOPER.md) to install dependencies and initialize
   submodules.
3. Create a descriptive short-lived branch from current `main`. Fork contributors use
   the same branch model in their fork.
4. Make the smallest coherent change. Keep visitor-facing text in `content/`, preserve
   accessibility, and add tests for new logic.
5. Update architecture documentation for structure, content-system, environment, or
   pipeline changes; update developer documentation when contributor steps change.
6. Run the mandatory local gate:

   ```bash
   npm run ci
   ```

   This runs lint, type checking, unit tests, and verified development and production
   builds. Read the verification output rather than relying only on the exit code.
7. Open a pull request into `main`. Explain the problem, approach, user impact,
   validation, documentation, accessibility, security, and asset provenance as
   applicable.
8. Obtain maintainer review and all required checks. Address feedback without rewriting
   shared protected history, then merge using the repository's allowed merge method.

The authoritative commands, environment behavior, troubleshooting, clean-checkout
check, and deployment details are maintained in the
[Developer Guide](./DEVELOPER.md), rather than duplicated here.
