# Choosing Camera + Controls

Pick presets by camera/control model first, then genre.

## Presets

- `firstPerson` - direct look + strafe movement
- `thirdPersonOrbit` - character focus with free orbit
- `thirdPersonOverShoulder` - tighter combat framing
- `topDown` - overhead tactical control
- `isometric` - fixed angled camera
- `sideScroller2D` - side view movement lane
- `vehicleArcade` - fast, forgiving throttle/brake/steer vehicle movement
- `vehicleSim` - heavier vehicle movement with slower acceleration and steadier steering
- `spaceflightArcade` - open 3D spacecraft movement with thrust, pitch, yaw, roll, vertical strafe, and chase camera
- `railCamera` - constrained cinematic movement
- `strategyFreeCam` - detached map camera

## Fast mapping by game type

- Arena FPS -> `firstPerson`
- Third-person action shooter -> `thirdPersonOverShoulder`
- Adventure/platformer -> `thirdPersonOrbit`
- ARPG/RTS-lite -> `isometric` or `topDown`
- Kart/arcade racer -> `vehicleArcade`
- Sim racer -> `vehicleSim`
- Small space game -> `spaceflightArcade`

Use the playground `Preset Lab` demo to switch these camera/control models live. `First Person Range` shows `firstPerson`, `Tactics Board` shows `isometric`, and `Starfield Drift` shows `spaceflightArcade`.

## API patterns

### Explicit constructor

```ts
import { createThirdPersonOrbitController } from '@mochi/gameplay';
const controller = createThirdPersonOrbitController(game, { target: player });
```

### Registry style

```ts
import { createControllerPreset } from '@mochi/gameplay';
const controller = createControllerPreset(game, 'thirdPersonOrbit', { target: player });
```

### Scene reset

```ts
scene.addReset(() => {
  controller.reset();
});

scene.reset();
```

### Event signals

```ts
import { createEventSignal } from '@mochi/gameplay';

const collected = createEventSignal<{ id: string }>();
const collectedIds: string[] = [];
const stop = collected.on(({ id }) => {
  collectedIds.push(id);
});

collected.emit({ id: 'core-1' });
stop();
```

### Entity components

```ts
import { createComponentType, getComponent, setComponent } from '@mochi/gameplay';

const health = createComponentType<{ value: number }>('health');
setComponent(player, health, { value: 100 });

const playerHealth = getComponent(player, health);
```

### Entity names and tags

```ts
const boss = scene.createEntity({
  id: 'boss-01',
  name: 'Gate Warden',
  tags: ['enemy', 'boss'],
});

const bosses = game.world.queryEntitiesByTag('boss');
game.world.addTag(boss, 'active');
```

### Runtime collision bodies

```ts
import { queryCollisionBodies, queryTriggerPairs, setBoxCollisionBody } from '@mochi/gameplay';

const playerLayer = 1;
const pickupLayer = 1 << 1;

setBoxCollisionBody(player, {
  layer: playerLayer,
  mask: pickupLayer,
});
setBoxCollisionBody(exitZone, {
  layer: pickupLayer,
  mask: playerLayer,
  trigger: true,
});

const bodies = queryCollisionBodies(game.world.allEntities());
const triggerPairs = queryTriggerPairs(bodies);
```

### Spatial collision queries

```ts
import { queryCollisionBodiesAtPoint, queryCollisionBodiesInSphere } from '@mochi/gameplay';

const nearby = queryCollisionBodiesInSphere(
  queryCollisionBodies(game.world.allEntities()),
  player.transform.position,
  4,
);

const clicked = queryCollisionBodiesAtPoint(
  queryCollisionBodies(game.world.allEntities()),
  targetPoint,
);
```

### Trigger volumes and damage zones

```ts
import { createDamageZone, setSphereCollisionBody } from '@mochi/gameplay';

setSphereCollisionBody(player, { radius: 0.6 });

createDamageZone({
  scene,
  targets: () => [player],
  position: { x: 4, y: 0, z: -2 },
  shape: { kind: 'box', halfX: 1.5, halfY: 1, halfZ: 1.5 },
  damage: 10,
  interval: 0.75,
  onDamage: ({ target, damage }) => {
    console.log(`${target.id} took ${damage}`);
  },
});
```

