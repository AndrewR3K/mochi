# First Game in 10 Minutes

This guide uses the alpha starter app as the external developer path. It avoids engine internals and playground-only shortcuts.

## 1) Run the starter

```bash
pnpm install
pnpm dev:starter
```

Open the URL printed by Vite. You should see `Signal Grove`, a small third-person collection scene.

## 2) Understand the component split

The starter has two important files:

- `apps/alpha-starter/src/App.vue` hosts `<GameCanvas>` and HUD state.
- `apps/alpha-starter/src/game/FirstGameScene.vue` owns scene entities, controller setup, collision, and gameplay rules.

This is the recommended split for Vue games: Vue renders HUD and menus, while the scene component owns simulation setup.

## 3) Mount the game canvas

```vue
<GameCanvas :runtime="{ fixedStep: 1 / 60 }">
  <FirstGameScene />
</GameCanvas>
```

Use `fixedStep` for gameplay loops that should behave consistently across frame rates.

## 4) Create an entity

```ts
const player = scene.createEntity({
  id: 'player',
  tags: ['player'],
  transform: {
    position: { x: 0, y: 0.65, z: 4 },
    scale: { x: 0.8, y: 1.3, z: 0.8 },
  },
  renderable: {
    primitive: 'cube',
    material: createMaterial('solid'),
  },
});
```

Prefer stable IDs and tags early. They make debugging, inspection, saves, and future editor workflows easier.

## 5) Add controls

```ts
scene.add(
  createThirdPersonOverShoulderController(game, {
    target: player,
    moveSpeed: 5,
  }),
);
```

Scene ownership keeps cleanup simple. When the scene unmounts, the controller and frame listeners are disposed with it.

## 6) Add collision and debug visuals

```ts
const blocker = createBoxCollider(wallEntity);

createDebugBoxBounds(scene, [blocker], {
  enabled: () => showDebug,
});

scene.onFrame(() => {
  resolveBoxCollisions(player, [blocker]);
});
```

Use debug helpers while building. Turn them off for final gameplay, but keep the toggle around while tuning movement.

## 7) Build it

```bash
pnpm --filter alpha-starter build
```

The root verification command also builds the starter:

```bash
pnpm verify
```

## Where to go next

- Add a second scene component.
- Move repeated entity creation into `src/game/entities`.
- Move repeated frame rules into `src/game/systems`.
- Keep code in the app until it is clearly reusable across projects.
