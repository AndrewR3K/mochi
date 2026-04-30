<script setup lang="ts">
import {
  createBoxCollider,
  createDebugBoxBounds,
  createDebugTargetMarker,
  createMaterial,
  createThirdPersonOverShoulderController,
  distance2d,
  resolveBoxCollisions,
  resolveGroundHeight,
  type BoxCollider,
  type Entity,
} from '@mochi/gameplay';
import { useGame, useGameScene } from '@mochi/vue';

const props = defineProps<{
  showDebug: boolean;
}>();

const emit = defineEmits<{
  score: [value: number];
  status: [value: string];
}>();

const game = useGame();
const { scene } = useGameScene();
const collected = new Set<string>();

const floor = scene.createEntity({
  id: 'starter-floor',
  transform: {
    position: { x: 0, y: -0.04, z: 0 },
    scale: { x: 18, y: 1, z: 18 },
  },
  renderable: {
    primitive: 'plane',
    material: createMaterial({ x: 0.12, y: 0.18, z: 0.2 }),
  },
});
floor.transform.rotation.x = -Math.PI / 2;

const player = scene.createEntity({
  id: 'starter-player',
  name: 'Player',
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

const blockers = [
  createBlocker('starter-wall-a', -3.2, -0.8, 1.1, 1.8),
  createBlocker('starter-wall-b', 3.4, 1.2, 1.1, 2.2),
  createBlocker('starter-platform', 0.2, -4, 2.4, 1.2, true),
];

const signals = [
  createSignal('starter-signal-a', -5.5, 3.2),
  createSignal('starter-signal-b', 4.8, -2.6),
  createSignal('starter-signal-c', 0.2, -4),
];

scene.add(
  createThirdPersonOverShoulderController(game, {
    target: player,
    resolveGroundHeight: (target) =>
      resolveGroundHeight(target, blockers, {
        baseY: 0.65,
        radius: 0.35,
      }),
    bounds: {
      minX: -8,
      maxX: 8,
      minZ: -8,
      maxZ: 8,
    },
  }),
);

createDebugBoxBounds(scene, blockers, {
  enabled: () => props.showDebug,
});
createDebugTargetMarker(scene, player, {
  enabled: () => props.showDebug,
});

scene.onFrame(({ delta }) => {
  player.transform.rotation.y += delta * 0.8;
  resolveBoxCollisions(player, blockers, {
    radius: 0.35,
  });

  for (const signal of signals) {
    if (collected.has(signal.id) || distance2d(player, signal) > 1) continue;

    collected.add(signal.id);
    signal.transform.scale.x = 0;
    signal.transform.scale.y = 0;
    signal.transform.scale.z = 0;
    emit('score', collected.size);
    emit('status', collected.size === signals.length
      ? 'All signals collected. The starter loop works.'
      : 'Signal collected. Keep moving.');
  }
});

scene.addReset(() => {
  collected.clear();
  emit('score', 0);
  emit('status', 'Collect all 3 signals.');
});

function createBlocker(
  id: string,
  x: number,
  z: number,
  scaleX: number,
  scaleZ: number,
  standable = false,
): BoxCollider {
  const entity = scene.createEntity({
    id,
    tags: ['terrain'],
    transform: {
      position: { x, y: standable ? 0.35 : 0.65, z },
      scale: { x: scaleX, y: standable ? 0.7 : 1.3, z: scaleZ },
    },
    renderable: {
      primitive: 'cube',
      material: createMaterial(standable ? 'neutral' : 'warning'),
    },
  });

  return createBoxCollider(entity, {
    standable,
  });
}

function createSignal(id: string, x: number, z: number): Entity {
  return scene.createEntity({
    id,
    name: 'Signal',
    tags: ['objective'],
    transform: {
      position: { x, y: 0.65, z },
      scale: { x: 0.45, y: 0.45, z: 0.45 },
    },
    renderable: {
      primitive: 'cube',
      material: createMaterial('emissive'),
    },
  });
}
</script>

<template>
  <span class="scene-label" aria-hidden="true" />
</template>

<style scoped>
.scene-label {
  display: none;
}
</style>
