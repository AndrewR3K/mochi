# Release Process

Mochi uses `package.json` versions as the release source of truth.

## Prepare a Release

1. Open the **Prepare Release** workflow in GitHub Actions.
2. Choose a `patch`, `minor`, or `major` bump, or provide an exact version.
3. Run the workflow.

The workflow updates the root package and every versioned package under `packages/*`, refreshes `pnpm-lock.yaml`, runs `pnpm verify`, and opens a release pull request.

## Publish a Release

Merge the release pull request into `main`.

After the merge, the **Release** workflow reads the root `package.json` version, creates the matching `vX.Y.Z` tag if it does not already exist, and generates a GitHub release.

## Local Checks

Use this command to confirm package versions are synced:

```bash
pnpm version:check
```

Use this command to test a local bump before reverting it:

```bash
pnpm version:bump -- --bump patch
```
