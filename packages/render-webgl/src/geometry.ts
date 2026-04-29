import type { PrimitiveKind } from '@lite3d/runtime';

export interface GeometryData {
  positions: Float32Array;
  indices: Uint16Array;
}

export const geometries: Record<PrimitiveKind, GeometryData> = {
  cube: {
    positions: new Float32Array([
      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, 0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,
      0.5, 0.5, -0.5,
      -0.5, 0.5, -0.5,
    ]),
    indices: new Uint16Array([
      0, 1, 2, 0, 2, 3,
      1, 5, 6, 1, 6, 2,
      5, 4, 7, 5, 7, 6,
      4, 0, 3, 4, 3, 7,
      3, 2, 6, 3, 6, 7,
      4, 5, 1, 4, 1, 0,
    ]),
  },
  plane: {
    positions: new Float32Array([
      -0.5, 0, -0.5,
      0.5, 0, -0.5,
      0.5, 0, 0.5,
      -0.5, 0, 0.5,
    ]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  },
};
