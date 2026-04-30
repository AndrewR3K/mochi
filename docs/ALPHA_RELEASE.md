# Alpha Release

The alpha release is the first point where Mochi should feel usable from a separate codebase by someone pretending to be an external developer.

Alpha does not mean the engine is complete. It means the public path is coherent, repeatable, and honest about limitations.

## Release bar

- A separate starter app can consume Mochi through public APIs only.
- A developer can run a first playable scene with Vue canvas hosting, scene lifecycle, one controller preset, simple collision, debug visuals, and a production build.
- Package consumption is documented for local development before public npm publishing.
- Release steps are repeatable: version bump, verification, release notes, tag, and GitHub release.
- Public API stability expectations are documented.
- Known limitations are explicit.

## Alpha-supported package path

Before public npm publishing, the supported alpha path is workspace consumption inside this repo and packed/local package validation for outside apps.

Use the workspace path for engine development:

```bash
pnpm install
pnpm dev:starter
pnpm verify
```

Use packed package artifacts when validating an app outside the monorepo:

```bash
pnpm --dir packages/core pack --pack-destination ../../dist-packages
pnpm --dir packages/renderer-webgl pack --pack-destination ../../dist-packages
pnpm --dir packages/gameplay pack --pack-destination ../../dist-packages
pnpm --dir packages/vue pack --pack-destination ../../dist-packages
```

Then install the generated tarballs in the separate app. This catches dependency and export issues that workspace aliases can hide.
Until the packages are published to a registry, the separate app must also use `pnpm.overrides` for each `@mochi/*` package so transitive Mochi dependencies resolve to local tarballs.

## Stable during alpha

These APIs should avoid churn unless a change clearly improves the external developer experience:

- `GameCanvas`, `useGame`, `useGameScene`, `useFrame`, `useGameStats`
- `createGame`
- scene lifecycle APIs
- controller preset names and option shapes
- entity creation, tags, hierarchy, and snapshots
- collision bodies, collision queries, and camera rays
- triggers, damage zones, projectiles, scheduler, blueprints, asset registry, and debug visuals

## Known limitations

- Mesh, texture, audio, and animation pipelines are not alpha-ready yet.
- Renderer materials are intentionally simple and not PBR.
- Physics is still lightweight collision/query tooling, not a full physics backend.
- Shadows, post-processing, batching, and editor UI are future renderer/tooling work.
- npm publishing is not the default alpha path until package strategy is finalized.
- React and Svelte adapters are future ecosystem work.

## Exit checklist

- [ ] `apps/alpha-starter` builds through `pnpm verify`.
- [x] A separate app has been validated using packed packages.
- [x] First-game docs are current.
- [x] Package/release process docs are current.
- [x] Alpha limitations are linked from README and release notes.
- [x] Renderer and Vue adapter alpha tests are in place.
