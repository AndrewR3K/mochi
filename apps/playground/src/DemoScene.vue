<script setup lang="ts">
import { useFrame, useGame } from '@lite3d/engine-vue';
import { createThirdPersonOverShoulderController, type Entity } from '@lite3d/game';
import { computed, onBeforeUnmount, shallowRef } from 'vue';

interface Core {
  entity: Entity;
  collected: boolean;
  baseY: number;
  baseScale: number;
}

interface Sentry {
  entity: Entity;
  originX: number;
  originZ: number;
  axis: 'x' | 'z';
  phase: number;
}

interface Obstacle {
  entity: Entity;
  halfX: number;
  halfZ: number;
  passY: number;
  topY: number;
  standable: boolean;
}

const game = useGame();
const fps = shallowRef(0);
const score = shallowRef(0);
const shield = shallowRef(100);
const missionTime = shallowRef(75);
const missionState = shallowRef<'running' | 'won' | 'lost'>('running');
const resultTitle = computed(() =>
  missionState.value === 'won' ? 'MISSION COMPLETE' : 'MISSION FAILED',
);
const resultBody = computed(() => {
  if (missionState.value === 'won') {
    return 'You secured every core and reached the extraction gate.';
  }

  if (shield.value <= 0) {
    return 'Your shield broke after too many sentry hits.';
  }

  return 'The timer expired before extraction.';
});
const statusLabel = computed(() => {
  if (missionState.value === 'won') return 'Extraction complete';
  if (missionState.value === 'lost') return 'Signal lost';
  return `${score.value}/6 cores secured`;
});

const ground = game.world.createEntity({
  id: 'ground',
  transform: {
    scale: { x: 24, y: 1, z: 24 },
  },
  renderable: {
    primitive: 'plane',
    material: {
      color: { x: 0.1, y: 0.1, z: 0.14 },
    },
  },
});

const player = game.world.createEntity({
  id: 'player',
  transform: {
    position: { x: 0, y: 0.65, z: 0 },
    scale: { x: 0.9, y: 1.3, z: 0.9 },
  },
  renderable: {
    primitive: 'cube',
    material: {
      color: { x: 0.42, y: 0.61, z: 1 },
    },
  },
});

