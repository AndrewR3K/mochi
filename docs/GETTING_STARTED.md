# Getting Started

This guide gets you from clone to a playable prototype quickly.

## 1) Install and run

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite.

## 2) Understand the runtime split

- `@lite3d/runtime` - world state, input state, and frame loop primitives
- `@lite3d/render-webgl` - rendering backend
- `@lite3d/game` - high-level game facade and control presets
- `@lite3d/engine-vue` - Vue integration and UI-facing ergonomics

Use `@lite3d/game` first unless you are intentionally building low-level engine features.

## 3) Create your first scene object

```ts
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
```

## 4) Pick a controller preset

```ts
import { createThirdPersonOverShoulderController } from '@lite3d/game';

const controller = createThirdPersonOverShoulderController(game, {
  target: player,
});
```

## 5) Add gameplay loop logic

```ts
const stop = game.onFrame(({ delta, input }) => {
  if (input.isKeyDown('KeyR')) {
    player.transform.rotation.y += delta;
  }
});
```

## 6) Clean up on scene exit

```ts
stop();
controller.dispose();
game.world.removeEntity(player.id);
```

## Recommended workflow

1. Prototype in `apps/playground`
2. Keep gameplay logic scene-local first
3. Extract shared mechanics into `packages/game` only when used in multiple demos/games
4. Add new presets when a control/camera pattern stabilizes

## Common pitfalls

- Do not push large per-frame state through Vue reactivity.
- Keep camera/control in presets, not duplicated per scene.
- Prefer explicit entity IDs for debugging and cleanup.

