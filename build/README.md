# build/

The deployment build. CI runs these scripts; you can run the same ones locally.

| File | Purpose |
|---|---|
| `build.mjs` | Runs the whole build: generate content → export static site → verify |
| `verify.mjs` | Checks the built output before it is published |

## Running a build

```bash
SITE_ENV=dev node build/build.mjs
```

On Windows PowerShell:

```bash
$env:SITE_ENV = "dev"; node build/build.mjs
```

`SITE_ENV` defaults to `dev` when unset. Valid values come from
`config/site.yml`.

## Why the logic lives here rather than in the CI file

`.github/workflows/deploy-dev.yml` is a thin wrapper that calls `build.mjs`. That
means:

- **Build problems can be debugged locally** by running the same script, instead
  of pushing commits to test the pipeline.
- **Changing CI provider** means rewriting ten lines of YAML, not the pipeline.

## What verify.mjs checks

1. `robots.txt` matches the environment's indexing policy.
2. Non-production pages carry a `noindex` directive.
3. **Non-production pages contain no real content.**

Check 3 is the important one. In a placeholder build the generated content
contains no real text at all, so any real sentence in the output must have been
hardcoded in a component — the exact mistake the content system prevents.

It currently reports these as warnings. Set `build.fail_on_hardcoded_content` to
`true` in `config/site.yml` to make them fail the build, once the existing
hardcoded strings have been migrated into `content/`.
