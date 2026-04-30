import type { Entity, World } from '@mochi/core';

import {
  DEFAULT_VEHICLE_INPUT_BINDINGS,
  isBindingDown,
  type VehicleInputBindings,
} from './bindings';
import type { Game } from './game';

export interface VehicleControllerOptions {
  target: Entity;
  acceleration?: number;
  brakeDeceleration?: number;
  drag?: number;
  maxSpeed?: number;
  reverseSpeed?: number;
  turnSpeed?: number;
  cameraDistance?: number;
  cameraHeight?: number;
  cameraLerp?: number;
  focusHeight?: number;
  groundY?: number;
  input?: Partial<VehicleInputBindings>;
  enabled?: () => boolean;
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export interface VehicleController {
  dispose(): void;
  reset(): void;
  getSpeed(): number;
}

export function createVehicleController(
  game: Game,
  options: VehicleControllerOptions,
): VehicleController {
  const target = options.target;
  const acceleration = options.acceleration ?? 18;
  const brakeDeceleration = options.brakeDeceleration ?? 26;
  const drag = options.drag ?? 5.5;
  const maxSpeed = options.maxSpeed ?? 12;
  const reverseSpeed = options.reverseSpeed ?? 4.5;
  const turnSpeed = options.turnSpeed ?? 1.9;
  const cameraDistance = options.cameraDistance ?? 9.4;
  const cameraHeight = options.cameraHeight ?? 3;
  const cameraLerp = options.cameraLerp ?? 10;
  const focusHeight = options.focusHeight ?? 0.8;
  const groundY = options.groundY ?? target.transform.position.y;
  const inputBindings = {
    ...DEFAULT_VEHICLE_INPUT_BINDINGS,
    ...options.input,
  };
  const startX = target.transform.position.x;
  const startY = target.transform.position.y;
  const startZ = target.transform.position.z;
  const startYaw = target.transform.rotation.y;
  let speed = 0;

  const unsubscribe = game.onFrame(({ delta, input, world }) => {
    const canMove = options.enabled?.() ?? true;
    const throttle =
      Number(isBindingDown(input, inputBindings.forward)) -
      Number(isBindingDown(input, inputBindings.backward));
    const steer =
      Number(isBindingDown(input, inputBindings.right)) -
      Number(isBindingDown(input, inputBindings.left));

    if (canMove) {
      if (throttle > 0) {
        speed = Math.min(maxSpeed, speed + acceleration * delta);
      } else if (throttle < 0) {
        speed = Math.max(-reverseSpeed, speed - brakeDeceleration * delta);
      } else {
        speed = moveToward(speed, 0, drag * delta);
      }

      const steerScale = Math.min(1, Math.abs(speed) / (maxSpeed * 0.35));
      target.transform.rotation.y += steer * turnSpeed * steerScale * Math.sign(speed || 1) * delta;
      target.transform.position.x += Math.sin(target.transform.rotation.y) * speed * delta;
      target.transform.position.z -= Math.cos(target.transform.rotation.y) * speed * delta;
    } else {
      speed = moveToward(speed, 0, brakeDeceleration * delta);
    }

    target.transform.position.y = groundY;
    clampToBounds();
    updateCamera(world, delta);
  });

  return {
    dispose: unsubscribe,
    reset() {
      speed = 0;
      target.transform.position.x = startX;
      target.transform.position.y = startY;
      target.transform.position.z = startZ;
      target.transform.rotation.y = startYaw;
    },
    getSpeed() {
      return speed;
    },
  };

  function clampToBounds(): void {
    if (!options.bounds) return;

    target.transform.position.x = clamp(
      target.transform.position.x,
      options.bounds.minX,
      options.bounds.maxX,
    );
    target.transform.position.z = clamp(
      target.transform.position.z,
      options.bounds.minZ,
      options.bounds.maxZ,
    );
  }

  function updateCamera(world: World, delta: number): void {
    const forwardX = Math.sin(target.transform.rotation.y);
    const forwardZ = -Math.cos(target.transform.rotation.y);
    const focus = {
      x: target.transform.position.x,
      y: target.transform.position.y + focusHeight,
      z: target.transform.position.z,
    };
    const desired = {
      x: focus.x - forwardX * cameraDistance,
      y: focus.y + cameraHeight,
      z: focus.z - forwardZ * cameraDistance,
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moveToward(value: number, target: number, amount: number): number {
  if (value < target) return Math.min(target, value + amount);
  if (value > target) return Math.max(target, value - amount);
  return target;
}
