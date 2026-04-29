<script setup lang="ts">
import { useFrame, useGame } from '@lite3d/engine-vue';
import { createThirdPersonOrbitController, type Entity } from '@lite3d/game';
import { computed, onBeforeUnmount, shallowRef } from 'vue';

interface Beacon {
  entity: Entity;
  collected: boolean;
  baseY: number;
}

interface Platform {
  entity: Entity;
  halfX: number;
  halfZ: number;
  topY: number;
}

const game = useGame();
const beaconsCollected = shallowRef(0);
const timer = shallowRef(60);
const state = shallowRef<'running' | 'won' | 'lost'>('running');

const player = createBox('island-player', 0, 0.7, 0, 0.85, 1.4, 0.85, {
  x: 0.7,
  y: 0.58,
  z: 1,
});
const platforms: Platform[] = [
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

const label = computed(() => {
  if (state.value === 'won') return 'All beacons synced';
  if (state.value === 'lost') return 'Void drift detected';
  return `${beaconsCollected.value}/5 beacons`;
});

useFrame(({ delta, elapsed }) => {
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
  controller.dispose();
  game.world.removeEntity(player.id);
  for (const platform of platforms) game.world.removeEntity(platform.entity.id);
  for (const beacon of beacons) game.world.removeEntity(beacon.entity.id);
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
): Platform {
  const entity = createBox(id, x, y, z, sx, sy, sz, color);
  return { entity, halfX: sx / 2, halfZ: sz / 2, topY: y + sy / 2 + 0.001 };
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
  return game.world.createEntity({
    id,
    transform: { position: { x, y, z }, scale: { x: sx, y: sy, z: sz } },
    renderable: { primitive: 'cube', material: { color } },
  });
}

function resolveGroundHeight(): number {
  const base = 0.7;
  const radius = Math.min(player.transform.scale.x, player.transform.scale.z) * 0.5;
  const halfHeight = player.transform.scale.y * 0.5;
  let ground = base;

  for (const platform of platforms) {
    const dx = Math.abs(player.transform.position.x - platform.entity.transform.position.x);
    const dz = Math.abs(player.transform.position.z - platform.entity.transform.position.z);
    if (platform.halfX + radius - dx <= 0 || platform.halfZ + radius - dz <= 0) continue;
    const stand = platform.topY + halfHeight;
    if (player.transform.position.y < stand - 0.6) continue;
    ground = Math.max(ground, stand);
  }

  return ground;
}

function distance2d(a: Entity, b: Entity): number {
  return Math.hypot(
    a.transform.position.x - b.transform.position.x,
    a.transform.position.z - b.transform.position.z,
  );
}
</script>

<template>
  <section class="hud">
    <p class="hud__mode">ORBITAL ISLANDS</p>
    <h2 class="hud__title">{{ label }}</h2>
    <p class="hud__meta">{{ Math.ceil(timer) }}s</p>
    <p class="hud__hint">WASD + Space/Double-jump. Reach every floating beacon.</p>
  </section>
</template>

<style scoped>
.hud {
  position: absolute;
  right: 1rem;
  top: 4rem;
  max-width: 21rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid rgb(255 255 255 / 14%);
  background: rgb(8 8 14 / 72%);
  color: #eef4ff;
}
.hud__mode,.hud__title,.hud__meta,.hud__hint { margin: 0; }
.hud__mode { font-size: 0.72rem; letter-spacing: 0.14em; opacity: 0.75; }
.hud__title { margin-top: 0.3rem; font-size: 1.45rem; }
.hud__meta { margin-top: 0.35rem; font-size: 0.88rem; opacity: 0.82; }
.hud__hint { margin-top: 0.55rem; font-size: 0.8rem; opacity: 0.75; }
</style>
