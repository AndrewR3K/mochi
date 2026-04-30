import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { geometries } from '../src/geometry';

describe('renderer geometry', () => {
  it('keeps primitive buffers aligned', () => {
    for (const geometry of Object.values(geometries)) {
      assert.equal(geometry.positions.length % 3, 0);
      assert.equal(geometry.normals.length, geometry.positions.length);
      assert.equal(geometry.indices.length % 3, 0);
    }
  });

  it('uses normalized normals for lighting', () => {
    for (const geometry of Object.values(geometries)) {
      for (let i = 0; i < geometry.normals.length; i += 3) {
        const length = Math.hypot(
          geometry.normals[i],
          geometry.normals[i + 1],
          geometry.normals[i + 2],
        );
        assert.equal(length, 1);
      }
    }
  });
});
