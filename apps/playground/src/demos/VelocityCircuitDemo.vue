<script setup lang="ts">
import { useGame } from '@mochi-labs/vue';
import { createVehicleArcadeController, type Entity } from '@mochi-labs/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import DemoHud from '../components/DemoHud.vue';

interface Wheel {
  entity: Entity;
  front: boolean;
}

interface RoadChunk {
  base: Entity;
  details: Entity[];
}

interface Obstacle {
  entity: Entity;
  lane: number;
  hit: boolean;
}

interface SkidMark {
  entity: Entity;
  life: number;
}

const lanes = [-5.2, -2.6, 0, 2.6, 5.2];
const roadLength = 24;
const roadChunks = 8;
const carVisualZ = 0;
const game = useGame();
const scene = game.createScene();
const score = shallowRef(0);
const lives = shallowRef(3);
const speed = shallowRef(0);
const grip = shallowRef(100);
const state = shallowRef<'running' | 'lost'>('running');

const car = scene.createEntity({
  id: 'dodge-runner',
  transform: { position: { x: 0, y: 0.65, z: 8 } },
});
createCarPart('car-body', 0, 0.02, 0, 1.05, 0.34, 1.72, { x: 1, y: 0.42, z: 0.2 });
createCarPart('car-cockpit', 0, 0.28, -0.14, 0.56, 0.28, 0.58, { x: 0.1, y: 0.15, z: 0.22 });
createCarPart('car-splitter', 0, -0.07, -0.94, 1.14, 0.1, 0.18, { x: 0.04, y: 0.08, z: 0.12 });

const wheels: Wheel[] = [
  createWheel('wheel-front-left', -0.6, -0.58, true),
  createWheel('wheel-front-right', 0.6, -0.58, true),
  createWheel('wheel-back-left', -0.6, 0.6, false),
  createWheel('wheel-back-right', 0.6, 0.6, false),
];

const road = Array.from({ length: roadChunks }, (_, index) =>
  createRoadChunk(`road-${index}`, -index * roadLength),
);
const obstacles: Obstacle[] = Array.from({ length: 10 }, (_, index) =>
  createObstacle(`traffic-${index}`, -70 - index * 22, index + 3),
);
const skidMarks: SkidMark[] = Array.from({ length: 30 }, (_, index) => ({
  entity: createBox(`skid-${index}`, 0, 0.51, 0, 0, 0, 0, { x: 0.01, y: 0.012, z: 0.018 }),
  life: 0,
}));

const controller = createVehicleArcadeController(game, {
  target: car,
  autoThrottle: 0.72,
  groundY: 0.65,
  bounds: { minX: -6.4, maxX: 6.4, minZ: -100000, maxZ: 12 },
  acceleration: 18,
  brakeDeceleration: 26,
  drag: 3.8,
  maxSpeed: 16,
  reverseSpeed: 0,
  turnSpeed: 0.82,
  maxSteerAngle: 0.28,
  steeringResponse: 8.5,
  wheelBase: 3.5,
  lateralGrip: 26,
  rollingResistance: 0.42,
  aerodynamicDrag: 0.035,
  cameraMode: 'forward',
  cameraDistance: 8.6,
  cameraHeight: 4.8,
  cameraLead: -1.4,
  cameraLerp: 9,
  focusHeight: 1.05,
  enabled: () => state.value === 'running',
});
scene.add(controller);

const label = computed(() => {
  if (state.value === 'lost') return `Wrecked  |  Score ${score.value}`;

  return [
    `Score ${score.value}`,
    `${lives.value} lives`,
    `${speed.value.toFixed(1)} m/s`,
    `Grip ${grip.value}%`,
  ].join('  |  ');
});

let wheelSpin = 0;
let skidCooldown = 0;
let nextSkidMark = 0;
let previousSpeed = 0;

