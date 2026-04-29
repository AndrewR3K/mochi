<script setup lang="ts">
import { useFrame, useGame } from '@lite3d/engine-vue';
import { createVehicleArcadeController, type Entity } from '@lite3d/game';
import { computed, onBeforeUnmount, shallowRef } from 'vue';

const game = useGame();
const lap = shallowRef(1);
const checkpoint = shallowRef(0);
const lapTimer = shallowRef(0);
const bestLap = shallowRef<number | null>(null);

const car = createBox('car', 0, 0.65, 9.2, 1.2, 1, 2.1, {
  x: 1,
  y: 0.42,
  z: 0.2,
});
const track = [
  createBox('track-a', 0, 0.2, 0, 20, 0.4, 20, { x: 0.06, y: 0.08, z: 0.11 }),
  createBox('track-b', 0, 0.22, 0, 12, 0.45, 12, { x: 0.12, y: 0.16, z: 0.24 }),
  createBox('track-c', 0, 0.24, 0, 5.8, 0.5, 5.8, { x: 0.16, y: 0.2, z: 0.35 }),
];
const gates = [
  createBox('gate-0', 0, 0.9, 9.2, 4, 1.8, 0.25, { x: 0.3, y: 0.95, z: 1 }),
  createBox('gate-1', 9.2, 0.9, 0, 0.25, 1.8, 4, { x: 0.36, y: 0.95, z: 1 }),
  createBox('gate-2', 0, 0.9, -9.2, 4, 1.8, 0.25, { x: 0.36, y: 0.95, z: 1 }),
  createBox('gate-3', -9.2, 0.9, 0, 0.25, 1.8, 4, { x: 0.36, y: 0.95, z: 1 }),
];

const controller = createVehicleArcadeController(game, {
  target: car,
  groundY: 0.65,
  bounds: { minX: -10.6, maxX: 10.6, minZ: -10.6, maxZ: 10.6 },
});

const label = computed(() => {
  const best = bestLap.value ? `${bestLap.value.toFixed(1)}s` : '--';
  return `Lap ${lap.value}  |  Checkpoint ${checkpoint.value + 1}/4  |  Best ${best}`;
});

useFrame(({ delta, elapsed }) => {
  lapTimer.value += delta;

  const currentGate = gates[checkpoint.value];
  if (distance2d(car, currentGate) < 1.75) {
    checkpoint.value += 1;
    if (checkpoint.value >= gates.length) {
      checkpoint.value = 0;
      lap.value += 1;
      bestLap.value = bestLap.value ? Math.min(bestLap.value, lapTimer.value) : lapTimer.value;
      lapTimer.value = 0;
    }
  }

  car.transform.rotation.z = Math.sin(elapsed * 8) * 0.02;

  for (let i = 0; i < gates.length; i += 1) {
    const active = i === checkpoint.value;
    const renderable = gates[i].renderable;
    if (!renderable) continue;
    const color = renderable.material.color;
    color.x = active ? 0.22 : 0.36;
    color.y = active ? 1 : 0.95;
    color.z = active ? 0.72 : 1;
  }
});

onBeforeUnmount(() => {
  controller.dispose();
  game.world.removeEntity(car.id);
  for (const segment of track) game.world.removeEntity(segment.id);
  for (const gate of gates) game.world.removeEntity(gate.id);
});

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

function distance2d(a: Entity, b: Entity): number {
  return Math.hypot(
    a.transform.position.x - b.transform.position.x,
    a.transform.position.z - b.transform.position.z,
  );
}
</script>

<template>
  <section class="hud">
    <p class="hud__mode">VELOCITY CIRCUIT</p>
    <h2 class="hud__title">{{ label }}</h2>
    <p class="hud__hint">Arcade vehicle preset. Hit gates in order.</p>
  </section>
</template>

<style scoped>
.hud {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  max-width: 24rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid rgb(255 255 255 / 14%);
  background: rgb(8 8 14 / 72%);
  color: #eef4ff;
}
.hud__mode,.hud__title,.hud__hint { margin: 0; }
.hud__mode { font-size: 0.72rem; letter-spacing: 0.14em; opacity: 0.75; }
.hud__title { margin-top: 0.3rem; font-size: 1.2rem; line-height: 1.15; }
.hud__hint { margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.76; }
</style>
