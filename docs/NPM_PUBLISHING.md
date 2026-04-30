# npm Publishing Setup

Mochi can publish packages through the manual **Publish npm** GitHub Actions workflow after npm access is configured.

## 1) Confirm the package scope

The current package names use the `@mochi-labs` scope:

- `@mochi-labs/core`
- `@mochi-labs/renderer-webgl`
- `@mochi-labs/gameplay`
- `@mochi-labs/vue`

Before the first real publish, confirm the npm organization or user scope exists and the publishing account can publish public scoped packages there.

```bash
npm whoami
npm org ls mochi-labs
```

The `mochi` unscoped package name is taken, but the `@mochi-labs` scope is the intended package home. Claim or create the npm `mochi-labs` organization before publishing. If npm does not allow access to that scope, rename packages before publishing. Do not publish under a throwaway scope and rename later unless you are ready to support migration.

## 2) Create or claim the npm org

In npm:

1. Create an organization named `mochi-labs`, or claim access if it already exists under your account.
2. Keep packages public.
3. Add the publishing account as an owner or maintainer.
4. Confirm locally:

```bash
npm org ls mochi-labs
```

## 3) Create an npm access token

In npm:

1. Open **Access Tokens**.
2. Create a granular access token.
3. Grant publish access to the Mochi packages or `@mochi-labs` scope.
4. Restrict access to this repository if npm offers repository restrictions.
5. Copy the token once.

## 4) Add the GitHub secret

In GitHub:

1. Open repository **Settings**.
2. Go to **Secrets and variables** -> **Actions**.
3. Add a repository secret named `NPM_TOKEN`.
4. Paste the npm token.

The workflow reads this secret as `NODE_AUTH_TOKEN`.

## 5) Run a dry run first

Open **Actions** -> **Publish npm** and run:

- `dry_run`: `true`
- `tag`: `alpha`

The dry run verifies package manifests, tarball contents, workspace dependencies, and publish commands without publishing.

## 6) Publish alpha

After the dry run passes, run **Publish npm** again:

- `dry_run`: `false`
- `tag`: `alpha`

Use `alpha` until the package install story is stable. Save `latest` for releases intended as the default install path.

## 7) Verify after publish

Create a clean app outside the repo and install the published packages:

```bash
pnpm add @mochi-labs/core@alpha @mochi-labs/renderer-webgl@alpha @mochi-labs/gameplay@alpha @mochi-labs/vue@alpha vue
pnpm build
```

If published packages work without `pnpm.overrides`, update `docs/EXTERNAL_DEVELOPER_WORKFLOW.md` to remove the tarball-only workaround.

## Trusted publishing later

GitHub Actions can eventually use npm trusted publishing with provenance instead of long-lived tokens. Keep `id-token: write` in the workflow so the repo is ready for that path.
