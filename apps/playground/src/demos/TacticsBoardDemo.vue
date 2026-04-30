<script setup lang="ts">
import { useGame } from '@mochi/vue';
import {
  createBoxCollider,
  createDebugBoxBounds,
  createDebugRay,
  createDebugTargetMarker,
  createGameInspectionSnapshot,
  createIsometricController,
  createSceneScheduler,
  overlapsCollisionBodies,
  resolveBoxCollisions,
  setBoxCollisionBody,
  type BoxCollider,
  type CollisionBody,
  type Entity,
} from '@mochi/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import DemoHud from '../components/DemoHud.vue';

interface CapturePoint {
  entity: Entity;
  body: CollisionBody;
  color: { x: number; y: number; z: number };
  secured: boolean;
}

const unitLayer = 1;
const blockerLayer = 1 << 1;
const captureLayer = 1 << 2;

const game = useGame();
const scene = game.createScene();
const secured = shallowRef(0);
const timer = shallowRef(70);
const state = shallowRef<'running' | 'won' | 'lost'>('running');
const debugBounds = shallowRef(false);
const inspection = shallowRef(createGameInspectionSnapshot(game));
const scheduler = createSceneScheduler(scene);

scene.createEntity({
  id: 'tactics-board',
  tags: ['terrain'],
  transform: { scale: { x: 22, y: 1, z: 22 } },
  renderable: {
    primitive: 'plane',
    material: { color: { x: 0.08, y: 0.1, z: 0.13 } },
  },
});

const unit = createBox('tactics-unit', 0, 0.65, 7, 0.95, 1.3, 0.95, {
  x: 0.45,
  y: 0.72,
  z: 1,
}, ['actor', 'player']);
const unitBody = setBoxCollisionBody(unit, {
  halfX: 0.55,
  halfY: 0.7,
  halfZ: 0.55,
  layer: unitLayer,
  mask: blockerLayer | captureLayer,
});
const blockers: BoxCollider[] = [
  createBlocker('tactics-blocker-a', -4, 0.55, -2, 1.2, 1.1, 5, { x: 0.18, y: 0.2, z: 0.3 }),
  createBlocker('tactics-blocker-b', 4.2, 0.55, 2.2, 1.2, 1.1, 5.2, { x: 0.18, y: 0.2, z: 0.3 }),
  createBlocker('tactics-blocker-c', 0, 0.45, 0, 3.5, 0.9, 1.1, { x: 0.22, y: 0.24, z: 0.36 }),
];
createDebugBoxBounds(scene, blockers, {
  enabled: () => debugBounds.value,
});
createDebugTargetMarker(scene, unit, {
  enabled: () => debugBounds.value,
});
createDebugRay(scene, () => unit.transform.position, () => ({ x: 0, y: 0, z: -1 }), {
  id: 'tactics-debug-ray',
  enabled: () => debugBounds.value,
  length: 3,
});
const points: CapturePoint[] = [
  createCapturePoint('capture-a', -7, -6),
  createCapturePoint('capture-b', 7, -5.5),
  createCapturePoint('capture-c', 0, 4.2),
];
const controller = createIsometricController(game, {
  target: unit,
  groundY: 0.65,
  bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: 10 },
  enabled: () => state.value === 'running',
});
scene.add(controller);
scene.addReset(() => {
  secured.value = 0;
  timer.value = 70;
  state.value = 'running';
  controller.reset();

  for (const point of points) {
    point.secured = false;
  }
});
scene.addReset(scheduleInspectionRefresh);
scheduleInspectionRefresh();

const label = computed(() => {
  if (state.value === 'won') return 'All zones secured';
  if (state.value === 'lost') return 'Operation timed out';
  return `${secured.value}/3 zones secured`;
});
const inspectionLabel = computed(() =>
  `${inspection.value.entityCount} entities · ${inspection.value.collisionBodyCount} bodies · ${inspection.value.collisionPairCount} pairs`,
);