scene.onFrame(({ delta, elapsed }) => {
  speed.value = Math.abs(controller.getSpeed());
  grip.value = Math.round(Math.max(0, 100 - Math.abs(controller.getSlipAngle()) * 180));

  if (state.value === 'running') {
    score.value = Math.max(score.value, Math.floor(Math.max(0, -car.transform.position.z) * 4));
  }

  recycleRoad();
  updateObstacles(elapsed);
  updateCarVisuals(delta, elapsed);
  updateSkidMarks(delta);
});

onBeforeUnmount(() => {
  scene.dispose();
});

function updateCarVisuals(delta: number, elapsed: number): void {
  const signedSpeed = controller.getSpeed();
  const lateralSpeed = controller.getLateralSpeed();
  const steerAngle = controller.getSteerAngle();
  const acceleration = delta > 0 ? (signedSpeed - previousSpeed) / delta : 0;
  previousSpeed = signedSpeed;
  wheelSpin += signedSpeed * delta * 4.8;

  car.transform.rotation.x = clamp(-acceleration * 0.008, -0.055, 0.055);
  car.transform.rotation.z = Math.sin(elapsed * 9) * 0.004 - lateralSpeed * 0.012;

  for (const wheel of wheels) {
    wheel.entity.transform.rotation.x = wheelSpin;
    wheel.entity.transform.rotation.y = wheel.front ? steerAngle : 0;
  }

  skidCooldown = Math.max(0, skidCooldown - delta);
  if (speed.value > 7 && Math.abs(lateralSpeed) > 0.95 && skidCooldown === 0) {
    placeSkidMark(-0.72);
    placeSkidMark(0.72);
    skidCooldown = 0.06;
  }
}

function recycleRoad(): void {
  for (const chunk of road) {
    if (chunk.base.transform.position.z > car.transform.position.z + roadLength) {
      chunk.base.transform.position.z -= roadLength * roadChunks;
    }
  }
}

function updateObstacles(elapsed: number): void {
  for (let i = 0; i < obstacles.length; i += 1) {
    const obstacle = obstacles[i];

    if (obstacle.entity.transform.position.z > car.transform.position.z + 10) {
      resetObstacle(obstacle, car.transform.position.z - 180 - i * 12, score.value + i);
    }

    obstacle.entity.transform.rotation.y += 0.35 * Math.sin(elapsed + i) * 0.01;

    if (!obstacle.hit && overlapsCar(obstacle.entity)) {
      obstacle.hit = true;
      lives.value -= 1;
      if (obstacle.entity.renderable) {
        obstacle.entity.renderable.material.color = { x: 1, y: 0.12, z: 0.08 };
      }
      car.transform.position.x *= 0.55;
      if (lives.value <= 0) state.value = 'lost';
    }
  }
}

function resetObstacle(obstacle: Obstacle, z: number, seed: number): void {
  const lane = Math.abs(Math.floor(Math.sin(seed * 12.9898) * 10000)) % lanes.length;
  obstacle.lane = lane;
  obstacle.hit = false;
  obstacle.entity.transform.position.x = lanes[lane];
  obstacle.entity.transform.position.z = z;
  obstacle.entity.transform.scale.x = 1.05 + (seed % 3) * 0.18;
  obstacle.entity.transform.scale.y = 0.95 + (seed % 2) * 0.22;
  obstacle.entity.transform.scale.z = 1.05;
  if (obstacle.entity.renderable) {
    obstacle.entity.renderable.material.color = obstacleColor(seed);
  }
}

function overlapsCar(obstacle: Entity): boolean {
  const dx = Math.abs(car.transform.position.x - obstacle.transform.position.x);
  const dz = Math.abs(car.transform.position.z + carVisualZ - obstacle.transform.position.z);
  return dx < 1.05 && dz < 1.25;
}

