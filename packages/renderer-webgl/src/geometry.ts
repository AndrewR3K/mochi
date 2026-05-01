import type { PrimitiveKind } from '@mochi-labs/core';

export interface GeometryData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
}

export const geometries: Record<PrimitiveKind, GeometryData> = {
  cube: {
    positions: new Float32Array([
      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, 0.5, 0.5,
      -0.5, 0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, -0.5, -0.5,
      0.5, 0.5, -0.5,
      0.5, 0.5, 0.5,
      0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5,
      -0.5, 0.5, -0.5,
      0.5, 0.5, -0.5,
      -0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, 0.5, -0.5,
      -0.5, 0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, 0.5, -0.5,
      -0.5, 0.5, -0.5,
      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,
      0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,
    ]),
    normals: new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
    ]),
    indices: new Uint16Array([
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      8, 9, 10, 8, 10, 11,
      12, 13, 14, 12, 14, 15,
      16, 17, 18, 16, 18, 19,
      20, 21, 22, 20, 22, 23,
    ]),
  },
  plane: {
    positions: new Float32Array([
      -0.5, 0, -0.5,
      0.5, 0, -0.5,
      0.5, 0, 0.5,
      -0.5, 0, 0.5,
    ]),
    normals: new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
    ]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  },
  cylinder: createCylinderGeometry(24),
};

function createCylinderGeometry(segments: number): GeometryData {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const y = Math.cos(angle) * 0.5;
    const z = Math.sin(angle) * 0.5;

    positions.push(-0.5, y, z, 0.5, y, z);
    normals.push(0, Math.cos(angle), Math.sin(angle), 0, Math.cos(angle), Math.sin(angle));
  }

  for (let i = 0; i < segments; i += 1) {
    const base = i * 2;
    indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
  }

  const leftCenter = positions.length / 3;
  positions.push(-0.5, 0, 0);
  normals.push(-1, 0, 0);
  const rightCenter = positions.length / 3;
  positions.push(0.5, 0, 0);
  normals.push(1, 0, 0);

  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
    const leftA = positions.length / 3;
    positions.push(-0.5, Math.cos(angle) * 0.5, Math.sin(angle) * 0.5);
    normals.push(-1, 0, 0);
    const leftB = positions.length / 3;
    positions.push(-0.5, Math.cos(nextAngle) * 0.5, Math.sin(nextAngle) * 0.5);
    normals.push(-1, 0, 0);
    const rightA = positions.length / 3;
    positions.push(0.5, Math.cos(angle) * 0.5, Math.sin(angle) * 0.5);
    normals.push(1, 0, 0);
    const rightB = positions.length / 3;
    positions.push(0.5, Math.cos(nextAngle) * 0.5, Math.sin(nextAngle) * 0.5);
    normals.push(1, 0, 0);

    indices.push(leftCenter, leftB, leftA);
    indices.push(rightCenter, rightA, rightB);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}
