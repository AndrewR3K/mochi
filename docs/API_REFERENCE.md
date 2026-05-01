# Public API Reference Direction

Alpha docs use hand-written package pages first. Move to generated docs after the API surface settles.

## Documentation stack

- Keep alpha docs in Markdown under `docs/`.
- Use GitHub rendering for the first alpha.
- Move to VitePress and GitHub Pages when package publishing begins.
- Keep every example aligned with `pnpm verify`.

## Package entry points

External developers should import from package roots:

```ts
import { createGame } from '@mochi-labs/gameplay';
import { GameCanvas, useGameScene } from '@mochi-labs/vue';
```

Avoid imports like `@mochi-labs/gameplay/src/scene`. If a useful API is not exported from a package root, treat that as an engine issue.

## `@mochi-labs/core`

Use core directly for headless/runtime work:

- `World`
- entities, transforms, names, tags, hierarchy, and snapshots
- runtime loop, fixed-step controls, pause/time-scale/manual step
- input state
- collision bodies, filtering, point/sphere/ray queries
- camera viewport rays

## `@mochi-labs/renderer-webgl`

Use renderer APIs when building custom hosts:

- `createWebGLRenderer`
- lighting options
- render snapshots from `World`

Most game developers should use `@mochi-labs/gameplay` instead of creating the renderer directly.

## `@mochi-labs/gameplay`

Use gameplay as the default game-facing entry point:

- `createGame`
- scene lifecycle helpers
- controller presets
- character motors
- collision helpers
- material presets
- events
- triggers and damage zones
- projectile emitter
- scene scheduler
- entity blueprints
- asset registry
- inspection snapshots and debug visuals

## `@mochi-labs/vue`

Use Vue for the visibility layer:

- `GameCanvas`
- `useGame`
- `useGameScene`
- `useFrame`
- `useGameStats`

Keep hot-loop simulation data in Mochi scene/runtime state. Use Vue for HUDs, menus, overlays, and developer tools.

## API doc exit criteria

- [x] Add VitePress site skeleton.
- [x] Add one page per package.
- [ ] Generate or validate exported symbols.
- [ ] Publish docs through GitHub Pages.
