# External Developer Workflow

Use this workflow to test Mochi as an external engine dependency.

## Published package path

For normal game development, install the alpha packages from npm:

```bash
pnpm add @mochi-labs/vue@alpha vue
```

With npm:

```bash
npm install @mochi-labs/vue@alpha vue
```

Install lower-level packages directly only when you need to use them without the Vue adapter:

```bash
pnpm add @mochi-labs/gameplay@alpha @mochi-labs/renderer-webgl@alpha @mochi-labs/core@alpha
```

## In-repo alpha starter

Use the isolated starter app when contributing to this engine:

```bash
pnpm dev:starter
pnpm --filter alpha-starter build
```

Rules for the starter:

- Import from `@mochi-labs/*` package roots only.
- Do not import from `packages/*/src/*` directly.
- Do not copy helpers from `apps/playground`.
- Treat friction as product feedback and create issues for it.

## Unpublished local validation

When changing Mochi packages locally, validate a separate app with packed packages before publishing.

1. Build and verify Mochi.

```bash
pnpm verify
```

2. Pack the packages.

```bash
New-Item -ItemType Directory -Force -Path dist-packages
pnpm --dir packages/core pack --pack-destination ../../dist-packages
pnpm --dir packages/renderer-webgl pack --pack-destination ../../dist-packages
pnpm --dir packages/gameplay pack --pack-destination ../../dist-packages
pnpm --dir packages/vue pack --pack-destination ../../dist-packages
```

3. Install tarballs in the separate app.

```json
{
  "dependencies": {
    "@mochi-labs/core": "file:../lite3d/dist-packages/mochi-labs-core-0.1.1.tgz",
    "@mochi-labs/renderer-webgl": "file:../lite3d/dist-packages/mochi-labs-renderer-webgl-0.1.1.tgz",
    "@mochi-labs/gameplay": "file:../lite3d/dist-packages/mochi-labs-gameplay-0.1.1.tgz",
    "@mochi-labs/vue": "file:../lite3d/dist-packages/mochi-labs-vue-0.1.1.tgz"
  },
  "pnpm": {
    "overrides": {
      "@mochi-labs/core": "file:../lite3d/dist-packages/mochi-labs-core-0.1.1.tgz",
      "@mochi-labs/renderer-webgl": "file:../lite3d/dist-packages/mochi-labs-renderer-webgl-0.1.1.tgz",
      "@mochi-labs/gameplay": "file:../lite3d/dist-packages/mochi-labs-gameplay-0.1.1.tgz",
      "@mochi-labs/vue": "file:../lite3d/dist-packages/mochi-labs-vue-0.1.1.tgz"
    }
  }
}
```

The overrides force transitive `@mochi-labs/*` dependencies to resolve to the local tarballs instead of npm.

4. Build the separate app.

```bash
pnpm build
```

## What to record

- Missing exports or confusing import paths.
- Setup steps that are not obvious.
- Type errors that require engine knowledge to solve.
- Runtime errors during canvas setup, input, rendering, or cleanup.
- Places where docs use playground-only assumptions.

## Alpha pass/fail

The workflow passes when a separate app can create a playable scene, build for production, and stay entirely on public APIs.
