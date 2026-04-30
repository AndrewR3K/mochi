# Getting Started

This guide takes you from clone to a playable prototype.

## 1) Install and run

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite.

## 2) Understand the package split

- `@mochi/core` - world state, input state, and frame loop primitives
- `@mochi/renderer-webgl` - rendering backend
- `@mochi/gameplay` - high-level facade, control presets, scene lifecycle, and gameplay helpers
- `@mochi/vue` - Vue adapter and UI-facing ergonomics

Use `@mochi/gameplay` first unless you are working on engine internals.

## 3) Create your first scene object

```ts
import { useGame, useGameScene } from '@mochi/vue';

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

## 4) Pick a controller preset

```ts
import { createThirdPersonOverShoulderController } from '@mochi/gameplay';

const controller = createThirdPersonOverShoulderController(game, {
  target: player,
});
scene.add(controller);
```

## 5) Add gameplay loop logic

```ts
scene.onFrame(({ delta, input }) => {
  if (input.isKeyDown('KeyR')) {
    player.transform.rotation.y += delta;
  }
});
```

## 6) Choose deterministic stepping when needed

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

## 7) Clean up on scene exit

`useGameScene()` disposes scene-owned entities, frame listeners, controllers, and cleanup callbacks when the Vue component unmounts.
Use `scene.reset()` when a demo needs replay behavior without rebuilding the whole game.

## Recommended workflow

1. Prototype in `apps/playground`
2. Keep gameplay logic scene-local first
3. Extract shared mechanics into `packages/gameplay` only when they are useful outside one demo
4. Run `pnpm verify` before changing public API or opening a PR
5. Add new presets when a control/camera pattern stabilizes

## Common pitfalls

- Do not push large per-frame state through Vue reactivity.
- Keep camera/control in presets, not duplicated per scene.
- Prefer explicit entity IDs for debugging and cleanup.
