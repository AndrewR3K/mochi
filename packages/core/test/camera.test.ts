import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCameraRay, getCameraForward, World } from '../src';

describe('camera utilities', () => {
  it('creates a viewport ray through the center of the camera', () => {
    const world = new World();
    world.camera.position = { x: 0, y: 0, z: 10 };
    world.camera.target = { x: 0, y: 0, z: 0 };

    const ray = createCameraRay(world.camera, {
      x: 400,
      y: 300,
      width: 800,
      height: 600,
    });

    assertAlmostEqual(ray.origin.x, 0);
    assertAlmostEqual(ray.origin.y, 0);
    assertAlmostEqual(ray.direction.x, 0);
    assertAlmostEqual(ray.direction.y, 0);
    assertAlmostEqual(ray.direction.z, -1);
  });

  it('gets normalized camera forward direction', () => {
    const world = new World();
    world.camera.position = { x: 0, y: 2, z: 6 };
    world.camera.target = { x: 0, y: 2, z: 3 };

    assert.deepEqual(getCameraForward(world.camera), { x: 0, y: 0, z: -1 });
  });
});

function assertAlmostEqual(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 0.00001, `${actual} expected ${expected}`);
}
