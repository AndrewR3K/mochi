import type { Entity, World } from '@mochi-labs/core';

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
  autoThrottle?: number;
  drag?: number;
  maxSpeed?: number;
  reverseSpeed?: number;
  turnSpeed?: number;
  maxSteerAngle?: number;
  steeringResponse?: number;
  wheelBase?: number;
  lateralGrip?: number;
  rollingResistance?: number;
  aerodynamicDrag?: number;
  cameraDistance?: number;
  cameraHeight?: number;
  cameraLerp?: number;
  cameraMode?: 'chase' | 'forward';
  cameraLead?: number;
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
  getSteerAngle(): number;
  getLateralSpeed(): number;
  getSlipAngle(): number;
}

export function createVehicleController(
  game: Game,
  options: VehicleControllerOptions,
): VehicleController {
  const target = options.target;
  const acceleration = options.acceleration ?? 18;
  const brakeDeceleration = options.brakeDeceleration ?? 26;
  const autoThrottle = options.autoThrottle ?? 0;
  const drag = options.drag ?? 5.5;
  const maxSpeed = options.maxSpeed ?? 12;
  const reverseSpeed = options.reverseSpeed ?? 4.5;
  const turnSpeed = options.turnSpeed ?? 1.9;
  const maxSteerAngle = options.maxSteerAngle ?? 0.52;
  const steeringResponse = options.steeringResponse ?? 8;
  const wheelBase = options.wheelBase ?? 2.7;
  const lateralGrip = options.lateralGrip ?? 7.5;
  const rollingResistance = options.rollingResistance ?? 1.2;
  const aerodynamicDrag = options.aerodynamicDrag ?? 0.08;
  const cameraDistance = options.cameraDistance ?? 9.4;
  const cameraHeight = options.cameraHeight ?? 3;
  const cameraLerp = options.cameraLerp ?? 10;
  const cameraMode = options.cameraMode ?? 'chase';
  const cameraLead = options.cameraLead ?? 3.2;
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
  let steerAngle = 0;
  let cameraYaw = startYaw;
  let velocityX = 0;
  let velocityZ = 0;
  let lateralSpeed = 0;
  let slipAngle = 0;

  const unsubscribe = game.onFrame(({ delta, input, world }) => {
    const step = Math.min(delta, 1 / 30);
    const canMove = options.enabled?.() ?? true;
    const manualThrottle =
      Number(isBindingDown(input, inputBindings.forward)) -
      Number(isBindingDown(input, inputBindings.backward));
    const throttle = clamp(autoThrottle + manualThrottle, -1, 1);
    const steer =
      Number(isBindingDown(input, inputBindings.right)) -
      Number(isBindingDown(input, inputBindings.left));

    if (canMove) {
      const steerTarget = steer * maxSteerAngle;
      const steerAmount = 1 - Math.exp(-steeringResponse * step);
      steerAngle += (steerTarget - steerAngle) * steerAmount;
    } else {
      steerAngle = moveToward(steerAngle, 0, steeringResponse * step);
    }

    integrateVehicle(throttle, canMove, step);
    target.transform.position.y = groundY;
    clampToBounds();
    updateCamera(world, step);
  });

  return {
    dispose: unsubscribe,
    reset() {
      speed = 0;
      steerAngle = 0;
      cameraYaw = startYaw;
      velocityX = 0;
      velocityZ = 0;
      lateralSpeed = 0;
      slipAngle = 0;
      target.transform.position.x = startX;
      target.transform.position.y = startY;
      target.transform.position.z = startZ;
      target.transform.rotation.y = startYaw;
    },
    getSpeed() {
      return speed;
    },
    getSteerAngle() {
      return steerAngle;
    },
    getLateralSpeed() {
      return lateralSpeed;
    },
    getSlipAngle() {
      return slipAngle;
    },
  };

  function integrateVehicle(throttle: number, canMove: boolean, delta: number): void {
    const currentForward = vehicleForward();
    const currentRight = vehicleRight();
    const worldSpeed = Math.hypot(velocityX, velocityZ);
    let forwardSpeed = dot(velocityX, velocityZ, currentForward.x, currentForward.z);
    let sideSpeed = dot(velocityX, velocityZ, currentRight.x, currentRight.z);
    const braking = throttle < 0 && forwardSpeed > 0.35;
    const reverse = throttle < 0 && !braking;
    const throttleAmount = Math.abs(throttle);
    const engineAcceleration =
      canMove && throttle > 0
        ? acceleration * throttleAmount
        : canMove && reverse
          ? -acceleration * 0.55 * throttleAmount
          : 0;
    const brakeAcceleration = canMove && braking ? -brakeDeceleration * throttleAmount : 0;
    const resistance = rollingResistance + drag + aerodynamicDrag * worldSpeed;
    const resistanceAcceleration = -forwardSpeed * resistance;

    forwardSpeed +=
      (engineAcceleration + brakeAcceleration + resistanceAcceleration) * delta;
    forwardSpeed = clamp(forwardSpeed, -reverseSpeed, maxSpeed);
    sideSpeed *= Math.exp(-lateralGrip * delta);

    speed = forwardSpeed;
    lateralSpeed = sideSpeed;
    slipAngle = worldSpeed > 0.1 ? Math.atan2(sideSpeed, Math.abs(forwardSpeed)) : 0;

    const steeringSpeed = Math.abs(forwardSpeed) > 0.15 ? forwardSpeed : 0;
    const yawRate = clamp(
      (steeringSpeed / wheelBase) * Math.tan(steerAngle),
      -turnSpeed,
      turnSpeed,
    );
    target.transform.rotation.y += yawRate * delta;

    const forward = vehicleForward();
    const right = vehicleRight();
    velocityX = forward.x * forwardSpeed + right.x * sideSpeed;
    velocityZ = forward.z * forwardSpeed + right.z * sideSpeed;
    target.transform.position.x += velocityX * delta;
    target.transform.position.z += velocityZ * delta;
  }

  function clampToBounds(): void {
    if (!options.bounds) return;

    const beforeX = target.transform.position.x;
    const beforeZ = target.transform.position.z;
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

    if (target.transform.position.x !== beforeX) velocityX = 0;
    if (target.transform.position.z !== beforeZ) velocityZ = 0;
  }

  function updateCamera(world: World, delta: number): void {
    if (cameraMode === 'forward') {
      updateForwardCamera(world, delta);
      return;
    }

    const cameraTurnAmount = 1 - Math.exp(-cameraLerp * 0.45 * delta);
    cameraYaw += shortestAngle(target.transform.rotation.y - cameraYaw) * cameraTurnAmount;

    const forwardX = Math.sin(cameraYaw);
    const forwardZ = -Math.cos(cameraYaw);
    const targetForward = vehicleForward();
    const focus = {
      x: target.transform.position.x + targetForward.x * Math.min(cameraLead, Math.abs(speed) * 0.22),
      y: target.transform.position.y + focusHeight,
      z: target.transform.position.z + targetForward.z * Math.min(cameraLead, Math.abs(speed) * 0.22),
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

  function updateForwardCamera(world: World, delta: number): void {
    const forward = vehicleForward();
    const right = vehicleRight();
    const focusLead = Math.max(0.5, 2.2 + cameraLead + Math.abs(speed) * 0.25);
    const lateralLook = clamp(lateralSpeed * 0.12, -1.2, 1.2);
    const focus = {
      x: target.transform.position.x + forward.x * focusLead + right.x * lateralLook,
      y: target.transform.position.y + focusHeight,
      z: target.transform.position.z + forward.z * focusLead + right.z * lateralLook,
    };
    const cameraOffset = clamp(cameraLead * 0.35, -1.8, 1.8);
    const desired = {
      x: target.transform.position.x - forward.x * cameraDistance + right.x * cameraOffset,
      y: target.transform.position.y + cameraHeight,
      z: target.transform.position.z - forward.z * cameraDistance + right.z * cameraOffset,
    };
    const amount = 1 - Math.exp(-cameraLerp * delta);

    world.camera.position.x += (desired.x - world.camera.position.x) * amount;
    world.camera.position.y += (desired.y - world.camera.position.y) * amount;
    world.camera.position.z += (desired.z - world.camera.position.z) * amount;
    world.camera.target.x += (focus.x - world.camera.target.x) * amount;
    world.camera.target.y += (focus.y - world.camera.target.y) * amount;
    world.camera.target.z += (focus.z - world.camera.target.z) * amount;
  }

  function vehicleForward(): { x: number; z: number } {
    return {
      x: Math.sin(target.transform.rotation.y),
      z: -Math.cos(target.transform.rotation.y),
    };
  }

  function vehicleRight(): { x: number; z: number } {
    return {
      x: Math.cos(target.transform.rotation.y),
      z: Math.sin(target.transform.rotation.y),
    };
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

function dot(ax: number, az: number, bx: number, bz: number): number {
  return ax * bx + az * bz;
}

function shortestAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
