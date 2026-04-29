# Recent Changes

This recap covers the latest engine and playground work after the initial core/renderer/gameplay facade setup.

## Engine Facade

- Added scene lifecycle helpers through `game.createScene()`, `createScene`, `mountScene`, and `disposeScene`.
- Scenes now own created entities, frame listeners, disposable controllers, cleanup callbacks, and reset hooks.
- Added `scene.reset()` so small games can restore owned entity transforms and replay scene-specific state without rebuilding the whole game.
- Added typed entity component helpers for lightweight gameplay data without introducing a full ECS.
- Added runtime collision bodies for box, sphere, and trigger-style overlap queries.
- Added shared collision helpers for common demo patterns: box colliders, 2D distance checks, ground height resolution, box collision resolution, and stepped collision movement.
- Added debug helpers for rendering collider footprints and target markers through scene-owned entities.
- Added typed event signals for small gameplay events like collection, damage, score, and mission state changes.
- Added configurable keyboard bindings for character and vehicle controllers while keeping WASD/arrows as the default path.
- Added simple material presets and `createMaterial()` for current solid-color rendering.
- Reworked `vehicleArcade` and `vehicleSim` to use vehicle-style throttle, braking, steering, drag, and chase camera behavior instead of character-style movement.

## Rendering

- Added normals to the built-in cube and plane geometry.
- Added simple ambient and directional lighting to the WebGL renderer, with defaults that improve depth without requiring setup.
- Exposed renderer lighting options through `createGame({ renderer: { lighting } })`.

## Playground Demos

- Refactored existing demos to use scene-owned entities and cleanup.
- Refactored `Nightfall Run` to use shared collision helpers and `scene.reset()` for replay.
- Refactored `Nightfall Run` to use `useGameScene()` for scene creation, reset, and automatic disposal.
- Refactored the `Nightfall Run` FPS HUD to use `useGameStats()` instead of copying stats inside gameplay logic.
- Added a reusable playground `DemoHud` component and moved common demo HUD panels onto it.
- Added `Preset Lab`, a live sandbox for switching between all controller presets.
- Added `First Person Range`, a dedicated `firstPerson` demo with signal collection, a timer, and reset support.
- Added `Tactics Board`, an `isometric` demo with blockers, capture zones, and reset support.
- Added a `Tactics Board` debug toggle for showing blocker collision bounds and the controlled unit target.
- Updated `Velocity Circuit` to show speed and use the new vehicle controller feel.

## Testing

- Added a root `pnpm test` command using Node's built-in test runner with TypeScript support through `tsx`.
- Added initial `@lite3d/core` tests for math transform behavior, input frame state, runtime fixed-step ticking, runtime reset cleanup, and collision body queries.
- Added initial `@lite3d/gameplay` tests for scene ownership, reset/dispose cleanup, public controller preset creation, character input binding movement, and vehicle reset behavior.
- Added `tsconfig.test.json` so test files are typechecked as part of `pnpm typecheck`.
- Updated `pnpm verify` so tests run between typechecking and the playground build.

## Documentation

- Updated `README.md` with scene lifecycle, reset, input binding, and demo coverage notes.
- Added a root `pnpm verify` command and aligned CI to use the same local validation path.
- Updated getting-started examples to use scene-owned entities, frame listeners, and controller cleanup.
- Renamed packages to the cohesive public namespace: `@lite3d/core`, `@lite3d/renderer-webgl`, `@lite3d/gameplay`, and `@lite3d/vue`.
- Expanded `docs/PRESET_GUIDE.md` with scene reset, input binding examples, vehicle tuning guidance, and live demo references.
- Updated `docs/ROADMAP.md` to mark completed chunks:
  - typed entity component helpers
  - runtime collision primitives
  - Vue game stats composable
  - Vue scene lifecycle composable
  - HUD-only runtime stats updates
  - scene lifecycle helpers
  - collision helper APIs
  - event signal helpers
  - material presets
  - basic ambient/directional lighting
  - simple normal shading
  - debug bounds and target rendering
  - visual debug toggles
  - reset/replay helpers
  - input binding config
  - live preset playground
  - first-person demo
  - vehicle-feeling `Velocity Circuit`

## Verification

The recent chunks were checked with:

```bash
pnpm verify
```
