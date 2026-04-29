# lite3d

Custom web game engine with Vue as the visibility layer.

`lite3d` is built around a simple idea: game developers should spend time on gameplay, not engine plumbing.  
The core runtime and renderer stay framework-agnostic, while Vue provides an ergonomic shell for canvas hosting and HUD/UI.

The long-term ambition is a full-featured, AAA-capable web game engine that remains approachable for solo developers, small teams, and external contributors.

## What is in this repo

- `packages/runtime` - headless runtime primitives (world, entities, transforms, input state, frame loop)
- `packages/render-webgl` - custom WebGL2 renderer package
- `packages/game` - high-level facade (`createGame`), controller presets, scene lifecycle, and collision helpers
- `packages/engine-vue` - Vue integration (`GameCanvas`, `useGame`, `useFrame`)
- `apps/playground` - playable demo app with multiple showcase scenes

## Current controller presets

From `@lite3d/game`:

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

## Minimal usage (Vue + facade)

```ts
import { createGame, createThirdPersonOverShoulderController } from '@lite3d/game';

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
    material: { color: { x: 0.4, y: 0.6, z: 1 } },
  },
});

const controller = createThirdPersonOverShoulderController(game, { target: player });
scene.add(controller);

scene.onFrame(({ delta }) => {
  player.transform.rotation.y += delta;
});
```

Call `scene.dispose()` when switching scenes or unmounting UI to remove owned entities, frame listeners, and controllers.

## Playground demos

- `Nightfall Run` - third-person combat-style traversal with hazards and extraction objective
- `Orbital Islands` - jumping/double-jumping platform traversal
- `Velocity Circuit` - arcade vehicle loop and checkpoint racing flow

`vehicleArcade` and `vehicleSim` use vehicle-style throttle, braking, steering, drag, and chase camera behavior rather than character-style movement.

## Start here docs

- [Getting Started](docs/GETTING_STARTED.md)
- [Choosing Camera + Controls](docs/PRESET_GUIDE.md)
- [Suggested Game Project Layout](docs/PROJECT_LAYOUT.md)
- [Roadmap](docs/ROADMAP.md)

## Project direction

The long-term goal is a configuration-first engine where common game styles are presets instead of bespoke rewrites.  
The north star is AAA-level capability with beginner-friendly defaults: advanced systems when you need them, simple APIs when you just want to build.

