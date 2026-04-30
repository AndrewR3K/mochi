import type { InputState } from '@mochi-labs/core';

export type KeyBinding = string | readonly string[];

export interface CharacterInputBindings {
  forward: KeyBinding;
  backward: KeyBinding;
  left: KeyBinding;
  right: KeyBinding;
  sprint: KeyBinding;
  jump: KeyBinding;
}

export interface VehicleInputBindings {
  forward: KeyBinding;
  backward: KeyBinding;
  left: KeyBinding;
  right: KeyBinding;
}

export interface SpaceflightInputBindings {
  thrust: KeyBinding;
  brake: KeyBinding;
  yawLeft: KeyBinding;
  yawRight: KeyBinding;
  pitchUp: KeyBinding;
  pitchDown: KeyBinding;
  rollLeft: KeyBinding;
  rollRight: KeyBinding;
  strafeUp: KeyBinding;
  strafeDown: KeyBinding;
}

export const DEFAULT_CHARACTER_INPUT_BINDINGS: CharacterInputBindings = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  sprint: 'ShiftLeft',
  jump: 'Space',
};

export const DEFAULT_VEHICLE_INPUT_BINDINGS: VehicleInputBindings = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
};

export const DEFAULT_SPACEFLIGHT_INPUT_BINDINGS: SpaceflightInputBindings = {
  thrust: ['KeyW', 'ArrowUp'],
  brake: ['KeyS', 'ArrowDown'],
  yawLeft: ['KeyA', 'ArrowLeft'],
  yawRight: ['KeyD', 'ArrowRight'],
  pitchUp: ['KeyR'],
  pitchDown: ['KeyF'],
  rollLeft: ['KeyQ'],
  rollRight: ['KeyE'],
  strafeUp: 'Space',
  strafeDown: ['ShiftLeft', 'ShiftRight'],
};

export function isBindingDown(input: InputState, binding: KeyBinding): boolean {
  if (typeof binding === 'string') return input.isKeyDown(binding);
  return binding.some((key) => input.isKeyDown(key));
}

export function wasBindingPressed(input: InputState, binding: KeyBinding): boolean {
  if (typeof binding === 'string') return input.wasKeyPressed(binding);
  return binding.some((key) => input.wasKeyPressed(key));
}
