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

Use the playground `Preset Lab` demo to switch these camera/control models live. Use `First Person Range` for a focused `firstPerson` example, `Tactics Board` for an `isometric` example, and `Starfield Drift` for a `spaceflightArcade` example.

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

### Runtime collision bodies

```ts
import { queryCollisionBodies, queryTriggerPairs, setBoxCollisionBody } from '@mochi/gameplay';

setBoxCollisionBody(player);
setBoxCollisionBody(exitZone, { trigger: true });

const bodies = queryCollisionBodies(game.world.allEntities());
const triggerPairs = queryTriggerPairs(bodies);
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
- Presets accept configurable keyboard bindings through `input`.
- In vehicle presets, `forward` and `backward` map to throttle and brake.
- For vehicle presets, tune `acceleration`, `maxSpeed`, `drag`, and `turnSpeed`.
- In spaceflight presets, tune `thrust`, `maxSpeed`, `drag`, pitch/yaw/roll speeds, and 3D bounds.
- Use pooled projectile emitters for repeated blaster-style firing rather than creating unbounded entities per shot.
- Tune sensitivity and camera lerp before adding special logic.
- Keep defaults unless you have a clear gameplay reason.
- Add a new preset only if multiple projects need the same tuned profile.

