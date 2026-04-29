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
