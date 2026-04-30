# Release Process

Mochi uses `package.json` versions as the release source of truth.

## Prepare a Release

1. Open the **Prepare Release** workflow in GitHub Actions.
2. Choose a `patch`, `minor`, or `major` bump, or provide an exact version.
3. Run the workflow.

The workflow updates the root package and every versioned package under `packages/*`, refreshes `pnpm-lock.yaml`, runs `pnpm verify`, and opens a release pull request.

## Pick the Version Impact

Every non-release PR should state its semver impact.

- **No version change**: docs-only changes, CI-only changes, local tooling, or work that should not ship yet.
- **Patch**: backward-compatible bug fixes, correctness fixes, internal refactors, or asset polish.
- **Minor**: backward-compatible public API additions, new controller presets, new gameplay helpers, new demos/templates, or meaningful engine capability.
- **Major**: removed exports, renamed public APIs, changed defaults that can break games, or package structure changes that require migration.

When a merged PR is worth a version change, run the **Prepare Release** workflow with the matching bump.

## Publish a Release

Merge the release pull request into `main`.

After the merge, the **Release** workflow reads the root `package.json` version, creates the matching `vX.Y.Z` tag if needed, and generates a GitHub release.

## Local Checks

Use this command to confirm package versions are synced:

```bash
pnpm version:check
```

Use this command to test a local bump before reverting it:

```bash
pnpm version:bump -- --bump patch
```