function createRoadChunk(id: string, z: number): RoadChunk {
  const base = createBox(id, 0, 0.12, z - roadLength * 0.5, 15.5, 0.24, roadLength, {
    x: 0.055,
    y: 0.065,
    z: 0.08,
  });
  const details: Entity[] = [];

  for (let i = 0; i < 4; i += 1) {
    details.push(createBox(
      `${id}-stripe-${i}`,
      0,
      0.14,
      roadLength * 0.5 - 4 - i * 6,
      0.08,
      0.035,
      1.45,
      { x: 0.08, y: 0.36, z: 0.34 },
      base,
    ));
  }

  details.push(createBox(`${id}-left-rail`, -7.95, 0.3, 0, 0.18, 0.38, roadLength, {
    x: 0.05,
    y: 0.32,
    z: 0.38,
  }, base));
  details.push(createBox(`${id}-right-rail`, 7.95, 0.3, 0, 0.18, 0.38, roadLength, {
    x: 0.05,
    y: 0.32,
    z: 0.38,
  }, base));

  return { base, details };
}

function createObstacle(id: string, z: number, seed: number): Obstacle {
  const lane = seed % lanes.length;
  return {
    entity: createBox(id, lanes[lane], 0.86, z, 1.12, 1.05, 1.05, obstacleColor(seed)),
    lane,
    hit: false,
  };
}

function createWheel(id: string, x: number, z: number, front: boolean): Wheel {
  return {
    entity: scene.createEntity({
      id,
      parent: car,
      transform: {
        position: { x, y: -0.2, z: z + carVisualZ },
        scale: { x: 0.2, y: 0.4, z: 0.4 },
      },
      renderable: {
        primitive: 'cylinder',
        material: { color: { x: 0.025, y: 0.028, z: 0.035 } },
      },
    }),
    front,
  };
}

function placeSkidMark(localX: number): void {
  const mark = skidMarks[nextSkidMark];
  nextSkidMark = (nextSkidMark + 1) % skidMarks.length;

  const world = carLocalPoint(localX, 0.9);
  mark.life = 1;
  mark.entity.transform.position.x = world.x;
  mark.entity.transform.position.y = 0.35;
  mark.entity.transform.position.z = world.z;
  mark.entity.transform.rotation.y = car.transform.rotation.y;
  mark.entity.transform.scale.x = 0.14;
  mark.entity.transform.scale.y = 0.03;
  mark.entity.transform.scale.z = 0.56;
}

function updateSkidMarks(delta: number): void {
  for (const mark of skidMarks) {
    if (mark.life === 0) continue;

    mark.life = Math.max(0, mark.life - delta * 0.5);
    mark.entity.transform.scale.x = 0.14 * mark.life;
    mark.entity.transform.scale.z = 0.56 * mark.life;
  }
}

function createCarPart(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: { x: number; y: number; z: number },
): Entity {
  return createBox(id, x, y, z + carVisualZ, sx, sy, sz, color, car);
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
  parent: Entity | null = null,
): Entity {
  return scene.createEntity({
    id,
    parent,
    transform: { position: { x, y, z }, scale: { x: sx, y: sy, z: sz } },
    renderable: { primitive: 'cube', material: { color } },
  });
}

function carLocalPoint(x: number, z: number): { x: number; z: number } {
  const yaw = car.transform.rotation.y;
  const localZ = z + carVisualZ;
  return {
    x: car.transform.position.x + Math.cos(yaw) * x + Math.sin(yaw) * localZ,
    z: car.transform.position.z + Math.sin(yaw) * x - Math.cos(yaw) * localZ,
  };
}

function obstacleColor(seed: number): { x: number; y: number; z: number } {
  const palette = [
    { x: 0.95, y: 0.22, z: 0.18 },
    { x: 0.18, y: 0.62, z: 1 },
    { x: 0.92, y: 0.82, z: 0.2 },
    { x: 0.55, y: 0.32, z: 1 },
  ];
  return { ...palette[seed % palette.length] };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
</script>

<template>
  <DemoHud
    mode="VELOCITY DODGE"
    :title="label"
    hint="A/D steer. W boosts. S scrubs speed. Keep the car between lanes and dodge traffic."
    position="top-left"
    wide
  />
</template>
