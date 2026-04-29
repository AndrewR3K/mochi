<script setup lang="ts">
import { useGame } from '@lite3d/engine-vue';
import { createFirstPersonController, distance2d, type Entity } from '@lite3d/game';
import { computed, onBeforeUnmount, shallowRef } from 'vue';

interface SignalNode {
  entity: Entity;
  collected: boolean;
  baseY: number;
}

const game = useGame();
const scene = game.createScene();
const collected = shallowRef(0);
const timer = shallowRef(50);
const state = shallowRef<'running' | 'won' | 'lost'>('running');

scene.createEntity({
  id: 'range-floor',
  transform: { scale: { x: 24, y: 1, z: 24 } },
  renderable: {
    primitive: 'plane',
    material: { color: { x: 0.07, y: 0.08, z: 0.11 } },
  },
});

const player = scene.createEntity({
  id: 'range-player',
  transform: {
    position: { x: 0, y: 0.7, z: 7.5 },
    scale: { x: 0.8, y: 1.4, z: 0.8 },
  },
});

const cover = [
  createBox('range-pillar-a', -4.5, 1, -3, 1.1, 2, 1.1, { x: 0.16, y: 0.18, z: 0.28 }),
  createBox('range-pillar-b', 4.3, 1, -2.2, 1.1, 2, 1.1, { x: 0.16, y: 0.18, z: 0.28 }),
  createBox('range-pillar-c', -2.8, 1, 3, 1.1, 2, 1.1, { x: 0.16, y: 0.18, z: 0.28 }),
  createBox('range-pillar-d', 3.2, 1, 4, 1.1, 2, 1.1, { x: 0.16, y: 0.18, z: 0.28 }),
];
const nodes: SignalNode[] = [
  createSignalNode('signal-1', -6, -5.5),
  createSignalNode('signal-2', 0, -7),
  createSignalNode('signal-3', 6, -5),
  createSignalNode('signal-4', -5.5, 3.5),
  createSignalNode('signal-5', 5.5, 5),
];
const controller = createFirstPersonController(game, {
  target: player,
  groundY: 0.7,
  bounds: { minX: -10.5, maxX: 10.5, minZ: -10.5, maxZ: 10.5 },
  enabled: () => state.value === 'running',
});
scene.add(controller);
scene.addReset(() => {
  collected.value = 0;
  timer.value = 50;
  state.value = 'running';
  controller.reset();

  for (const node of nodes) {
    node.collected = false;
  }
});

const label = computed(() => {
  if (state.value === 'won') return 'Range cleared';
  if (state.value === 'lost') return 'Signal window closed';
  return `${collected.value}/5 signals synced`;
});

scene.onFrame(({ delta, elapsed }) => {
  if (state.value === 'running') {
    timer.value = Math.max(0, timer.value - delta);
    if (timer.value === 0) state.value = 'lost';
  }

  for (const node of nodes) {
    node.entity.transform.rotation.y += delta * 2.4;
    node.entity.transform.position.y = node.baseY + Math.sin(elapsed * 4.5) * 0.08;
    const scale = node.collected ? 0 : 0.68;
    node.entity.transform.scale.x = scale;
    node.entity.transform.scale.y = scale;
    node.entity.transform.scale.z = scale;

    if (
      state.value === 'running' &&
      !node.collected &&
      distance2d(player, node.entity) < 1.15
    ) {
      node.collected = true;
      collected.value += 1;
    }
  }

  for (const block of cover) {
    block.transform.rotation.y += delta * 0.25;
  }

  if (state.value === 'running' && collected.value === nodes.length) {
    state.value = 'won';
  }
});

onBeforeUnmount(() => {
  scene.dispose();
});

function createSignalNode(id: string, x: number, z: number): SignalNode {
  const baseY = 1;
  return {
    entity: createBox(id, x, baseY, z, 0.68, 0.68, 0.68, { x: 0.3, y: 0.95, z: 1 }),
    collected: false,
    baseY,
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

function resetRange(): void {
  scene.reset();
}
</script>

<template>
  <section class="range-hud">
    <p class="range-hud__mode">FIRST PERSON RANGE</p>
    <h2 class="range-hud__title">{{ label }}</h2>
    <p class="range-hud__meta">{{ Math.ceil(timer) }}s</p>
    <p class="range-hud__hint">WASD/arrows move. Drag or right mouse to look. Sync every signal node.</p>
    <button
      v-if="state !== 'running'"
      class="range-hud__button"
      type="button"
      @click="resetRange"
    >
      Reset range
    </button>
  </section>
</template>

<style scoped>
.range-hud {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
  max-width: 24rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 1rem;
  background: rgb(5 5 8 / 74%);
  color: #eef4ff;
}

.range-hud__mode,
.range-hud__title,
.range-hud__meta,
.range-hud__hint {
  margin: 0;
}

.range-hud__mode {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  opacity: 0.72;
}

.range-hud__title {
  margin-top: 0.25rem;
  font-size: 1.45rem;
  line-height: 1;
}

.range-hud__meta {
  margin-top: 0.35rem;
  font-size: 0.86rem;
  opacity: 0.82;
}

.range-hud__hint {
  margin-top: 0.55rem;
  font-size: 0.8rem;
  opacity: 0.76;
}

.range-hud__button {
  margin-top: 0.8rem;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: 999px;
  background: #eef4ff;
  color: #090b12;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
