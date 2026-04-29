<script setup lang="ts">
import { useGame } from '@lite3d/vue';
import { createVehicleArcadeController, distance2d, type Entity } from '@lite3d/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';

interface Gate {
  entity: Entity;
  color: { x: number; y: number; z: number };
}

const game = useGame();
const scene = game.createScene();
const lap = shallowRef(1);
const checkpoint = shallowRef(0);
const lapTimer = shallowRef(0);
const bestLap = shallowRef<number | null>(null);
const speed = shallowRef(0);

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
  createGate('gate-0', 0, 0.9, 9.2, 4, 1.8, 0.25, { x: 0.3, y: 0.95, z: 1 }),
  createGate('gate-1', 9.2, 0.9, 0, 0.25, 1.8, 4, { x: 0.36, y: 0.95, z: 1 }),
  createGate('gate-2', 0, 0.9, -9.2, 4, 1.8, 0.25, { x: 0.36, y: 0.95, z: 1 }),
  createGate('gate-3', -9.2, 0.9, 0, 0.25, 1.8, 4, { x: 0.36, y: 0.95, z: 1 }),
];

const controller = createVehicleArcadeController(game, {
  target: car,
  groundY: 0.65,
  bounds: { minX: -10.6, maxX: 10.6, minZ: -10.6, maxZ: 10.6 },
  acceleration: 21,
  brakeDeceleration: 30,
  drag: 5.2,
  maxSpeed: 13.5,
  reverseSpeed: 4.2,
  turnSpeed: 2.25,
});
scene.add(controller);

const label = computed(() => {
  const best = bestLap.value ? `${bestLap.value.toFixed(1)}s` : '--';
  return `Lap ${lap.value}  |  Checkpoint ${checkpoint.value + 1}/4  |  ${speed.value.toFixed(1)} m/s  |  Best ${best}`;
});

scene.onFrame(({ delta, elapsed }) => {
  lapTimer.value += delta;
  speed.value = Math.abs(controller.getSpeed());

  const currentGate = gates[checkpoint.value].entity;
  if (distance2d(car, currentGate) < 1.75) {
    checkpoint.value += 1;
    if (checkpoint.value >= gates.length) {
      checkpoint.value = 0;
      lap.value += 1;
      bestLap.value = bestLap.value ? Math.min(bestLap.value, lapTimer.value) : lapTimer.value;
      lapTimer.value = 0;
    }
  }

  car.transform.rotation.z = Math.sin(elapsed * 8) * 0.01 - controller.getSpeed() * 0.006;

  for (let i = 0; i < gates.length; i += 1) {
    const active = i === checkpoint.value;
    const color = gates[i].color;
    color.x = active ? 0.22 : 0.36;
    color.y = active ? 1 : 0.95;
    color.z = active ? 0.72 : 1;
  }
});

onBeforeUnmount(() => {
  scene.dispose();
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
  return scene.createEntity({
    id,
    transform: { position: { x, y, z }, scale: { x: sx, y: sy, z: sz } },
    renderable: { primitive: 'cube', material: { color } },
  });
}

function createGate(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: { x: number; y: number; z: number },
): Gate {
  return {
    entity: createBox(id, x, y, z, sx, sy, sz, color),
    color,
  };
}

</script>

<template>
  <section class="hud">
    <p class="hud__mode">VELOCITY CIRCUIT</p>
    <h2 class="hud__title">{{ label }}</h2>
    <p class="hud__hint">W/S throttle and brake. A/D steer through each gate in order.</p>
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
