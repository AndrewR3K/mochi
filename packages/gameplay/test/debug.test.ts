import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createBoxCollider,
  createDebugOverlay,
  createDebugRay,
  setBoxCollisionBody,
} from '../src';
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

  it('creates scene-owned debug overlays with inspection snapshots', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const blocker = scene.createEntity({
      id: 'blocker',
      tags: ['blocker'],
      transform: { scale: { x: 2, y: 1, z: 3 } },
    });
    const target = scene.createEntity({ id: 'target', tags: ['actor'] });
    const snapshots: number[] = [];

    setBoxCollisionBody(blocker, { halfX: 1, halfY: 0.5, halfZ: 1.5 });
    const overlay = createDebugOverlay(scene, {
      boxes: [createBoxCollider(blocker)],
      enabled: true,
      targets: [target],
      rays: [
        {
          id: 'overlay-ray',
          origin: () => target.transform.position,
          direction: { x: 1, y: 0, z: 0 },
          length: 5,
        },
      ],
      onSnapshot: (snapshot) => snapshots.push(snapshot.entityCount),
    });

    game.runtime.tick(0.25);

    assert.equal(overlay.enabled, true);
    assert.equal(overlay.visuals.length, 3);
    assert.ok(overlay.snapshot.entityCount >= 8);
    assert.deepEqual(
      overlay.snapshot.tags.map((entry) => entry.tag),
      ['actor', 'blocker'],
    );
    assert.ok(snapshots.length >= 2);
    assert.equal(game.world.getEntity('overlay-ray')?.transform.scale.z, 5);

    overlay.setEnabled(false);
    assert.equal(game.world.getEntity('overlay-ray')?.transform.scale.z, 0);

    overlay.dispose();
    assert.equal(game.world.getEntity('overlay-ray'), undefined);
  });
});