const gateColor = {
  x: 0.2,
  y: 0.9,
  z: 1,
};
const gate = createBox('gate', 0, 1.6, -10.2, 4.2, 3.2, 0.45, gateColor);
const obstacles: Obstacle[] = [
  createObstacle('north-wall', 0, 0.5, -12, 24, 1, 0.45, Infinity, false, { x: 0.1, y: 0.16, z: 0.22 }),
  createObstacle('south-wall', 0, 0.5, 12, 24, 1, 0.45, Infinity, false, { x: 0.1, y: 0.16, z: 0.22 }),
  createObstacle('west-wall', -12, 0.5, 0, 0.45, 1, 24, Infinity, false, { x: 0.1, y: 0.16, z: 0.22 }),
  createObstacle('east-wall', 12, 0.5, 0, 0.45, 1, 24, Infinity, false, { x: 0.1, y: 0.16, z: 0.22 }),
  createObstacle('tower-a', -7, 1.4, -6, 1.6, 2.8, 1.6, Infinity, true, { x: 0.18, y: 0.2, z: 0.35 }),
  createObstacle('tower-b', 6.5, 1.1, 5.5, 1.8, 2.2, 1.8, Infinity, true, { x: 0.18, y: 0.2, z: 0.35 }),
  createObstacle('ramp-marker', 4, 0.35, -4, 3.5, 0.7, 1, 1.25, true, { x: 0.42, y: 0.32, z: 0.9 }),
  createObstacle('hurdle-a', -2.5, 0.45, -8.2, 3.2, 0.9, 0.35, 1.2, true, { x: 0.82, y: 0.42, z: 1 }),
  createObstacle('hurdle-b', 6.7, 0.45, -4.1, 0.35, 0.9, 3.2, 1.2, true, { x: 0.82, y: 0.42, z: 1 }),
  createObstacle('hurdle-c', -7.4, 0.45, 2.5, 0.35, 0.9, 4.2, 1.2, true, { x: 0.82, y: 0.42, z: 1 }),
  createObstacle('divider-a', 1.2, 0.28, 5.4, 5, 0.55, 0.28, 1.05, true, { x: 0.28, y: 0.36, z: 0.7 }),
  createObstacle('divider-b', -3.8, 0.28, 8.3, 3.8, 0.55, 0.28, 1.05, true, { x: 0.28, y: 0.36, z: 0.7 }),
];
const cores: Core[] = [
  createCore('core-1', -7, -8),
  createCore('core-2', -3, -3),
  createCore('core-3', 4, -7),
  createCore('core-4', 8, -1),
  createCore('core-5', -6, 6),
  createCore('core-6', 5, 7),
];
const sentries: Sentry[] = [
  {
    entity: createBox('sentry-1', -1, 0.45, -6, 1, 0.9, 1, { x: 1, y: 0.16, z: 0.24 }),
    originX: -1,
    originZ: -6,
    axis: 'x',
    phase: 0,
  },
  {
    entity: createBox('sentry-2', 6, 0.45, 3, 1, 0.9, 1, { x: 1, y: 0.16, z: 0.24 }),
    originX: 6,
    originZ: 3,
    axis: 'z',
    phase: 1.9,
  },
  {
    entity: createBox('sentry-3', -6, 0.45, 5.7, 1, 0.9, 1, { x: 1, y: 0.16, z: 0.24 }),
    originX: -6,
    originZ: 5.7,
    axis: 'x',
    phase: 3.1,
  },
];

const controller = createThirdPersonOverShoulderController(game, {
  target: player,
  groundY: 0.65,
  pitch: 0.2,
  enabled: () => missionState.value === 'running',
  resolveGroundHeight,
  bounds: {
    minX: -11.3,
    maxX: 11.3,
    minZ: -11.3,
    maxZ: 11.3,
  },
});

useFrame(({ delta, elapsed }) => {
  if (missionState.value === 'running') {
    missionTime.value = Math.max(0, missionTime.value - delta);
    if (missionTime.value <= 0 || shield.value <= 0) {
      missionState.value = 'lost';
    }
  }

  const pulse = 0.15 + Math.sin(elapsed * 5) * 0.05;
  for (const core of cores) {
    core.entity.transform.rotation.y += delta * 2.2;
    core.entity.transform.position.y = core.baseY + pulse;
    const scale = core.collected ? 0 : core.baseScale;
    core.entity.transform.scale.x = scale;
    core.entity.transform.scale.y = scale;
    core.entity.transform.scale.z = scale;
    if (
      missionState.value === 'running' &&
      !core.collected &&
      distance2d(player, core.entity) < 1.1
    ) {
      core.collected = true;
      score.value += 1;
    }
  }

  for (const sentry of sentries) {
    const sweep = Math.sin(elapsed * 1.5 + sentry.phase) * 4.2;
    const nextX = sentry.axis === 'x' ? sentry.originX + sweep : sentry.entity.transform.position.x;
    const nextZ = sentry.axis === 'z' ? sentry.originZ + sweep : sentry.entity.transform.position.z;
    moveSentryWithCollision(sentry, nextX, nextZ);
    sentry.entity.transform.rotation.y += delta * 1.5;

    const playerAbove = player.transform.position.y > sentry.entity.transform.position.y + 0.9;
    if (
      missionState.value === 'running' &&
      !playerAbove &&
      distance2d(player, sentry.entity) < 1.25
    ) {
      shield.value = Math.max(0, shield.value - delta * 32);
    }
  }

  if (missionState.value === 'running') {
    resolveObstacleCollisions();
  }

  const open = score.value === cores.length;
  gateColor.x = open ? 0.25 : 0.18;
  gateColor.y = open ? 1 : 0.35;
  gateColor.z = open ? 0.8 : 0.42;

  if (
    missionState.value === 'running' &&
    open &&
    distance2d(player, gate) < 2.4
  ) {
    missionState.value = 'won';
  }

  fps.value = Math.round(game.stats.fps);
});

