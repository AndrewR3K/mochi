# lite3d

Custom web game engine with Vue as the visibility layer.

`lite3d` is built around a simple idea: game developers should spend time on gameplay, not engine plumbing.  
The core runtime and renderer stay framework-agnostic, while Vue provides an ergonomic shell for canvas hosting and HUD/UI.

## What is in this repo

- `packages/runtime` - headless runtime primitives (world, entities, transforms, input state, frame loop)
- `packages/render-webgl` - custom WebGL2 renderer package
- `packages/game` - high-level facade (`createGame`) and controller presets
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
const player = game.world.createEntity({
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
```

## Playground demos

- `Nightfall Run` - third-person combat-style traversal with hazards and extraction objective
- `Orbital Islands` - jumping/double-jumping platform traversal
- `Velocity Circuit` - arcade vehicle loop and checkpoint racing flow

## Start here docs

- [Getting Started](docs/GETTING_STARTED.md)
- [Choosing Camera + Controls](docs/PRESET_GUIDE.md)
- [Suggested Game Project Layout](docs/PROJECT_LAYOUT.md)

## Project direction

The long-term goal is a configuration-first engine where common game styles are presets instead of bespoke rewrites.  
That means external developers can pick a camera/control mode quickly and build content immediately.

