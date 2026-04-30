export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

export type Mat4 = Float32Array;

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function transform(partial: Partial<Transform> = {}): Transform {
  return {
    position: partial.position ?? vec3(),
    rotation: partial.rotation ?? vec3(),
    scale: partial.scale ?? vec3(1, 1, 1),
  };
}

export function mat4Identity(): Mat4 {
  const out = new Float32Array(16);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);

  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }

  return out;
}

export function mat4MultiplyVec4(
  matrix: Mat4,
  vector: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8] * vector[2] + matrix[12] * vector[3],
    matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9] * vector[2] + matrix[13] * vector[3],
    matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
    matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3],
  ];
}

export function mat4Invert(matrix: Mat4): Mat4 {
  const out = new Float32Array(16);
  const b00 = matrix[0] * matrix[5] - matrix[1] * matrix[4];
  const b01 = matrix[0] * matrix[6] - matrix[2] * matrix[4];
  const b02 = matrix[0] * matrix[7] - matrix[3] * matrix[4];
  const b03 = matrix[1] * matrix[6] - matrix[2] * matrix[5];
  const b04 = matrix[1] * matrix[7] - matrix[3] * matrix[5];
  const b05 = matrix[2] * matrix[7] - matrix[3] * matrix[6];
  const b06 = matrix[8] * matrix[13] - matrix[9] * matrix[12];
  const b07 = matrix[8] * matrix[14] - matrix[10] * matrix[12];
  const b08 = matrix[8] * matrix[15] - matrix[11] * matrix[12];
  const b09 = matrix[9] * matrix[14] - matrix[10] * matrix[13];
  const b10 = matrix[9] * matrix[15] - matrix[11] * matrix[13];
  const b11 = matrix[10] * matrix[15] - matrix[11] * matrix[14];
  const determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (determinant === 0) {
    throw new Error('Matrix is not invertible.');
  }

  const inverse = 1 / determinant;
  out[0] = (matrix[5] * b11 - matrix[6] * b10 + matrix[7] * b09) * inverse;
  out[1] = (matrix[2] * b10 - matrix[1] * b11 - matrix[3] * b09) * inverse;
  out[2] = (matrix[13] * b05 - matrix[14] * b04 + matrix[15] * b03) * inverse;
  out[3] = (matrix[10] * b04 - matrix[9] * b05 - matrix[11] * b03) * inverse;
  out[4] = (matrix[6] * b08 - matrix[4] * b11 - matrix[7] * b07) * inverse;
  out[5] = (matrix[0] * b11 - matrix[2] * b08 + matrix[3] * b07) * inverse;
  out[6] = (matrix[14] * b02 - matrix[12] * b05 - matrix[15] * b01) * inverse;
  out[7] = (matrix[8] * b05 - matrix[10] * b02 + matrix[11] * b01) * inverse;
  out[8] = (matrix[4] * b10 - matrix[5] * b08 + matrix[7] * b06) * inverse;
  out[9] = (matrix[1] * b08 - matrix[0] * b10 - matrix[3] * b06) * inverse;
  out[10] = (matrix[12] * b04 - matrix[13] * b02 + matrix[15] * b00) * inverse;
  out[11] = (matrix[9] * b02 - matrix[8] * b04 - matrix[11] * b00) * inverse;
  out[12] = (matrix[5] * b07 - matrix[4] * b09 - matrix[6] * b06) * inverse;
  out[13] = (matrix[0] * b09 - matrix[1] * b07 + matrix[2] * b06) * inverse;
  out[14] = (matrix[13] * b01 - matrix[12] * b03 - matrix[14] * b00) * inverse;
  out[15] = (matrix[8] * b03 - matrix[9] * b01 + matrix[10] * b00) * inverse;

  return out;
}

export function mat4Perspective(
  fovRadians: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  const f = 1 / Math.tan(fovRadians / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);

  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;

  return out;
}

export function mat4LookAt(eye: Vec3, target: Vec3, up: Vec3 = vec3(0, 1, 0)): Mat4 {
  const zx = eye.x - target.x;
  const zy = eye.y - target.y;
  const zz = eye.z - target.z;
  const zLen = Math.hypot(zx, zy, zz) || 1;
  const znx = zx / zLen;
  const zny = zy / zLen;
  const znz = zz / zLen;

  const xx = up.y * znz - up.z * zny;
  const xy = up.z * znx - up.x * znz;
  const xz = up.x * zny - up.y * znx;
  const xLen = Math.hypot(xx, xy, xz) || 1;
  const xnx = xx / xLen;
  const xny = xy / xLen;
  const xnz = xz / xLen;

  const ynx = zny * xnz - znz * xny;
  const yny = znz * xnx - znx * xnz;
  const ynz = znx * xny - zny * xnx;

  const out = mat4Identity();
  out[0] = xnx;
  out[1] = ynx;
  out[2] = znx;
  out[4] = xny;
  out[5] = yny;
  out[6] = zny;
  out[8] = xnz;
  out[9] = ynz;
  out[10] = znz;
  out[12] = -(xnx * eye.x + xny * eye.y + xnz * eye.z);
  out[13] = -(ynx * eye.x + yny * eye.y + ynz * eye.z);
  out[14] = -(znx * eye.x + zny * eye.y + znz * eye.z);

  return out;
}

export function composeTransform({ position, rotation, scale }: Transform): Mat4 {
  const cx = Math.cos(rotation.x);
  const sx = Math.sin(rotation.x);
  const cy = Math.cos(rotation.y);
  const sy = Math.sin(rotation.y);
  const cz = Math.cos(rotation.z);
  const sz = Math.sin(rotation.z);

  const out = mat4Identity();

  out[0] = cy * cz * scale.x;
  out[1] = (sx * sy * cz + cx * sz) * scale.x;
  out[2] = (-cx * sy * cz + sx * sz) * scale.x;

  out[4] = -cy * sz * scale.y;
  out[5] = (-sx * sy * sz + cx * cz) * scale.y;
  out[6] = (cx * sy * sz + sx * cz) * scale.y;

  out[8] = sy * scale.z;
  out[9] = -sx * cy * scale.z;
  out[10] = cx * cy * scale.z;

  out[12] = position.x;
  out[13] = position.y;
  out[14] = position.z;

  return out;
}
