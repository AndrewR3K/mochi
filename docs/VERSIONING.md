# Versioning

Mochi uses SemVer with prerelease versions for alpha, beta, and release-candidate builds.

## Release train

Use one long-lived branch: `main`.

Feature work lands through PRs. Releases are prepared by the **Prepare Release** workflow, which opens a version bump PR. After that PR merges, the **Release** workflow creates the Git tag and GitHub release.

## Version shapes

```text
0.2.0-alpha.0
0.2.0-alpha.1
0.2.0-beta.0
0.2.0-rc.0
0.2.0
```

## Stages

- `alpha`: external developer experience is being proven; APIs can still move.
- `beta`: install, docs, starter, and core APIs are usable; API churn should be rare.
- `rc`: release candidate; only blocker fixes, regressions, and docs corrections.
- stable: default release; publish with the `latest` npm tag.

## npm dist-tags

The publish workflow infers the npm dist-tag from the root version:

- `*-alpha.N` publishes with `alpha`
- `*-beta.N` publishes with `beta`
- `*-rc.N` publishes with `rc`
- stable versions publish with `latest`

Do not manually publish a prerelease with `latest`.

## Bump behavior

The version bump script supports:

```bash
pnpm version:bump -- --bump alpha
pnpm version:bump -- --bump beta
pnpm version:bump -- --bump rc
pnpm version:bump -- --bump patch
pnpm version:bump -- --bump minor
pnpm version:bump -- --bump major
pnpm version:bump -- --version 0.2.0-alpha.0
```

Prerelease bumps behave like this:

- stable `0.1.1` + `alpha` -> `0.2.0-alpha.0`
- `0.2.0-alpha.0` + `alpha` -> `0.2.0-alpha.1`
- `0.2.0-alpha.1` + `beta` -> `0.2.0-beta.0`
- `0.2.0-beta.0` + `rc` -> `0.2.0-rc.0`
- `0.2.0-rc.0` + explicit `--version 0.2.0` -> `0.2.0`

Use explicit versions when graduating from `rc` to stable.
