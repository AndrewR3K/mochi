import type { Entity, Vec3, World } from '@mochi-labs/core';

import {
  DEFAULT_SPACEFLIGHT_INPUT_BINDINGS,
  isBindingDown,
  type SpaceflightInputBindings,
} from './bindings';
import type { Game } from './game';

export interface SpaceflightControllerOptions {
  target: Entity;
  thrust?: number;
  brakeDeceleration?: number;
  drag?: number;
  maxSpeed?: number;
  strafeSpeed?: number;
  yawSpeed?: number;
  pitchSpeed?: number;
  rollSpeed?: number;
  autoLevelRoll?: number;
  cameraDistance?: number;
  cameraHeight?: number;
  cameraLerp?: number;
  focusDistance?: number;
  input?: Partial<SpaceflightInputBindings>;
  enabled?: () => boolean;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
}

export interface SpaceflightController {
  readonly velocity: Vec3;
  dispose(): void;
  reset(): void;
  getSpeed(): number;
}

export function createSpaceflightController(
  game: Game,
  options: SpaceflightControllerOptions,
): SpaceflightController {
  const target = options.target;
  const thrust = options.thrust ?? 18;
  const brakeDeceleration = options.brakeDeceleration ?? 22;
  const drag = options.drag ?? 0.85;
  const maxSpeed = options.maxSpeed ?? 18;
  const strafeSpeed = options.strafeSpeed ?? 7;
  const yawSpeed = options.yawSpeed ?? 1.6;
  const pitchSpeed = options.pitchSpeed ?? 1.25;
  const rollSpeed = options.rollSpeed ?? 1.8;
  const autoLevelRoll = options.autoLevelRoll ?? 1.4;
  const cameraDistance = options.cameraDistance ?? 10;
  const cameraHeight = options.cameraHeight ?? 2.4;
  const cameraLerp = options.cameraLerp ?? 8;
  const focusDistance = options.focusDistance ?? 5.5;
  const inputBindings = {
    ...DEFAULT_SPACEFLIGHT_INPUT_BINDINGS,
    ...options.input,
  };
  const startPosition = { ...target.transform.position };
  const startRotation = { ...target.transform.rotation };
  const velocity = { x: 0, y: 0, z: 0 };

  const unsubscribe = game.onFrame(({ delta, input, world }) => {
    const canMove = options.enabled?.() ?? true;

    if (canMove) {
      const yaw =
        Number(isBindingDown(input, inputBindings.yawRight)) -
        Number(isBindingDown(input, inputBindings.yawLeft));
      const pitch =
        Number(isBindingDown(input, inputBindings.pitchDown)) -
        Number(isBindingDown(input, inputBindings.pitchUp));
      const roll =
        Number(isBindingDown(input, inputBindings.rollRight)) -
        Number(isBindingDown(input, inputBindings.rollLeft));
      const throttle =
        Number(isBindingDown(input, inputBindings.thrust)) -
        Number(isBindingDown(input, inputBindings.brake));
      const vertical =
        Number(isBindingDown(input, inputBindings.strafeUp)) -
        Number(isBindingDown(input, inputBindings.strafeDown));

      target.transform.rotation.y += yaw * yawSpeed * delta;
      target.transform.rotation.x = clamp(
        target.transform.rotation.x + pitch * pitchSpeed * delta,
        -Math.PI * 0.46,
        Math.PI * 0.46,
      );
      target.transform.rotation.z += roll * rollSpeed * delta;

      if (roll === 0 && autoLevelRoll > 0) {
        target.transform.rotation.z = moveToward(
          target.transform.rotation.z,
          0,
          autoLevelRoll * delta,
        );
      }

      const forward = getForward(target);
      if (throttle > 0) {
        velocity.x += forward.x * thrust * delta;
        velocity.y += forward.y * thrust * delta;
        velocity.z += forward.z * thrust * delta;
      } else if (throttle < 0) {
        velocity.x = moveToward(velocity.x, 0, brakeDeceleration * delta);
        velocity.y = moveToward(velocity.y, 0, brakeDeceleration * delta);
        velocity.z = moveToward(velocity.z, 0, brakeDeceleration * delta);
      }

      velocity.y += vertical * strafeSpeed * delta;
      clampVelocity(velocity, maxSpeed);
    }

    velocity.x = applyDrag(velocity.x, drag, delta);
    velocity.y = applyDrag(velocity.y, drag, delta);
    velocity.z = applyDrag(velocity.z, drag, delta);

    target.transform.position.x += velocity.x * delta;
    target.transform.position.y += velocity.y * delta;
    target.transform.position.z += velocity.z * delta;
    clampToBounds();
    updateCamera(world, delta);
  });

  return {
    velocity,
    dispose: unsubscribe,
    reset() {
      velocity.x = 0;
      velocity.y = 0;
      velocity.z = 0;
      target.transform.position.x = startPosition.x;
      target.transform.position.y = startPosition.y;
      target.transform.position.z = startPosition.z;
      target.transform.rotation.x = startRotation.x;
      target.transform.rotation.y = startRotation.y;
      target.transform.rotation.z = startRotation.z;
    },
    getSpeed() {
      return Math.hypot(velocity.x, velocity.y, velocity.z);
    },
  };

  function clampToBounds(): void {
    if (!options.bounds) return;

    target.transform.position.x = clamp(
      target.transform.position.x,
      options.bounds.minX,
      options.bounds.maxX,
    );
    target.transform.position.y = clamp(
      target.transform.position.y,
      options.bounds.minY,
      options.bounds.maxY,
    );
    target.transform.position.z = clamp(
      target.transform.position.z,
      options.bounds.minZ,
      options.bounds.maxZ,
    );
  }

  function updateCamera(world: World, delta: number): void {
    const forward = getForward(target);
    const focus = {
      x: target.transform.position.x + forward.x * focusDistance,
      y: target.transform.position.y + forward.y * focusDistance,
      z: target.transform.position.z + forward.z * focusDistance,
    };
    const desired = {
      x: target.transform.position.x - forward.x * cameraDistance,
      y: target.transform.position.y - forward.y * cameraDistance + cameraHeight,
      z: target.transform.position.z - forward.z * cameraDistance,
    };
    const amount = 1 - Math.exp(-cameraLerp * delta);

    world.camera.position.x += (desired.x - world.camera.position.x) * amount;
    world.camera.position.y += (desired.y - world.camera.position.y) * amount;
    world.camera.position.z += (desired.z - world.camera.position.z) * amount;
    world.camera.target.x += (focus.x - world.camera.target.x) * amount;
    world.camera.target.y += (focus.y - world.camera.target.y) * amount;
    world.camera.target.z += (focus.z - world.camera.target.z) * amount;
  }
}

export function getSpaceflightForward(entity: Entity): Vec3 {
  return getForward(entity);
}

function getForward(entity: Entity): Vec3 {
  const pitch = entity.transform.rotation.x;
  const yaw = entity.transform.rotation.y;
  const cosPitch = Math.cos(pitch);

  return {
    x: Math.sin(yaw) * cosPitch,
    y: -Math.sin(pitch),
    z: -Math.cos(yaw) * cosPitch,
  };
}

function applyDrag(value: number, drag: number, delta: number): number {
  return value * Math.max(0, 1 - drag * delta);
}

function clampVelocity(velocity: Vec3, maxSpeed: number): void {
  const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
  if (speed <= maxSpeed || speed === 0) return;

  const scale = maxSpeed / speed;
  velocity.x *= scale;
  velocity.y *= scale;
  velocity.z *= scale;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moveToward(value: number, target: number, amount: number): number {
  if (value < target) return Math.min(target, value + amount);
  if (value > target) return Math.max(target, value - amount);
  return target;
}
