<script setup lang="ts">
import { useGame } from '@mochi/vue';
import {
  createBoxCollider,
  createDebugBoxBounds,
  createDebugTargetMarker,
  createIsometricController,
  distance2d,
  resolveBoxCollisions,
  type BoxCollider,
  type Entity,
} from '@mochi/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import DemoHud from '../components/DemoHud.vue';

interface CapturePoint {
  entity: Entity;
  color: { x: number; y: number; z: number };
  secured: boolean;
}

const game = useGame();
const scene = game.createScene();
const secured = shallowRef(0);
const timer = shallowRef(70);
const state = shallowRef<'running' | 'won' | 'lost'>('running');
const debugBounds = shallowRef(false);

scene.createEntity({
  id: 'tactics-board',
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

const label = computed(() => {
  if (state.value === 'won') return 'All zones secured';
  if (state.value === 'lost') return 'Operation timed out';
  return `${secured.value}/3 zones secured`;
});

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
      distance2d(unit, point.entity) < 1.35
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
  return createBoxCollider(createBox(id, x, y, z, sx, sy, sz, color));
}

function createCapturePoint(id: string, x: number, z: number): CapturePoint {
  const color = { x: 1, y: 0.62, z: 0.22 };
  return {
    entity: createBox(id, x, 0.5, z, 0.85, 0.35, 0.85, color),
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
): Entity {
  return scene.createEntity({
    id,
    transform: { position: { x, y, z }, scale: { x: sx, y: sy, z: sz } },
    renderable: { primitive: 'cube', material: { color } },
  });
}

function resetBoard(): void {
  scene.reset();
}

function toggleDebugBounds(): void {
  debugBounds.value = !debugBounds.value;
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
</style>
