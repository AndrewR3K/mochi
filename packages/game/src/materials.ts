import type { Material, Vec3 } from '@lite3d/runtime';

export type MaterialPresetKind = 'solid' | 'emissive' | 'warning' | 'neutral';

export const MATERIAL_PRESET_COLORS: Record<MaterialPresetKind, Vec3> = {
  solid: { x: 0.42, y: 0.61, z: 1 },
  emissive: { x: 0.3, y: 0.95, z: 1 },
  warning: { x: 1, y: 0.42, z: 0.2 },
  neutral: { x: 0.18, y: 0.2, z: 0.3 },
};

export function createMaterial(color: MaterialPresetKind | Vec3): Material {
  return {
    color: materialColor(color),
  };
}

export function materialColor(color: MaterialPresetKind | Vec3): Vec3 {
  const value = typeof color === 'string' ? MATERIAL_PRESET_COLORS[color] : color;
  return { ...value };
}