scene.onFrame(({ delta, elapsed }) => {
  if (state.value === 'running') {
    timer.value = Math.max(0, timer.value - delta);
    if (timer.value === 0) state.value = 'lost';
    resolveBoxCollisions(unit, blockers);
  }

  for (const point of points) {
    point.entity.transform.rotation.y += delta;
    point.entity.transform.position.y = 0.5 + Math.sin(elapsed * 3) * 0.04;
    const color = point.color;
    color.x = point.secured ? 0.25 : 1;
    color.y = point.secured ? 1 : 0.62;
    color.z = point.secured ? 0.58 : 0.22;

    if (
      state.value === 'running' &&
      !point.secured &&
      overlapsCollisionBodies(unitBody, point.body)
    ) {
      point.secured = true;
      secured.value += 1;
    }
  }

  if (state.value === 'running' && secured.value === points.length) {
    state.value = 'won';
  }
});

onBeforeUnmount(() => {
  scene.dispose();
});

function createBlocker(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: { x: number; y: number; z: number },
): BoxCollider {
  const entity = createBox(id, x, y, z, sx, sy, sz, color, ['blocker', 'terrain']);
  setBoxCollisionBody(entity, {
    halfX: sx / 2,
    halfY: sy / 2,
    halfZ: sz / 2,
    layer: blockerLayer,
    mask: unitLayer,
  });
  return createBoxCollider(entity);
}

function createCapturePoint(id: string, x: number, z: number): CapturePoint {
  const color = { x: 1, y: 0.62, z: 0.22 };
  const entity = createBox(id, x, 0.5, z, 0.85, 0.35, 0.85, color, ['objective', 'trigger']);

  return {
    entity,
    body: setBoxCollisionBody(entity, {
      halfX: 1.35,
      halfY: 1,
      halfZ: 1.35,
      layer: captureLayer,
      mask: unitLayer,
      trigger: true,
    }),
    color,
    secured: false,
  };
}

function createBox(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: { x: number; y: number; z: number },
  tags: string[] = [],
): Entity {
  return scene.createEntity({
    id,
    tags,
    transform: { position: { x, y, z }, scale: { x: sx, y: sy, z: sz } },
    renderable: { primitive: 'cube', material: { color } },
  });
}

function resetBoard(): void {
  scene.reset();
}

function toggleDebugBounds(): void {
  debugBounds.value = !debugBounds.value;
  inspection.value = createGameInspectionSnapshot(game);
}

function scheduleInspectionRefresh(): void {
  scheduler.interval(0.25, () => {
    if (debugBounds.value) {
      inspection.value = createGameInspectionSnapshot(game);
    }
  });
}
</script>

<template>
  <DemoHud
    mode="TACTICS BOARD"
    :title="label"
    :meta="`${Math.ceil(timer)}s`"
    hint="Isometric preset. Move the unit around blockers and secure every zone."
    position="bottom-left"
  >
    <button
      class="demo-action"
      type="button"
      @click="toggleDebugBounds"
    >
      {{ debugBounds ? 'Hide bounds' : 'Show bounds' }}
    </button>
    <div v-if="debugBounds" class="demo-inspection">
      <p class="demo-inspection__line">{{ inspectionLabel }}</p>
      <p class="demo-inspection__line">
        Tags:
        <span
          v-for="entry in inspection.tags"
          :key="entry.tag"
        >
          {{ entry.tag }}({{ entry.count }})
        </span>
      </p>
    </div>
    <button
      v-if="state !== 'running'"
      class="demo-action"
      type="button"
      @click="resetBoard"
    >
      Reset board
    </button>
  </DemoHud>
</template>

<style scoped>
.demo-action {
  margin-top: 0.8rem;
  margin-right: 0.45rem;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: 8px;
  background: #eef4ff;
  color: #090b12;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.demo-inspection {
  margin-top: 0.7rem;
  font-size: 0.76rem;
  opacity: 0.82;
}

.demo-inspection__line {
  margin: 0.2rem 0 0;
}

.demo-inspection__line span + span {
  margin-left: 0.35rem;
}
</style>
