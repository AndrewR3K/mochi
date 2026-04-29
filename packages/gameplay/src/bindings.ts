import type { InputState } from '@lite3d/core';

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

export function isBindingDown(input: InputState, binding: KeyBinding): boolean {
  if (typeof binding === 'string') return input.isKeyDown(binding);
  return binding.some((key) => input.isKeyDown(key));
}

export function wasBindingPressed(input: InputState, binding: KeyBinding): boolean {
  if (typeof binding === 'string') return input.wasKeyPressed(binding);
  return binding.some((key) => input.wasKeyPressed(key));
}
