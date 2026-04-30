# Getting Started

This guide takes you from a game app to a playable prototype.

## 1) Install Mochi

```bash
pnpm add @mochi-labs/vue@alpha vue
```

With npm:

```bash
npm install @mochi-labs/vue@alpha vue
```

`@mochi-labs/vue` brings in the gameplay, renderer, and core packages. Install lower-level packages directly only when you need them:

```bash
pnpm add @mochi-labs/gameplay@alpha @mochi-labs/renderer-webgl@alpha @mochi-labs/core@alpha
```

## 2) Mount the canvas

```vue
<script setup lang="ts">
import { GameCanvas } from '@mochi-labs/vue';
import FirstScene from './game/FirstScene.vue';
</script>

<template>
  <GameCanvas :runtime="{ fixedStep: 1 / 60 }">
    <FirstScene />
  </GameCanvas>
</template>
```

## 3) Understand the package split

- `@mochi-labs/core` - world state, input state, and frame loop primitives
- `@mochi-labs/renderer-webgl` - rendering backend
- `@mochi-labs/gameplay` - high-level facade, control presets, scene lifecycle, and gameplay helpers
- `@mochi-labs/vue` - Vue adapter and UI-facing ergonomics

Use `@mochi-labs/gameplay` first unless you are working on engine internals.

## 4) Create your first scene object

```ts
import { useGame, useGameScene } from '@mochi-labs/vue';

const game = useGame();
const { scene } = useGameScene();
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
```

## 5) Pick a controller preset

```ts
import { createThirdPersonOverShoulderController } from '@mochi-labs/gameplay';

const controller = createThirdPersonOverShoulderController(game, {
  target: player,
});
scene.add(controller);
```

## 6) Add gameplay loop logic

```ts
scene.onFrame(({ delta, input }) => {
  if (input.isKeyDown('KeyR')) {
    player.transform.rotation.y += delta;
  }
});
```

## 7) Choose deterministic stepping when needed

For gameplay that must update at a stable simulation rate, configure the runtime with a fixed step:

```vue
<GameCanvas :runtime="{ fixedStep: 1 / 60 }">
  <YourScene />
</GameCanvas>
```

Headless setup uses the same option:

```ts
const game = createGame({
  canvas,
  runtime: {
    fixedStep: 1 / 60,
    maxDelta: 0.1,
    maxFixedSteps: 5,
  },
});
```

Use `game.runtime.pause()`, `game.runtime.resume()`, `game.runtime.setTimeScale(0.5)`, and `game.runtime.step()` for pause menus, slow motion, debugging, and deterministic tools.

## 8) Clean up on scene exit

`useGameScene()` disposes scene-owned entities, frame listeners, controllers, and cleanup callbacks when the Vue component unmounts.
Use `scene.reset()` when a demo needs replay behavior without rebuilding the whole game.

## Contributing to Mochi

Clone this repository and install the workspace only when you are contributing to the engine itself:

```bash
pnpm install
pnpm dev
```

Use `pnpm dev:starter` to test the in-repo starter app, and run `pnpm verify` before opening a PR or changing public APIs.

## Recommended workflow

1. Install Mochi into your game app.
2. Keep gameplay logic scene-local first.
3. Extract repeated app code into your own `src/game` helpers.
4. Add engine features in this repository only when they are reusable outside one game.
5. Run `pnpm verify` before changing public API or opening a PR.

## Common pitfalls

- Do not push large per-frame state through Vue reactivity.
- Keep camera/control in presets, not duplicated per scene.
- Prefer explicit entity IDs for debugging and cleanup.
