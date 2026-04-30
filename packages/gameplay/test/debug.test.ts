import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDebugRay } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('debug visuals', () => {
  it('creates scene-owned debug rays', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const ray = createDebugRay(
      scene,
      { x: 1, y: 2, z: 3 },
      { x: 0, y: 0, z: -1 },
      {
        id: 'aim-ray',
        length: 6,
      },
    );

    ray.setEnabled(true);
    game.runtime.tick(0.016);
    const entity = game.world.getEntity('aim-ray');

    assert.equal(ray.enabled, true);
    assert.equal(entity?.transform.position.z, 0);
    assert.equal(entity?.transform.scale.z, 6);

    ray.setEnabled(false);
    assert.equal(entity?.transform.scale.z, 0);
  });
});
