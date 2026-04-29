import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  composeTransform,
  mat4Identity,
  mat4Multiply,
  transform,
  vec3,
} from '../src/math';

describe('math primitives', () => {
  it('creates independent default transforms', () => {
    const a = transform();
    const b = transform();

    a.position.x = 4;
    a.scale.y = 2;

    assert.deepEqual(b.position, vec3(0, 0, 0));
    assert.deepEqual(b.scale, vec3(1, 1, 1));
  });

  it('multiplies by identity without changing matrix values', () => {
    const matrix = composeTransform({
      position: vec3(2, 3, 4),
      rotation: vec3(0, Math.PI / 2, 0),
      scale: vec3(1, 2, 3),
    });

    assertMatrixEqual(mat4Multiply(mat4Identity(), matrix), matrix);
    assertMatrixEqual(mat4Multiply(matrix, mat4Identity()), matrix);
  });

  it('composes translation and scale into a column-major transform matrix', () => {
    const matrix = composeTransform({
      position: vec3(5, 6, 7),
      rotation: vec3(0, 0, 0),
      scale: vec3(2, 3, 4),
    });

    assert.equal(matrix[0], 2);
    assert.equal(matrix[5], 3);
    assert.equal(matrix[10], 4);
    assert.equal(matrix[12], 5);
    assert.equal(matrix[13], 6);
    assert.equal(matrix[14], 7);
    assert.equal(matrix[15], 1);
  });
});

function assertMatrixEqual(actual: Float32Array, expected: Float32Array): void {
  assert.equal(actual.length, expected.length);

  for (let i = 0; i < actual.length; i += 1) {
    assert.ok(
      Math.abs(actual[i] - expected[i]) < 0.000001,
      `matrix[${i}] expected ${expected[i]} but received ${actual[i]}`,
    );
  }
}
