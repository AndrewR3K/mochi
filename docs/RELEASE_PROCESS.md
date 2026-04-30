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

Publishing to npm is manual during alpha. Use the **Publish npm** workflow after the GitHub release exists and after `NPM_TOKEN` has been added to repository Actions secrets. See [npm Publishing Setup](NPM_PUBLISHING.md).

## Local Checks

Use this command to confirm package versions are synced:

```bash
pnpm version:check
```

Use this command to test a local bump before reverting it:

```bash
pnpm version:bump -- --bump patch
```

## Alpha Release Dry Run

Before the first alpha release, validate the starter and packed packages:

```bash
pnpm verify
pnpm --filter alpha-starter build
New-Item -ItemType Directory -Force -Path dist-packages
pnpm --dir packages/core pack --pack-destination ../../dist-packages
pnpm --dir packages/renderer-webgl pack --pack-destination ../../dist-packages
pnpm --dir packages/gameplay pack --pack-destination ../../dist-packages
pnpm --dir packages/vue pack --pack-destination ../../dist-packages
```

Install those tarballs in a separate app before tagging alpha. This catches missing exports, dependency mistakes, and docs assumptions that workspace linking can hide.
Use `pnpm.overrides` in the separate app to point every `@mochi-labs/*` package at the matching tarball until Mochi packages are published to a registry.

During alpha, use:

- **Patch** for bug fixes, docs fixes, and release-process corrections.
- **Minor** for new public APIs, templates, demos, or capability that external developers can use.
- **Major** only for intentional breaking changes after writing migration notes.

## npm Publish Dry Run

Run **Actions** -> **Publish npm** with:

- `dry_run`: `true`
- `tag`: `alpha`

Only run with `dry_run: false` after:

- the `@mochi-labs` npm organization is created or claimed
- `NPM_TOKEN` is set in GitHub Actions secrets
- the dry run passes
- a separate app has been tested with the intended install path
