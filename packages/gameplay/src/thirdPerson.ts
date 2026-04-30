import type { Entity } from '@mochi/core';

import {
  DEFAULT_CHARACTER_INPUT_BINDINGS,
  isBindingDown,
  wasBindingPressed,
  type CharacterInputBindings,
} from './bindings';
import type { Game } from './game';

export interface ThirdPersonControllerOptions {
  target: Entity;
  moveSpeed?: number;
  sprintMultiplier?: number;
  sprintKey?: string;
  jumpKey?: string;
  input?: Partial<CharacterInputBindings>;
  jumpVelocity?: number;
  gravity?: number;
  doubleJump?: boolean;
  groundY?: number;
  resolveGroundHeight?: (target: Entity) => number;
  cameraDistance?: number;
  cameraHeight?: number;
  cameraLerp?: number;
  cameraRotationLerp?: number;
  focusHeight?: number;
  lookSensitivity?: number;
  minPitch?: number;
  maxPitch?: number;
  rotateButtons?: number[];
  enabled?: () => boolean;
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  yaw?: number;
  pitch?: number;
}

export interface ThirdPersonController {
  dispose(): void;
  reset(): void;
}

export function createThirdPersonController(
  game: Game,
  options: ThirdPersonControllerOptions,
): ThirdPersonController {
  const target = options.target;
  const moveSpeed = options.moveSpeed ?? 5;
  const sprintMultiplier = options.sprintMultiplier ?? 1.6;
  const inputBindings = {
    ...DEFAULT_CHARACTER_INPUT_BINDINGS,
    sprint: options.sprintKey ?? DEFAULT_CHARACTER_INPUT_BINDINGS.sprint,
    jump: options.jumpKey ?? DEFAULT_CHARACTER_INPUT_BINDINGS.jump,
    ...options.input,
  };
  const jumpVelocity = options.jumpVelocity ?? 7.8;
  const gravity = options.gravity ?? 22;
  const groundY = options.groundY ?? target.transform.position.y;
  const cameraDistance = options.cameraDistance ?? 7;
  const cameraHeight = options.cameraHeight ?? 3;
  const cameraLerp = options.cameraLerp ?? 12;
  const cameraRotationLerp = options.cameraRotationLerp ?? 28;
  const focusHeight = options.focusHeight ?? 0.8;
  const lookSensitivity = options.lookSensitivity ?? 0.005;
  const minPitch = options.minPitch ?? -0.45;
  const maxPitch = options.maxPitch ?? 0.65;
  const rotateButtons = options.rotateButtons ?? [0, 2];
  let targetYaw = options.yaw ?? 0;
  let targetPitch = options.pitch ?? 0.15;
  let yaw = targetYaw;
  let pitch = targetPitch;
  let verticalVelocity = 0;
  let jumpsRemaining = options.doubleJump === false ? 1 : 2;

  const unsubscribe = game.onFrame(({ delta, input, world }) => {
    const canMove = options.enabled?.() ?? true;

    if (rotateButtons.some((button) => input.isPointerButtonDown(button))) {
      targetYaw += input.pointer.deltaX * lookSensitivity;
      targetPitch = clamp(
        targetPitch + input.pointer.deltaY * lookSensitivity,
        minPitch,
        maxPitch,
      );
    }

    const rotateAmount = 1 - Math.exp(-cameraRotationLerp * delta);
    yaw += shortestAngle(targetYaw - yaw) * rotateAmount;
    pitch += (targetPitch - pitch) * rotateAmount;

    const forward = {
      x: Math.sin(yaw),
      z: -Math.cos(yaw),
    };
    const right = {
      x: Math.cos(yaw),
      z: Math.sin(yaw),
    };
    const moveZ =
      Number(isBindingDown(input, inputBindings.forward)) -
      Number(isBindingDown(input, inputBindings.backward));
    const moveX =
      Number(isBindingDown(input, inputBindings.right)) -
      Number(isBindingDown(input, inputBindings.left));
    const x = right.x * moveX + forward.x * moveZ;
    const z = right.z * moveX + forward.z * moveZ;
    const length = Math.hypot(x, z);

    if (canMove && length > 0) {
      const normalizedX = x / length;
      const normalizedZ = z / length;
      const speed =
        moveSpeed * (isBindingDown(input, inputBindings.sprint) ? sprintMultiplier : 1);
      target.transform.position.x += normalizedX * speed * delta;
      target.transform.position.z += normalizedZ * speed * delta;
      target.transform.rotation.y = Math.atan2(normalizedX, normalizedZ);
    }

    settleOnGround();

    if (canMove && wasBindingPressed(input, inputBindings.jump) && jumpsRemaining > 0) {
      verticalVelocity = jumpVelocity;
      jumpsRemaining -= 1;
    }

    verticalVelocity -= gravity * delta;
    target.transform.position.y += verticalVelocity * delta;

    settleOnGround();

    if (options.bounds) {
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

    const focus = {
      x: target.transform.position.x,
      y: target.transform.position.y + focusHeight,
      z: target.transform.position.z,
    };
    const distance = cameraDistance * Math.cos(pitch);
    const desired = {
      x: focus.x - forward.x * distance,
      y: focus.y + cameraHeight + Math.sin(pitch) * cameraDistance,
      z: focus.z - forward.z * distance,
    };
    const amount = 1 - Math.exp(-cameraLerp * delta);

    world.camera.position.x += (desired.x - world.camera.position.x) * amount;
    world.camera.position.y += (desired.y - world.camera.position.y) * amount;
    world.camera.position.z += (desired.z - world.camera.position.z) * amount;
    world.camera.target.x += (focus.x - world.camera.target.x) * amount;
    world.camera.target.y += (focus.y - world.camera.target.y) * amount;
    world.camera.target.z += (focus.z - world.camera.target.z) * amount;
  });

  return {
    dispose: unsubscribe,
    reset() {
      targetYaw = options.yaw ?? 0;
      targetPitch = options.pitch ?? 0.15;
      yaw = targetYaw;
      pitch = targetPitch;
      verticalVelocity = 0;
      jumpsRemaining = options.doubleJump === false ? 1 : 2;
    },
  };

  function settleOnGround(): void {
    const dynamicGroundY = options.resolveGroundHeight?.(target) ?? groundY;

    if (target.transform.position.y <= dynamicGroundY && verticalVelocity <= 0) {
      target.transform.position.y = dynamicGroundY;
      verticalVelocity = 0;
      jumpsRemaining = options.doubleJump === false ? 1 : 2;
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function shortestAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