### Projectiles

```ts
import { createProjectileEmitter, getSpaceflightForward } from '@mochi/gameplay';

const blasters = createProjectileEmitter({
  scene,
  targets: () => enemies.map((enemy) => ({
    entity: enemy.entity,
    radius: 1,
    active: () => !enemy.destroyed,
    onHit: () => {
      enemy.destroyed = true;
    },
  })),
});

blasters.fire({
  position: ship.transform.position,
  direction: getSpaceflightForward(ship),
});
```

### Vue HUD stats

```ts
import { useGameStats } from '@mochi/vue';
import { computed } from 'vue';

const stats = useGameStats();
const fpsLabel = computed(() => Math.round(stats.fps.value));
```

### Vue scene lifecycle

```ts
import { useGameScene } from '@mochi/vue';

const sceneHandle = useGameScene();
const scene = sceneHandle.scene;

sceneHandle.reset();
```

### Material presets

```ts
import { createMaterial } from '@mochi/gameplay';

const player = scene.createEntity({
  renderable: {
    primitive: 'cube',
    material: createMaterial('solid'),
  },
});
```

### Debug bounds

```ts
import { createDebugBoxBounds, createDebugTargetMarker } from '@mochi/gameplay';

createDebugBoxBounds(scene, colliders, {
  enabled: () => showDebugBounds.value,
});

createDebugTargetMarker(scene, player, {
  enabled: () => showDebugBounds.value,
});
```

### Input bindings

```ts
const controller = createThirdPersonOrbitController(game, {
  target: player,
  input: {
    forward: 'KeyI',
    backward: 'KeyK',
    left: 'KeyJ',
    right: 'KeyL',
    jump: 'Space',
  },
});
```

### Parent and child entities

```ts
const ship = scene.createEntity({ id: 'ship' });
const turret = scene.createEntity({
  id: 'ship-turret',
  parent: ship,
  transform: { position: { x: 0, y: 0.8, z: -0.4 } },
});

ship.transform.position.z -= 5;
```

The child keeps a local transform, while rendering and collision queries use the composed world transform.

### World snapshots

```ts
const saved = game.world.createWorldSnapshot();

game.world.clear();
game.world.loadWorldSnapshot(saved);
```

World snapshots include camera state, entity transforms, hierarchy, renderables, and world-space positions. Keep game-specific state such as score, inventory, quest flags, and network state in game code or dedicated systems.

### Game inspection snapshots

```ts
import { createGameInspectionSnapshot } from '@mochi/gameplay';

const inspection = createGameInspectionSnapshot(game);
console.log(inspection.entityCount, inspection.collisionBodyCount, inspection.tags);
```

Use inspection snapshots for debug HUDs, editor panels, profiling tools, and automated checks. They summarize engine-owned state and leave game-specific interpretation to the app.

### Spaceflight controls

```ts
import { createSpaceflightArcadeController } from '@mochi/gameplay';

const controller = createSpaceflightArcadeController(game, {
  target: ship,
  bounds: { minX: -50, maxX: 50, minY: -10, maxY: 30, minZ: -200, maxZ: 50 },
  input: {
    thrust: 'KeyW',
    brake: 'KeyS',
    yawLeft: 'KeyA',
    yawRight: 'KeyD',
    pitchUp: 'KeyR',
    pitchDown: 'KeyF',
    rollLeft: 'KeyQ',
    rollRight: 'KeyE',
  },
});
```

## Tuning tips

- Start with movement speed and camera distance.
- Presets accept custom keyboard bindings through `input`.
- In vehicle presets, `forward` and `backward` map to throttle and brake.
- For vehicle presets, tune `acceleration`, `maxSpeed`, `drag`, and `turnSpeed`.
- In spaceflight presets, tune `thrust`, `maxSpeed`, `drag`, pitch/yaw/roll speeds, and 3D bounds.
- Use pooled projectile emitters for repeated blaster-style firing rather than creating unbounded entities per shot.
- Tune sensitivity and camera lerp before adding special logic.
- Keep defaults unless you have a clear gameplay reason.
- Add a new preset only if multiple projects need the same tuned profile.

