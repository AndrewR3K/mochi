import type { Entity } from '@mochi-labs/core';

import type { Game } from './game';
import {
  createThirdPersonController,
  type ThirdPersonController,
  type ThirdPersonControllerOptions,
} from './thirdPerson';
import {
  createVehicleController,
  type VehicleController,
  type VehicleControllerOptions,
} from './vehicle';
import {
  createSpaceflightController,
  type SpaceflightController,
  type SpaceflightControllerOptions,
} from './spaceflight';

type SharedPresetOptions = Omit<
  ThirdPersonControllerOptions,
  | 'target'
  | 'moveSpeed'
  | 'sprintMultiplier'
  | 'jumpVelocity'
  | 'gravity'
  | 'doubleJump'
  | 'cameraDistance'
  | 'cameraHeight'
  | 'cameraLerp'
  | 'cameraRotationLerp'
  | 'lookSensitivity'
  | 'rotateButtons'
  | 'minPitch'
  | 'maxPitch'
  | 'focusHeight'
>;
type VehiclePresetOptions = Pick<
  VehicleControllerOptions,
  | 'acceleration'
  | 'brakeDeceleration'
  | 'drag'
  | 'maxSpeed'
  | 'reverseSpeed'
  | 'turnSpeed'
  | 'cameraDistance'
  | 'cameraHeight'
  | 'cameraLerp'
  | 'focusHeight'
  | 'input'
>;
type SharedVehiclePresetOptions = Pick<
  VehicleControllerOptions,
  'target' | 'groundY' | 'enabled' | 'bounds'
>;
type SpaceflightPresetOptions = Omit<
  SpaceflightControllerOptions,
  | 'target'
  | 'thrust'
  | 'brakeDeceleration'
  | 'drag'
  | 'maxSpeed'
  | 'strafeSpeed'
  | 'yawSpeed'
  | 'pitchSpeed'
  | 'rollSpeed'
  | 'autoLevelRoll'
  | 'cameraDistance'
  | 'cameraHeight'
  | 'cameraLerp'
  | 'focusDistance'
>;

export interface PresetControllerOptions extends SharedPresetOptions {
  target: Entity;
}

export interface VehiclePresetControllerOptions
  extends SharedVehiclePresetOptions,
    VehiclePresetOptions {}

export interface SpaceflightPresetControllerOptions extends SpaceflightPresetOptions {
  target: Entity;
}

export type ControllerPresetKind =
  | 'firstPerson'
  | 'thirdPersonOrbit'
  | 'thirdPersonOverShoulder'
  | 'topDown'
  | 'isometric'
  | 'sideScroller2D'
  | 'vehicleArcade'
  | 'vehicleSim'
  | 'spaceflightArcade'
  | 'railCamera'
  | 'strategyFreeCam';

export const CONTROLLER_PRESET_KINDS: ControllerPresetKind[] = [
  'firstPerson',
  'thirdPersonOrbit',
  'thirdPersonOverShoulder',
  'topDown',
  'isometric',
  'sideScroller2D',
  'vehicleArcade',
  'vehicleSim',
  'spaceflightArcade',
  'railCamera',
  'strategyFreeCam',
];

export type PresetController =
  | ThirdPersonController
  | VehicleController
  | SpaceflightController;

export function createFirstPersonController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 6.4,
    sprintMultiplier: 1.35,
    jumpVelocity: 7.9,
    gravity: 24,
    doubleJump: false,
    cameraDistance: 1.2,
    cameraHeight: 0.05,
    focusHeight: 1.05,
    cameraLerp: 24,
    cameraRotationLerp: 42,
    lookSensitivity: 0.003,
    rotateButtons: [0, 2],
    minPitch: -1.2,
    maxPitch: 1.2,
    ...options,
  });
}

export function createThirdPersonOrbitController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 5.2,
    sprintMultiplier: 1.45,
    jumpVelocity: 8.1,
    gravity: 24,
    doubleJump: true,
    cameraDistance: 8,
    cameraHeight: 2.4,
    focusHeight: 0.95,
    cameraLerp: 16,
    cameraRotationLerp: 30,
    lookSensitivity: 0.0038,
    rotateButtons: [0, 2],
    minPitch: -0.9,
    maxPitch: 0.9,
    ...options,
  });
}

export function createThirdPersonOverShoulderController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 5.8,
    sprintMultiplier: 1.5,
    jumpVelocity: 8.2,
    gravity: 24,
    doubleJump: true,
    cameraDistance: 7.2,
    cameraHeight: 2.35,
    focusHeight: 0.95,
    cameraLerp: 18,
    cameraRotationLerp: 34,
    lookSensitivity: 0.0038,
    rotateButtons: [0, 2],
    minPitch: -0.9,
    maxPitch: 0.9,
    ...options,
  });
}

export function createTopDownController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 5.4,
    sprintMultiplier: 1.2,
    jumpVelocity: 0,
    gravity: 28,
    doubleJump: false,
    cameraDistance: 0.12,
    cameraHeight: 13.5,
    focusHeight: 0.2,
    cameraLerp: 10,
    cameraRotationLerp: 16,
    lookSensitivity: 0,
    rotateButtons: [],
    minPitch: -1.35,
    maxPitch: -1.35,
    pitch: -1.35,
    ...options,
  });
}

