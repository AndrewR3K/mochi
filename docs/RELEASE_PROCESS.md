# Release Process

Mochi uses `package.json` versions as the release source of truth.
See [Versioning](VERSIONING.md) for alpha, beta, rc, and stable release semantics.

## Prepare a Release

1. Open the **Prepare Release** workflow in GitHub Actions.
2. Choose `alpha`, `beta`, `rc`, `patch`, `minor`, or `major`, or provide an exact version.
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

After the merge, the **Release** workflow reads the root `package.json` version, creates the matching `v<version>` tag if needed, and generates a GitHub release.

Publishing to npm is manual during alpha. Use the **Publish npm** workflow after the GitHub release exists and after `NPM_TOKEN` has been added to repository Actions secrets. The workflow infers the npm dist-tag from the root package version.

## Local Checks

Use this command to confirm package versions are synced:

```bash
pnpm version:check
```

Use these commands to test local bumps before reverting them:

```bash
pnpm version:bump -- --bump patch
pnpm version:bump -- --bump alpha
pnpm version:bump -- --version 0.2.0-alpha.0
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

## npm Publishing Setup

Mochi publishes under the `@mochi-labs` scope:

- `@mochi-labs/core`
- `@mochi-labs/renderer-webgl`
- `@mochi-labs/gameplay`
- `@mochi-labs/vue`

The unscoped `mochi` package is taken, so do not use it for publishing.

Before the first real publish:

1. Create or claim the npm `mochi-labs` organization.
2. Keep packages public.
3. Add the publishing account as an owner or maintainer.
4. Create a granular npm token with read/write access to the `@mochi-labs` scope.
5. Add it to GitHub Actions repository secrets as `NPM_TOKEN`.

Confirm local npm access with:

```bash
npm whoami
npm org ls mochi-labs
```

## npm Publish Dry Run

Run **Actions** -> **Publish npm** with:

- `dry_run`: `true`

Only run with `dry_run: false` after:

- the `@mochi-labs` npm organization is created or claimed
- `NPM_TOKEN` is set in GitHub Actions secrets
- the dry run passes
- a separate app has been tested with the intended install path

## Verify After Publish

Create a clean app outside the repo and install the published packages:

```bash
pnpm add @mochi-labs/core@alpha @mochi-labs/renderer-webgl@alpha @mochi-labs/gameplay@alpha @mochi-labs/vue@alpha vue
pnpm build
```

If published packages work without `pnpm.overrides`, update `docs/EXTERNAL_DEVELOPER_WORKFLOW.md` to remove the tarball-only workaround.

## Trusted Publishing Later

GitHub Actions can eventually use npm trusted publishing with provenance instead of long-lived tokens. Keep `id-token: write` in the workflow so the repo is ready for that path.
