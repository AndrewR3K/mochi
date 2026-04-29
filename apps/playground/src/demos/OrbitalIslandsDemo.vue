<script setup lang="ts">
import { useGame } from '@lite3d/vue';
import {
  createBoxCollider,
  createThirdPersonOrbitController,
  distance2d,
  resolveGroundHeight as resolveColliderGroundHeight,
  type BoxCollider,
  type Entity,
} from '@lite3d/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import DemoHud from '../components/DemoHud.vue';

interface Beacon {
  entity: Entity;
  collected: boolean;
  baseY: number;
}

const game = useGame();
const scene = game.createScene();
const beaconsCollected = shallowRef(0);
const timer = shallowRef(60);
const state = shallowRef<'running' | 'won' | 'lost'>('running');

const player = createBox('island-player', 0, 0.7, 0, 0.85, 1.4, 0.85, {
  x: 0.7,
  y: 0.58,
  z: 1,
});
const platforms: BoxCollider[] = [
  createPlatform('island-start', 0, 0.2, 0, 5.5, 0.4, 5.5, { x: 0.08, y: 0.12, z: 0.2 }),
  createPlatform('island-a', 6.5, 1.2, -3.2, 3.2, 0.4, 3.2, { x: 0.1, y: 0.2, z: 0.38 }),
  createPlatform('island-b', -7.2, 2.1, -5.5, 3.8, 0.4, 3.8, { x: 0.22, y: 0.14, z: 0.4 }),
  createPlatform('island-c', 7.8, 3.1, 5.9, 4.2, 0.4, 4.2, { x: 0.14, y: 0.28, z: 0.5 }),
  createPlatform('island-d', -6.1, 4.4, 7.1, 3.2, 0.4, 3.2, { x: 0.32, y: 0.2, z: 0.56 }),
  createPlatform('island-goal', 0, 5.7, 0.2, 4.5, 0.4, 4.5, { x: 0.38, y: 0.3, z: 0.68 }),
];

const beacons: Beacon[] = [
  createBeacon('beacon-1', 6.5, -3.2, 2.05),
  createBeacon('beacon-2', -7.2, -5.5, 2.95),
  createBeacon('beacon-3', 7.8, 5.9, 3.95),
  createBeacon('beacon-4', -6.1, 7.1, 5.25),
  createBeacon('beacon-5', 0, 0.2, 6.55),
];

const controller = createThirdPersonOrbitController(game, {
  target: player,
  groundY: 0.7,
  bounds: { minX: -12, maxX: 12, minZ: -12, maxZ: 12 },
  enabled: () => state.value === 'running',
  resolveGroundHeight,
});
scene.add(controller);

const label = computed(() => {
  if (state.value === 'won') return 'All beacons synced';
  if (state.value === 'lost') return 'Void drift detected';
  return `${beaconsCollected.value}/5 beacons`;
});

scene.onFrame(({ delta, elapsed }) => {
  if (state.value === 'running') {
    timer.value = Math.max(0, timer.value - delta);
    if (timer.value === 0) state.value = 'lost';
  }

  for (const beacon of beacons) {
    beacon.entity.transform.rotation.y += delta * 2;
    beacon.entity.transform.position.y = beacon.baseY + Math.sin(elapsed * 4) * 0.06;
    const scale = beacon.collected ? 0 : 0.58;
    beacon.entity.transform.scale.x = scale;
    beacon.entity.transform.scale.y = scale;
    beacon.entity.transform.scale.z = scale;

    if (
      state.value === 'running' &&
      !beacon.collected &&
      Math.abs(player.transform.position.y - beacon.entity.transform.position.y) < 1.25 &&
      distance2d(player, beacon.entity) < 1.1
    ) {
      beacon.collected = true;
      beaconsCollected.value += 1;
    }
  }

  if (state.value === 'running' && beaconsCollected.value === beacons.length) {
    state.value = 'won';
  }
});

onBeforeUnmount(() => {
  scene.dispose();
});

function createPlatform(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: { x: number; y: number; z: number },
): BoxCollider {
  const entity = createBox(id, x, y, z, sx, sy, sz, color);
  return createBoxCollider(entity, { standable: true });
}

function createBeacon(id: string, x: number, z: number, y: number): Beacon {
  return {
    entity: createBox(id, x, y, z, 0.58, 0.58, 0.58, { x: 0.38, y: 0.95, z: 1 }),
    collected: false,
    baseY: y,
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

function resolveGroundHeight(): number {
  return resolveColliderGroundHeight(player, platforms, {
    baseY: 0.7,
    snapDistance: 0.6,
  });
}
</script>

<template>
  <DemoHud
    mode="ORBITAL ISLANDS"
    :title="label"
    :meta="`${Math.ceil(timer)}s`"
    hint="WASD + Space/Double-jump. Reach every floating beacon."
    position="top-right"
  />
</template>
