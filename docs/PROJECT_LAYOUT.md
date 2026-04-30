# Suggested Game Project Layout

Use this as a baseline for teams building on Mochi.

## Minimal structure

```text
src/
  game/
    scenes/
      NightfallScene.ts
      MenuScene.ts
    systems/
      missionSystem.ts
      combatSystem.ts
    entities/
      playerFactory.ts
      enemyFactory.ts
  ui/
    hud/
      MissionHud.vue
      InventoryHud.vue
  app/
    GameRoot.vue
```

## Responsibility split

- `game/scenes` - scene setup and teardown
- `game/systems` - frame-based gameplay rules
- `game/entities` - entity creation helpers/factories
- `ui/` - Vue-only visibility layer, HUD, menus, overlays

Keep gameplay state in engine/runtime structures; keep Vue focused on presentation and player-facing controls.

## Engine vs game code

Treat `packages/*` as the engine that external developers install and build against. Treat `apps/playground` as a consumer of that public API.

- Demos should be written like external game code whenever possible.
- Demo-specific mission rules, enemy behavior, scoring, layout, and UI should stay in the demo/app layer.
- Promote code into `packages/gameplay` only when it is a reusable engine primitive with a clear public API.
- If a demo needs a new engine feature, make that as a separate, reviewable engine change and keep the demo as an example of using it.

## Scene lifecycle pattern

1. Create entities
2. Attach controller preset
3. Register frame listeners
4. Expose minimal HUD state
5. Dispose listeners/controller/entities on exit

In Vue demos, prefer `useGameScene()` and scene ownership:

```ts
const { scene, reset } = useGameScene();
const player = scene.createEntity({ id: 'player' });
const controller = createThirdPersonOrbitController(game, { target: player });

scene.add(controller);
scene.onFrame(({ delta }) => {
  player.transform.rotation.y += delta;
});
```

That keeps teardown local and avoids manual `game.world.removeEntity(...)` calls spread through UI components.

## Workspace checks

- `pnpm dev` - run the playground
- `pnpm build` - build the playground
- `pnpm typecheck` - typecheck packages with a `typecheck` script
- `pnpm verify` - typecheck the workspace and build the playground

## Naming conventions

- Entities: stable string IDs (`player`, `gate-a`, `checkpoint-2`)
- Systems: `<feature>System.ts`
- Factories: `<entity>Factory.ts`
- Demos: `<Theme>Demo.vue`

## Scaling from prototype to game

- Prototype quickly in one scene file
- Split into systems/factories once logic repeats
- Promote stable patterns to `packages/gameplay` (presets/utilities)
