# Mochi

Vue.js-first 3D game engine.

Mochi is built around a simple idea: game developers should spend time on gameplay, not engine plumbing.
The core runtime and renderer stay framework-agnostic, while Vue provides an ergonomic shell for canvas hosting and HUD/UI.

The long-term ambition is a full-featured, AAA-capable web game engine that remains approachable for solo developers, small teams, and external contributors.

## What is in this repo

- `packages/core` (`@mochi/core`) - headless runtime primitives: world, entities, components, collision bodies, transforms, input state, and frame loop
- `packages/renderer-webgl` (`@mochi/renderer-webgl`) - custom WebGL2 renderer with simple material lighting
- `packages/gameplay` (`@mochi/gameplay`) - high-level facade (`createGame`), controller presets, scene lifecycle, gameplay helpers, and debug utilities
- `packages/vue` (`@mochi/vue`) - Vue adapter (`GameCanvas`, `useGame`, `useGameScene`, `useFrame`, `useGameStats`)
- `apps/playground` - playable demo app with multiple showcase scenes

## Current controller presets

From `@mochi/gameplay`:

- `createFirstPersonController`
- `createThirdPersonOrbitController`
- `createThirdPersonOverShoulderController`
- `createTopDownController`
- `createIsometricController`
- `createSideScroller2DController`
- `createVehicleArcadeController`
- `createVehicleSimController`
- `createRailCameraController`
- `createStrategyFreeCamController`
- `createControllerPreset(game, kind, options)` with `CONTROLLER_PRESET_KINDS`

## Quick start

### Requirements

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Run playground

```bash
pnpm dev
```

### Build playground

```bash
pnpm build
```

### Verify workspace

```bash
pnpm verify
```

`pnpm verify` typechecks every package with a `typecheck` script, then builds the playground. Use it before opening a PR or changing shared engine APIs.

## Minimal usage (Vue + facade)

```ts
import { createGame, createMaterial, createThirdPersonOverShoulderController } from '@mochi/gameplay';

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
Renderer lighting can be tuned with `createGame({ renderer: { lighting: { ambient, direction, directional } } })`.

## Playground demos

- `Nightfall Run` - third-person combat-style traversal with hazards and extraction objective
- `Orbital Islands` - jumping/double-jumping platform traversal
- `Velocity Circuit` - arcade vehicle loop and checkpoint racing flow
- `Preset Lab` - live controller preset switching sandbox
- `First Person Range` - first-person movement and signal collection challenge
- `Tactics Board` - isometric movement with blockers, capture zones, and debug bounds

`vehicleArcade` and `vehicleSim` use vehicle-style throttle, braking, steering, drag, and chase camera behavior rather than character-style movement.

## Start here docs

- [Getting Started](docs/GETTING_STARTED.md)
- [Choosing Camera + Controls](docs/PRESET_GUIDE.md)
- [Suggested Game Project Layout](docs/PROJECT_LAYOUT.md)
- [Roadmap](docs/ROADMAP.md)

## Project direction

The long-term goal is a configuration-first engine where common game styles are presets instead of bespoke rewrites.  
The north star is AAA-level capability with beginner-friendly defaults: advanced systems when you need them, simple APIs when you just want to build.
