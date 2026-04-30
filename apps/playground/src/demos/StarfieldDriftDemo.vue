<script setup lang="ts">
import { useGame } from '@mochi/vue';
import {
  createSpaceflightArcadeController,
  getSpaceflightForward,
  type Entity,
} from '@mochi/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import DemoHud from '../components/DemoHud.vue';

interface Beacon {
  entity: Entity;
  collected: boolean;
  baseScale: number;
  phase: number;
}

const game = useGame();
const scene = game.createScene();
const beaconsCollected = shallowRef(0);
const missionState = shallowRef<'running' | 'complete'>('running');
const speed = shallowRef(0);
const altitude = shallowRef(0);

const ship = scene.createEntity({
  id: 'drift-runner',
  transform: {
    position: { x: 0, y: 3, z: 10 },
    scale: { x: 0.9, y: 0.35, z: 1.8 },
  },
  renderable: {
    primitive: 'cube',
    material: { color: { x: 0.28, y: 0.95, z: 0.78 } },
  },
});

const nose = createBox('ship-nose', 0, 3, 8.65, 0.38, 0.28, 0.6, {
  x: 0.85,
  y: 1,
  z: 0.74,
});
const leftWing = createBox('left-wing', -0.9, 3, 10.25, 0.9, 0.16, 0.9, {
  x: 0.16,
  y: 0.58,
  z: 1,
});
const rightWing = createBox('right-wing', 0.9, 3, 10.25, 0.9, 0.16, 0.9, {
  x: 0.16,
  y: 0.58,
  z: 1,
});
const engineGlow = createBox('engine-glow', 0, 3, 11.15, 0.55, 0.18, 0.24, {
  x: 0.35,
  y: 0.75,
  z: 1,
});

const beacons: Beacon[] = [
  createBeacon('beacon-1', -7, 2.4, -8, 0.9, 0),
  createBeacon('beacon-2', 6, 6.2, -18, 0.95, 1.2),
  createBeacon('beacon-3', -3, 9.5, -29, 1, 2.4),
  createBeacon('beacon-4', 8.5, 4.8, -41, 1.05, 3.5),
  createBeacon('beacon-5', 0, 7.4, -54, 1.1, 4.4),
];

for (let i = 0; i < 72; i += 1) {
  const lane = (i % 9) - 4;
  const band = Math.floor(i / 9);
  createBox(
    `star-${i}`,
    lane * 4.8 + Math.sin(i * 2.1) * 1.5,
    1 + ((i * 7) % 13),
    -band * 8 - 6 - Math.cos(i) * 2,
    0.08,
    0.08,
    0.08,
    { x: 0.75, y: 0.88, z: 1 },
  );
}

for (let i = 0; i < 10; i += 1) {
  createBox(
    `asteroid-${i}`,
    Math.sin(i * 1.7) * 12,
    1.4 + ((i * 3) % 7),
    -10 - i * 5.8,
    0.9 + (i % 3) * 0.35,
    0.7 + (i % 2) * 0.25,
    0.9 + (i % 4) * 0.28,
    { x: 0.22, y: 0.21, z: 0.28 },
  );
}

const controller = createSpaceflightArcadeController(game, {
  target: ship,
  enabled: () => missionState.value === 'running',
  bounds: { minX: -16, maxX: 16, minY: 0.8, maxY: 14, minZ: -62, maxZ: 14 },
});
scene.add(controller);
scene.addReset(() => {
  beaconsCollected.value = 0;
  missionState.value = 'running';
  controller.reset();

  for (const beacon of beacons) {
    beacon.collected = false;
  }
});

const label = computed(() => {
  const status =
    missionState.value === 'complete'
      ? 'route complete'
      : `${beaconsCollected.value}/${beacons.length} beacons`;
  return `${status}  |  ${speed.value.toFixed(1)} m/s  |  altitude ${altitude.value.toFixed(1)}`;
});

scene.onFrame(({ delta, elapsed }) => {
  speed.value = controller.getSpeed();
  altitude.value = ship.transform.position.y;
  syncShipParts();

  const flame = 0.7 + Math.sin(elapsed * 18) * 0.25 + Math.min(speed.value / 24, 1) * 0.55;
  engineGlow.transform.scale.z = 0.24 * flame;

  for (const beacon of beacons) {
    beacon.entity.transform.rotation.y += delta * 1.8;
    beacon.entity.transform.rotation.x += delta * 0.9;
    beacon.entity.transform.position.y += Math.sin(elapsed * 2.4 + beacon.phase) * 0.002;

    const visibleScale = beacon.collected ? 0 : beacon.baseScale;
    beacon.entity.transform.scale.x = visibleScale;
    beacon.entity.transform.scale.y = visibleScale;
    beacon.entity.transform.scale.z = visibleScale;

    if (!beacon.collected && distance3d(ship, beacon.entity) < 1.7) {
      beacon.collected = true;
      beaconsCollected.value += 1;
      if (beaconsCollected.value === beacons.length) {
        missionState.value = 'complete';
      }
    }
  }
});

onBeforeUnmount(() => {
  scene.dispose();
});

function syncShipParts(): void {
  const forward = getSpaceflightForward(ship);
  const yaw = ship.transform.rotation.y;
  const right = { x: Math.cos(yaw), z: Math.sin(yaw) };

  setPartTransform(nose, forward, right, 1.05, 0);
  setPartTransform(leftWing, forward, right, -0.15, -0.95);
  setPartTransform(rightWing, forward, right, -0.15, 0.95);
  setPartTransform(engineGlow, forward, right, -1.05, 0);
}

function setPartTransform(
  part: Entity,
  forward: { x: number; y: number; z: number },
  right: { x: number; z: number },
  forwardOffset: number,
  rightOffset: number,
): void {
  part.transform.position.x =
    ship.transform.position.x + forward.x * forwardOffset + right.x * rightOffset;
  part.transform.position.y = ship.transform.position.y + forward.y * forwardOffset;
  part.transform.position.z =
    ship.transform.position.z + forward.z * forwardOffset + right.z * rightOffset;
  part.transform.rotation.x = ship.transform.rotation.x;
  part.transform.rotation.y = ship.transform.rotation.y;
  part.transform.rotation.z = ship.transform.rotation.z;
}

function createBeacon(
  id: string,
  x: number,
  y: number,
  z: number,
  baseScale: number,
  phase: number,
): Beacon {
  return {
    entity: createBox(id, x, y, z, baseScale, baseScale, baseScale, {
      x: 0.25,
      y: 0.92,
      z: 1,
    }),
    collected: false,
    baseScale,
    phase,
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
    transform: {
      position: { x, y, z },
      scale: { x: sx, y: sy, z: sz },
    },
    renderable: {
      primitive: 'cube',
      material: { color },
    },
  });
}

function distance3d(a: Entity, b: Entity): number {
  const dx = a.transform.position.x - b.transform.position.x;
  const dy = a.transform.position.y - b.transform.position.y;
  const dz = a.transform.position.z - b.transform.position.z;
  return Math.hypot(dx, dy, dz);
}
</script>

<template>
  <DemoHud
    mode="STARFIELD DRIFT"
    :title="label"
    hint="W thrust. S brake. A/D yaw. R/F pitch. Q/E roll. Space/Shift strafe vertically."
  />
</template>
