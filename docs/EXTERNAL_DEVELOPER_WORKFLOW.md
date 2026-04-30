# External Developer Workflow

Use this workflow to test Mochi as if it were already an external engine dependency.

## In-repo alpha starter

The fastest feedback loop is the isolated starter app:

```bash
pnpm dev:starter
pnpm --filter alpha-starter build
```

Rules for the starter:

- Import from `@mochi/*` package roots only.
- Do not import from `packages/*/src/*` directly.
- Do not copy helpers from `apps/playground`.
- Treat friction as product feedback and create issues for it.

## Outside-app validation

Before alpha, validate a separate app with packed packages.

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
    "@mochi/core": "file:../lite3d/dist-packages/mochi-core-0.1.1.tgz",
    "@mochi/renderer-webgl": "file:../lite3d/dist-packages/mochi-renderer-webgl-0.1.1.tgz",
    "@mochi/gameplay": "file:../lite3d/dist-packages/mochi-gameplay-0.1.1.tgz",
    "@mochi/vue": "file:../lite3d/dist-packages/mochi-vue-0.1.1.tgz"
  },
  "pnpm": {
    "overrides": {
      "@mochi/core": "file:../lite3d/dist-packages/mochi-core-0.1.1.tgz",
      "@mochi/renderer-webgl": "file:../lite3d/dist-packages/mochi-renderer-webgl-0.1.1.tgz",
      "@mochi/gameplay": "file:../lite3d/dist-packages/mochi-gameplay-0.1.1.tgz",
      "@mochi/vue": "file:../lite3d/dist-packages/mochi-vue-0.1.1.tgz"
    }
  }
}
```

The overrides are required until Mochi packages are published to a registry. They force transitive `@mochi/*` dependencies to resolve to the local tarballs instead of npm.

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
