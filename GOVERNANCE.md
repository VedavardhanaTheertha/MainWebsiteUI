# Governance

## Model

The project is maintainer-led and accepts community contributions. Repository owners
appoint maintainers, grant permissions, and make final decisions when consensus cannot
be reached. Maintainers review changes in the areas they understand and recuse
themselves where they have a conflict of interest.

## Decisions and review

Routine changes use pull-request review. Material architecture, licensing, security,
or cultural/editorial decisions should be documented in an issue before implementation.
The normal goal is consensus; otherwise an uninvolved repository owner decides and
records the rationale. Changes to protected branches require review and passing checks.

## Releases and changes

Development is trunk-based: short-lived branches target `main`, are reviewed, pass all
required checks, and are deleted after merge. Releases are immutable annotated tags
using Semantic Versioning once a public release process begins. Until then, the project
is pre-1.0 and deploys from reviewed `main` revisions.

Rollback means redeploying the last known-good `main` revision or reverting the faulty
change through a reviewed pull request. History is not rewritten to perform rollback.

## Maintainer succession

Owners may add maintainers after sustained, constructive contributions. Inactive
maintainers may step down or be removed after reasonable attempts to contact them.
Ownership of institutional names, devotional works, and media is not inferred from
repository access.