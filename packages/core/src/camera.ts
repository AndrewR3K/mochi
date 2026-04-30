import {
  mat4Invert,
  mat4LookAt,
  mat4Multiply,
  mat4MultiplyVec4,
  mat4Perspective,
  type Vec3,
} from './math';
import type { Camera } from './world';

export interface CameraRay {
  origin: Vec3;
  direction: Vec3;
}

export interface ViewportPoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getCameraForward(camera: Camera): Vec3 {
  return normalize({
    x: camera.target.x - camera.position.x,
    y: camera.target.y - camera.position.y,
    z: camera.target.z - camera.position.z,
  });
}

export function createCameraRay(camera: Camera, viewport: ViewportPoint): CameraRay {
  const inverseViewProjection = mat4Invert(
    createCameraViewProjection(camera, viewport.width, viewport.height),
  );
  const clipX = (viewport.x / viewport.width) * 2 - 1;
  const clipY = 1 - (viewport.y / viewport.height) * 2;
  const near = mat4MultiplyVec4(inverseViewProjection, [clipX, clipY, -1, 1]);
  const far = mat4MultiplyVec4(inverseViewProjection, [clipX, clipY, 1, 1]);
  const nearPoint = perspectiveDivide(near);
  const farPoint = perspectiveDivide(far);

  return {
    origin: nearPoint,
    direction: normalize({
      x: farPoint.x - nearPoint.x,
      y: farPoint.y - nearPoint.y,
      z: farPoint.z - nearPoint.z,
    }),
  };
}

function createCameraViewProjection(camera: Camera, width: number, height: number) {
  const projection = mat4Perspective(
    camera.fov,
    Math.max(1, width) / Math.max(1, height),
    camera.near,
    camera.far,
  );
  return mat4Multiply(projection, mat4LookAt(camera.position, camera.target));
}

function perspectiveDivide(value: readonly number[]): Vec3 {
  const w = value[3] || 1;
  return {
    x: value[0] / w,
    y: value[1] / w,
    z: value[2] / w,
  };
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}
