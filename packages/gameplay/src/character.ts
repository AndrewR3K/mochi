import type { Entity } from '@mochi-labs/core';

export interface CharacterMotorBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CharacterMotorOptions {
  target: Entity;
  gravity?: number;
  groundY?: number;
  jumpVelocity?: number;
  maxJumps?: number;
  resolveGroundHeight?: (target: Entity) => number;
  bounds?: CharacterMotorBounds;
}

export interface CharacterMotorStepOptions {
  delta: number;
  move?: {
    x: number;
    z: number;
  };
  speed?: number;
  jump?: boolean;
}

export interface CharacterMotorState {
  grounded: boolean;
  jumpsRemaining: number;
  verticalVelocity: number;
}

export interface CharacterMotor {
  readonly state: CharacterMotorState;
  step(options: CharacterMotorStepOptions): CharacterMotorState;
  reset(): void;
}

export function createCharacterMotor(options: CharacterMotorOptions): CharacterMotor {
  const target = options.target;
  const gravity = options.gravity ?? 22;
  const groundY = options.groundY ?? target.transform.position.y;
  const jumpVelocity = options.jumpVelocity ?? 7.8;
  const maxJumps = Math.max(1, Math.floor(options.maxJumps ?? 2));
  const state: CharacterMotorState = {
    grounded: true,
    jumpsRemaining: maxJumps,
    verticalVelocity: 0,
  };

  const motor: CharacterMotor = {
    state,
    step(stepOptions) {
      const delta = stepOptions.delta;
      const move = stepOptions.move ?? { x: 0, z: 0 };
      const speed = stepOptions.speed ?? 0;
      const length = Math.hypot(move.x, move.z);

      if (length > 0 && speed > 0) {
        const normalizedX = move.x / length;
        const normalizedZ = move.z / length;
        target.transform.position.x += normalizedX * speed * delta;
        target.transform.position.z += normalizedZ * speed * delta;
        target.transform.rotation.y = Math.atan2(normalizedX, normalizedZ);
      }

      settleOnGround();

      if (stepOptions.jump && state.jumpsRemaining > 0) {
        state.verticalVelocity = jumpVelocity;
        state.jumpsRemaining -= 1;
        state.grounded = false;
      }

      state.verticalVelocity -= gravity * delta;
      target.transform.position.y += state.verticalVelocity * delta;

      settleOnGround();
      applyBounds();

      return state;
    },
    reset() {
      state.grounded = true;
      state.jumpsRemaining = maxJumps;
      state.verticalVelocity = 0;
    },
  };

  return motor;

  function settleOnGround(): void {
    const dynamicGroundY = options.resolveGroundHeight?.(target) ?? groundY;

    if (target.transform.position.y <= dynamicGroundY && state.verticalVelocity <= 0) {
      target.transform.position.y = dynamicGroundY;
      state.verticalVelocity = 0;
      state.jumpsRemaining = maxJumps;
      state.grounded = true;
    } else {
      state.grounded = false;
    }
  }

  function applyBounds(): void {
    const bounds = options.bounds;
    if (!bounds) return;

    target.transform.position.x = clamp(
      target.transform.position.x,
      bounds.minX,
      bounds.maxX,
    );
    target.transform.position.z = clamp(
      target.transform.position.z,
      bounds.minZ,
      bounds.maxZ,
    );
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