onBeforeUnmount(() => {
  controller.dispose();
  game.world.removeEntity(ground.id);
  game.world.removeEntity(player.id);
  game.world.removeEntity(gate.id);
  for (const obstacle of obstacles) game.world.removeEntity(obstacle.entity.id);
  for (const core of cores) game.world.removeEntity(core.entity.id);
  for (const sentry of sentries) game.world.removeEntity(sentry.entity.id);
});

function createCore(id: string, x: number, z: number): Core {
  const baseY = 0.95;
  const baseScale = 0.65;
  const entity = createBox(id, x, baseY, z, baseScale, baseScale, baseScale, {
    x: 0.3,
    y: 0.95,
    z: 1,
  });

  return {
    entity,
    collected: false,
    baseY,
    baseScale,
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

function createObstacle(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  passY: number,
  standable: boolean,
  color: { x: number; y: number; z: number },
): Obstacle {
  return {
    entity: createBox(id, x, y, z, sx, sy, sz, color),
    halfX: sx / 2,
    halfZ: sz / 2,
    passY,
    topY: y + sy / 2 + 0.001,
    standable,
  };
}

function resolveObstacleCollisions(): void {
  const radius = Math.min(player.transform.scale.x, player.transform.scale.z) * 0.5;

  for (const obstacle of obstacles) {
    if (player.transform.position.y > obstacle.passY) continue;

    const dx = player.transform.position.x - obstacle.entity.transform.position.x;
    const dz = player.transform.position.z - obstacle.entity.transform.position.z;
    const overlapX = obstacle.halfX + radius - Math.abs(dx);
    const overlapZ = obstacle.halfZ + radius - Math.abs(dz);

    if (overlapX <= 0 || overlapZ <= 0) continue;

    if (obstacle.standable) {
      const playerHalfHeight = player.transform.scale.y * 0.5;
      const standingCenterY = obstacle.topY + playerHalfHeight;
      if (player.transform.position.y >= standingCenterY - 0.14) continue;
    }

    if (overlapX < overlapZ) {
      player.transform.position.x += Math.sign(dx || 1) * overlapX;
    } else {
      player.transform.position.z += Math.sign(dz || 1) * overlapZ;
    }
  }
}

function moveSentryWithCollision(sentry: Sentry, targetX: number, targetZ: number): void {
  const startX = sentry.entity.transform.position.x;
  const startZ = sentry.entity.transform.position.z;
  const dx = targetX - startX;
  const dz = targetZ - startZ;
  const distance = Math.hypot(dx, dz);
  const stepDistance = 0.12;
  const steps = Math.max(1, Math.ceil(distance / stepDistance));

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const nextX = startX + dx * t;
    const nextZ = startZ + dz * t;
    if (isSentryOverlappingObstacle(sentry, nextX, nextZ)) return;
    sentry.entity.transform.position.x = nextX;
    sentry.entity.transform.position.z = nextZ;
  }
}

function isSentryOverlappingObstacle(
  sentry: Sentry,
  x: number,
  z: number,
): boolean {
  const radius = Math.min(sentry.entity.transform.scale.x, sentry.entity.transform.scale.z) * 0.5;

  for (const obstacle of obstacles) {
    const dx = x - obstacle.entity.transform.position.x;
    const dz = z - obstacle.entity.transform.position.z;
    const overlapX = obstacle.halfX + radius - Math.abs(dx);
    const overlapZ = obstacle.halfZ + radius - Math.abs(dz);
    if (overlapX > 0 && overlapZ > 0) return true;
  }

  return false;
}

function resolveGroundHeight(): number {
  const baseGround = 0.65;
  const footRadius = Math.min(player.transform.scale.x, player.transform.scale.z) * 0.5;
  const playerHalfHeight = player.transform.scale.y * 0.5;
  let height = baseGround;

  for (const obstacle of obstacles) {
    if (!obstacle.standable) continue;
    const dx = Math.abs(player.transform.position.x - obstacle.entity.transform.position.x);
    const dz = Math.abs(player.transform.position.z - obstacle.entity.transform.position.z);
    const overlapX = obstacle.halfX + footRadius - dx;
    const overlapZ = obstacle.halfZ + footRadius - dz;
    if (overlapX <= 0 || overlapZ <= 0) continue;
    const standingCenterY = obstacle.topY + playerHalfHeight;
    if (player.transform.position.y < standingCenterY - 0.55) continue;
    height = Math.max(height, standingCenterY);
  }

  return height;
}

function distance2d(a: Entity, b: Entity): number {
  return Math.hypot(
    a.transform.position.x - b.transform.position.x,
    a.transform.position.z - b.transform.position.z,
  );
}

function resetRun(): void {
  score.value = 0;
  shield.value = 100;
  missionTime.value = 75;
  missionState.value = 'running';
  player.transform.position.x = 0;
  player.transform.position.y = 0.65;
  player.transform.position.z = 0;
  player.transform.rotation.y = 0;
  controller.reset();

  for (const core of cores) {
    core.collected = false;
  }
}
</script>

<template>
  <div class="demo-overlay">
    <section class="mission" aria-label="Mission status">
      <p class="mission__eyebrow">NIGHTFALL / TRAINING RUN</p>
      <h2 class="mission__title">{{ statusLabel }}</h2>
      <div class="mission__stats">
        <span>{{ Math.ceil(missionTime) }}s</span>
        <span>{{ Math.ceil(shield) }} shield</span>
        <span>{{ fps }} fps</span>
      </div>
      <p class="mission__hint">
        WASD to move. Shift to sprint. Space to double-jump. Drag mouse to orbit.
      </p>
    </section>

    <section v-if="missionState !== 'running'" class="result" aria-live="polite">
      <p class="result__eyebrow">
        {{ resultTitle }}
      </p>
      <h2 class="result__title">
        {{ missionState === 'won' ? 'Extraction gate reached.' : 'Run terminated.' }}
      </h2>
      <p class="result__body">
        {{ resultBody }}
      </p>
      <button class="result__button" type="button" @click="resetRun">
        Run it again
      </button>
    </section>
  </div>
</template>

<style scoped>
.demo-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mission {
  position: absolute;
  top: 1rem;
  left: 1rem;
  max-width: 24rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 1rem;
  background: rgb(5 5 8 / 72%);
  color: #f4f7ff;
  backdrop-filter: blur(12px);
  pointer-events: none;
}

.mission__eyebrow,
.mission__title,
.mission__hint,
.result__eyebrow,
.result__title,
.result__body {
  margin: 0;
}

.mission__eyebrow,
.result__eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  opacity: 0.7;
}

.mission__title {
  margin-top: 0.25rem;
  font-size: clamp(1.4rem, 3vw, 2.35rem);
  line-height: 0.95;
  font-weight: 700;
}

.mission__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.9rem;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.mission__stats span {
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 10%);
}

.mission__hint {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.result {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  max-width: 22rem;
  padding: 1.1rem;
  border-radius: 1.1rem;
  background: rgb(244 247 255 / 90%);
  color: #090b12;
  pointer-events: auto;
}

.result__title {
  margin-top: 0.25rem;
  font-size: 1.6rem;
  line-height: 1;
}

.result__body {
  margin-top: 0.65rem;
  font-size: 0.88rem;
  opacity: 0.75;
}

.result__button {
  margin-top: 1rem;
  padding: 0.65rem 0.85rem;
  border: 0;
  border-radius: 999px;
  background: #090b12;
  color: #f4f7ff;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