export function createIsometricController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 5.1,
    sprintMultiplier: 1.15,
    jumpVelocity: 0,
    gravity: 28,
    doubleJump: false,
    cameraDistance: 11.5,
    cameraHeight: 4.2,
    focusHeight: 0.25,
    cameraLerp: 10,
    cameraRotationLerp: 16,
    lookSensitivity: 0,
    rotateButtons: [],
    yaw: Math.PI * 0.25,
    minPitch: -0.9,
    maxPitch: -0.9,
    pitch: -0.9,
    ...options,
  });
}

export function createSideScroller2DController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  const bounds =
    options.bounds ?? {
      minX: -9999,
      maxX: 9999,
      minZ: options.target.transform.position.z,
      maxZ: options.target.transform.position.z,
    };

  return createThirdPersonController(game, {
    moveSpeed: 5.6,
    sprintMultiplier: 1.2,
    jumpVelocity: 8.4,
    gravity: 25,
    doubleJump: true,
    cameraDistance: 8.8,
    cameraHeight: 1.9,
    focusHeight: 0.75,
    cameraLerp: 14,
    cameraRotationLerp: 22,
    lookSensitivity: 0,
    rotateButtons: [],
    yaw: Math.PI / 2,
    minPitch: -0.18,
    maxPitch: -0.18,
    pitch: -0.18,
    bounds,
    ...options,
  });
}

export function createVehicleArcadeController(
  game: Game,
  options: VehiclePresetControllerOptions,
): VehicleController {
  return createVehicleController(game, {
    acceleration: 19,
    brakeDeceleration: 28,
    drag: 5.8,
    maxSpeed: 12,
    reverseSpeed: 4,
    turnSpeed: 2.05,
    cameraDistance: 9.4,
    cameraHeight: 2.8,
    focusHeight: 0.85,
    cameraLerp: 11,
    ...options,
  });
}

export function createVehicleSimController(
  game: Game,
  options: VehiclePresetControllerOptions,
): VehicleController {
  return createVehicleController(game, {
    acceleration: 10.5,
    brakeDeceleration: 18,
    drag: 2.8,
    maxSpeed: 10.5,
    reverseSpeed: 3.2,
    turnSpeed: 1.25,
    cameraDistance: 10.6,
    cameraHeight: 3.1,
    focusHeight: 0.7,
    cameraLerp: 8,
    ...options,
  });
}

export function createSpaceflightArcadeController(
  game: Game,
  options: SpaceflightPresetControllerOptions,
): SpaceflightController {
  return createSpaceflightController(game, {
    thrust: 22,
    brakeDeceleration: 30,
    drag: 0.65,
    maxSpeed: 24,
    strafeSpeed: 8.5,
    yawSpeed: 1.85,
    pitchSpeed: 1.45,
    rollSpeed: 2.2,
    autoLevelRoll: 1.25,
    cameraDistance: 11,
    cameraHeight: 2.2,
    cameraLerp: 9,
    focusDistance: 7,
    ...options,
  });
}

export function createRailCameraController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 6.2,
    sprintMultiplier: 1,
    jumpVelocity: 6.6,
    gravity: 24,
    doubleJump: false,
    cameraDistance: 6.4,
    cameraHeight: 3.6,
    focusHeight: 1,
    cameraLerp: 20,
    cameraRotationLerp: 26,
    lookSensitivity: 0,
    rotateButtons: [],
    minPitch: -0.45,
    maxPitch: -0.1,
    ...options,
  });
}

export function createStrategyFreeCamController(
  game: Game,
  options: PresetControllerOptions,
): ThirdPersonController {
  return createThirdPersonController(game, {
    moveSpeed: 9.6,
    sprintMultiplier: 1.2,
    jumpVelocity: 0,
    gravity: 30,
    doubleJump: false,
    cameraDistance: 0.15,
    cameraHeight: 18,
    focusHeight: 0.1,
    cameraLerp: 11,
    cameraRotationLerp: 18,
    lookSensitivity: 0.0024,
    rotateButtons: [2],
    minPitch: -1.45,
    maxPitch: -0.55,
    pitch: -1.2,
    ...options,
  });
}

export function createControllerPreset(
  game: Game,
  kind: ControllerPresetKind,
  options:
    | PresetControllerOptions
    | VehiclePresetControllerOptions
    | SpaceflightPresetControllerOptions,
): PresetController {
  switch (kind) {
    case 'firstPerson':
      return createFirstPersonController(game, options as PresetControllerOptions);
    case 'thirdPersonOrbit':
      return createThirdPersonOrbitController(game, options as PresetControllerOptions);
    case 'thirdPersonOverShoulder':
      return createThirdPersonOverShoulderController(game, options as PresetControllerOptions);
    case 'topDown':
      return createTopDownController(game, options as PresetControllerOptions);
    case 'isometric':
      return createIsometricController(game, options as PresetControllerOptions);
    case 'sideScroller2D':
      return createSideScroller2DController(game, options as PresetControllerOptions);
    case 'vehicleArcade':
      return createVehicleArcadeController(game, options as VehiclePresetControllerOptions);
    case 'vehicleSim':
      return createVehicleSimController(game, options as VehiclePresetControllerOptions);
    case 'spaceflightArcade':
      return createSpaceflightArcadeController(
        game,
        options as SpaceflightPresetControllerOptions,
      );
    case 'railCamera':
      return createRailCameraController(game, options as PresetControllerOptions);
    case 'strategyFreeCam':
      return createStrategyFreeCamController(game, options as PresetControllerOptions);
  }
}
