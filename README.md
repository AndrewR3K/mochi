# Mochi

<img src="docs/assets/mochi-logo.png" alt="Mochi logo" width="560">

Vue.js-first 3D game engine.

Mochi is built around a simple idea: game developers should spend time on gameplay, not engine plumbing.
The core runtime and renderer stay framework-agnostic, while Vue provides an ergonomic shell for canvas hosting and HUD/UI.

The goal is a web-native engine that can grow toward Unity, Godot, and Unreal-level capability without making the first scene hard to build.

## What is in this repo

- `packages/core` (`@mochi-labs/core`) - headless runtime primitives: world, entities, components, collision bodies, transforms, input state, and frame loop
- `packages/renderer-webgl` (`@mochi-labs/renderer-webgl`) - custom WebGL2 renderer with simple material lighting
- `packages/gameplay` (`@mochi-labs/gameplay`) - high-level facade (`createGame`), controller presets, scene lifecycle, gameplay helpers, and debug utilities
- `packages/vue` (`@mochi-labs/vue`) - Vue adapter (`GameCanvas`, `useGame`, `useGameScene`, `useFrame`, `useGameStats`)
- `apps/playground` - playable demo app with multiple showcase scenes
- `apps/alpha-starter` - isolated starter app that exercises Mochi like an external developer would

## Current controller presets

From `@mochi-labs/gameplay`:

- `createFirstPersonController`
- `createThirdPersonOrbitController`
- `createThirdPersonOverShoulderController`
- `createTopDownController`
- `createIsometricController`
- `createSideScroller2DController`
- `createVehicleArcadeController`
- `createVehicleSimController`
- `createSpaceflightArcadeController`
- `createRailCameraController`
- `createStrategyFreeCamController`
- `createControllerPreset(game, kind, options)` with `CONTROLLER_PRESET_KINDS`

## Quick start

### Requirements

- Node.js 20+
- pnpm, npm, or another Node package manager

### Install

Install Mochi in your game app:

```bash
pnpm add @mochi-labs/vue@alpha vue
```

With npm:

```bash
npm install @mochi-labs/vue@alpha vue
```

`@mochi-labs/vue` brings in the gameplay, renderer, and core packages.

### Contributing to the engine

Clone this repository and install the workspace only when you are contributing to Mochi itself:

```bash
pnpm install
```

Run the playground:

```bash
pnpm dev
```

Run the alpha starter:

```bash
pnpm dev:starter
```

Run the docs site:

```bash
pnpm docs:dev
```

Build the playground and starter:

```bash
pnpm build
```

Verify the workspace:

```bash
pnpm verify
```

`pnpm verify` typechecks every package with a `typecheck` script, runs the test suite, builds the apps, and builds the VitePress docs site. Use it before opening a PR or changing shared engine APIs.

## Minimal usage (Vue + facade)

```ts
import { createGame, createMaterial, createThirdPersonOverShoulderController } from '@mochi-labs/gameplay';

const game = createGame({ canvas });
const scene = game.createScene();
const player = scene.createEntity({
  id: 'player',
  transform: {
    position: { x: 0, y: 0.65, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  renderable: {
    primitive: 'cube',
    material: createMaterial('solid'),
  },
});

const controller = createThirdPersonOverShoulderController(game, { target: player });
scene.add(controller);

scene.onFrame(({ delta }) => {
  player.transform.rotation.y += delta;
});
```

Call `scene.dispose()` when switching scenes or unmounting UI to remove owned entities, frame listeners, debug visuals, and controllers.
Call `scene.reset()` to restore owned entity transforms and run custom scene reset hooks.
Controller presets use WASD/arrows by default and accept an `input` map when a game needs custom bindings.
Character motors provide grounded movement, jump state, gravity, bounds, and dynamic ground height without requiring a camera preset.
Renderer lighting can be tuned with `createGame({ renderer: { lighting: { ambient, direction, directional } } })`.
Use fixed-step simulation with `createGame({ runtime: { fixedStep: 1 / 60 } })` or `<GameCanvas :runtime="{ fixedStep: 1 / 60 }">`.
Entities can be parented for compound actors; render and collision queries use world-space transforms.
Runtime clocks support pause/resume, time scaling, manual stepping, max delta clamping, and fixed-step catch-up limits.
Runtime profilers summarize frame pacing, FPS ranges, and over-budget frames for HUDs, debug panels, and automated checks.
Collision bodies support layer/mask filtering, and worlds can create/load serializable snapshots for save, restore, and editor workflows.
Entities support names and tags for organization, queries, inspection tools, and editor-style workflows.
Spatial collision queries and gameplay inspection snapshots help build debug overlays, selection tools, objectives, and editor panels without demo-specific engine code.
Ray collision queries support picking, aiming, line-of-sight checks, and editor selection.
Camera helpers create viewport rays for mouse picking, aiming, sensors, and editor tools.
Asset registries provide the first reusable loading/cache boundary for future mesh, texture, scene, and audio pipelines.
Scene schedulers provide lifecycle-bound delays and intervals for cooldowns, waves, UI refreshes, and timed rules.
Entity blueprints instantiate reusable prefab-style hierarchies while keeping game-specific behavior in game code.

## Playground demos

- `Nightfall Run` - third-person combat-style traversal with hazards and extraction objective
- `Orbital Islands` - jumping/double-jumping platform traversal
- `Starfield Drift` - spaceflight, beacon collection, and projectile target practice
- `Velocity Circuit` - arcade vehicle loop and checkpoint racing flow
- `Preset Lab` - live controller preset switching sandbox
- `First Person Range` - first-person movement and signal collection challenge
- `Tactics Board` - isometric movement with blockers, capture zones, and debug bounds

`vehicleArcade` and `vehicleSim` use vehicle-style throttle, braking, steering, drag, and chase camera behavior rather than character-style movement.

## Start here docs

- [Developer Resources](docs/RESOURCES.md)
- [Getting Started](docs/GETTING_STARTED.md)
- [First Game in 10 Minutes](docs/FIRST_GAME.md)
- [Alpha Release](docs/ALPHA_RELEASE.md)
- [External Developer Workflow](docs/EXTERNAL_DEVELOPER_WORKFLOW.md)
- [Licensing](docs/LICENSING.md)
- [Versioning](docs/VERSIONING.md)
- [Release Process](docs/RELEASE_PROCESS.md)
- [Public API Reference Direction](docs/API_REFERENCE.md)
- [Discussions](docs/DISCUSSIONS.md)
- [Choosing Camera + Controls](docs/PRESET_GUIDE.md)
- [Suggested Game Project Layout](docs/PROJECT_LAYOUT.md)
- [Roadmap](docs/ROADMAP.md)

## Project direction

Mochi should be a configuration-first engine where common game styles start from presets instead of one-off rewrites. Advanced systems should be available when a game needs them; simple APIs should stay simple.

## License

Mochi uses the Functional Source License, Version 1.1, Apache 2.0 Future License (FSL-1.1-ALv2). You can build and sell games/apps with Mochi, but you cannot repackage Mochi itself as a competing commercial engine or SDK. See [LICENSE.md](LICENSE.md) and [Licensing](docs/LICENSING.md).
