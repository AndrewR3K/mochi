# Recent Changes

This recap covers engine and playground work after the initial core/renderer/gameplay facade setup.

## Engine Facade

- Added scene lifecycle helpers through `game.createScene()`, `createScene`, `mountScene`, and `disposeScene`.
- Scenes now own created entities, frame listeners, disposable controllers, cleanup callbacks, and reset hooks.
- Added `scene.reset()` so small games can restore owned entity transforms and replay scene state without rebuilding the game.
- Added typed entity component helpers for gameplay data without introducing a full ECS.
- Added runtime collision bodies for box, sphere, and trigger-style overlap queries.
- Added parent/child entity hierarchy so compound actors can keep local transforms while rendering and collision queries use world-space transforms.
- Added serializable world snapshots for engine-owned scene state, including camera state, hierarchy, transforms, renderables, and world positions.
- Added world snapshot persistence helpers with JSON serialization, load/save helpers, and an in-memory store adapter.
- Added entity names and tags for organization, queries, inspection, and editor-style workflows.
- Added collision layer/mask filtering to runtime collision bodies.
- Added spatial collision queries for point and sphere-volume checks.
- Added ray collision queries for picking, aiming, sensors, and editor selection.
- Added camera viewport ray helpers for mouse picking, aiming, sensors, and editor tools.
- Added an asset registry for reusable loading/cache lifecycle management.
- Added gameplay inspection snapshots that summarize world, hierarchy, collision, trigger, renderable, and tag state.
- Added lifecycle-bound scene scheduling for delays and intervals.
- Added prefab-style entity blueprints for reusable hierarchy construction.
- Added gameplay trigger volumes and damage zones with enter/stay/exit events and interval-based damage callbacks.
- Added shared collision helpers for box colliders, 2D distance checks, ground height resolution, box collision resolution, and stepped collision movement.
- Added debug helpers for rendering collider footprints and target markers through scene-owned entities.
- Added a debug overlay helper that combines scene-owned bounds, target markers, rays, and throttled inspection snapshots for HUDs and editor-style panels.
- Added typed event signals for small gameplay events like collection, damage, score, and mission state changes.
- Added configurable keyboard bindings for character and vehicle controllers while keeping WASD/arrows as the default path.
- Added a reusable character motor for grounded movement, jumping, bounds, and dynamic ground height outside camera presets.
- Added material presets and `createMaterial()` for current solid-color rendering.
- Reworked `vehicleArcade` and `vehicleSim` to use vehicle-style throttle, braking, steering, drag, and chase camera behavior instead of character-style movement.
- Added `spaceflightArcade`, a spacecraft controller preset for open 3D movement with thrust, pitch, yaw, roll, vertical strafe, velocity readout, and chase camera behavior.
- Added pooled projectile emitters with lifetime, target hit callbacks, hit signals, and scene reset integration.
- Added pooled particle emitters for scene-owned sparks, dust, pickup bursts, and other lightweight effects.
- Exposed fixed-step runtime configuration through `GameCanvas` for deterministic Vue-hosted simulations.
- Added runtime clock controls for pause/resume, time scaling, manual stepping, max delta clamping, and fixed-step catch-up limits.
- Added runtime profiling helpers for frame pacing summaries and over-budget frame detection.

## Rendering

- Added normals to the built-in cube and plane geometry.
- Added ambient and directional lighting to the WebGL renderer, with defaults that improve depth without extra setup.
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
- Added `Starfield Drift`, a spaceflight demo with beacons, asteroids, starfield markers, and ship HUD telemetry.
- Updated `Starfield Drift` with blaster fire, shootable drone targets, and combined beacon/drone mission completion.
- Added a `Tactics Board` debug toggle for showing blocker collision bounds and the controlled unit target.
- Updated `Tactics Board` to consume engine tags, collision layers, and inspection snapshots in its debug HUD.
- Updated `Tactics Board` to use a scene scheduler for debug inspection refreshes.
- Updated `Tactics Board` to show a scene-owned debug ray when debug visuals are enabled.
- Updated `Velocity Circuit` to show speed and use the new vehicle controller feel.

## Testing

- Added a root `pnpm test` command using Node's built-in test runner with TypeScript support through `tsx`.
- Added initial `@mochi-labs/core` tests for math transform behavior, input frame state, runtime fixed-step ticking, runtime reset cleanup, and collision body queries.
- Added initial `@mochi-labs/gameplay` tests for scene ownership, reset/dispose cleanup, public controller preset creation, character input binding movement, and vehicle reset behavior.
- Added `tsconfig.test.json` so test files are typechecked as part of `pnpm typecheck`.
- Updated `pnpm verify` so tests run between typechecking and the playground build.

## Documentation

- Updated `README.md` with scene lifecycle, reset, input binding, and demo coverage notes.
- Added a root `pnpm verify` command and aligned CI to use the same local validation path.
- Updated getting-started examples to use scene-owned entities, frame listeners, and controller cleanup.
- Renamed packages to the cohesive public namespace: `@mochi-labs/core`, `@mochi-labs/renderer-webgl`, `@mochi-labs/gameplay`, and `@mochi-labs/vue`.
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
