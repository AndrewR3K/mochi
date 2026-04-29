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
- `railCamera` - constrained cinematic movement
- `strategyFreeCam` - detached map camera

## Fast mapping by game type

- Arena FPS -> `firstPerson`
- Third-person action shooter -> `thirdPersonOverShoulder`
- Adventure/platformer -> `thirdPersonOrbit`
- ARPG/RTS-lite -> `isometric` or `topDown`
- Kart/arcade racer -> `vehicleArcade`
- Sim racer -> `vehicleSim`

Use the playground `Preset Lab` demo to switch these camera/control models live. Use `First Person Range` for a focused `firstPerson` example, and `Tactics Board` for an `isometric` example.

## API patterns

### Explicit constructor

```ts
import { createThirdPersonOrbitController } from '@lite3d/gameplay';
const controller = createThirdPersonOrbitController(game, { target: player });
```

### Registry style

```ts
import { createControllerPreset } from '@lite3d/gameplay';
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
import { createEventSignal } from '@lite3d/gameplay';

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
import { createComponentType, getComponent, setComponent } from '@lite3d/gameplay';

const health = createComponentType<{ value: number }>('health');
setComponent(player, health, { value: 100 });

const playerHealth = getComponent(player, health);
```

### Runtime collision bodies

```ts
import { queryCollisionBodies, queryTriggerPairs, setBoxCollisionBody } from '@lite3d/gameplay';

setBoxCollisionBody(player);
setBoxCollisionBody(exitZone, { trigger: true });

const bodies = queryCollisionBodies(game.world.allEntities());
const triggerPairs = queryTriggerPairs(bodies);
```

### Vue HUD stats

```ts
import { useGameStats } from '@lite3d/vue';
import { computed } from 'vue';

const stats = useGameStats();
const fpsLabel = computed(() => Math.round(stats.fps.value));
```

### Vue scene lifecycle

```ts
import { useGameScene } from '@lite3d/vue';

const sceneHandle = useGameScene();
const scene = sceneHandle.scene;

sceneHandle.reset();
```

### Material presets

```ts
import { createMaterial } from '@lite3d/gameplay';

const player = scene.createEntity({
  renderable: {
    primitive: 'cube',
    material: createMaterial('solid'),
  },
});
```

### Debug bounds

```ts
import { createDebugBoxBounds, createDebugTargetMarker } from '@lite3d/gameplay';

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

## Tuning tips

- Start with movement speed and camera distance.
- Presets accept configurable keyboard bindings through `input`.
- In vehicle presets, `forward` and `backward` map to throttle and brake.
- For vehicle presets, tune `acceleration`, `maxSpeed`, `drag`, and `turnSpeed`.
- Tune sensitivity and camera lerp before adding special logic.
- Keep defaults unless you have a clear gameplay reason.
- Add a new preset only if multiple projects need the same tuned profile.

