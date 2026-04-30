import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createGameInspectionSnapshot,
  setBoxCollisionBody,
  setSphereCollisionBody,
} from '../src';
import { createHeadlessGame } from './headlessGame';

describe('game inspection snapshots', () => {
  it('summarizes world entities, hierarchy, tags, and collision state', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const parent = scene.createEntity({
      id: 'parent',
      tags: ['actor'],
      renderable: {
        primitive: 'cube',
        material: { color: { x: 1, y: 1, z: 1 } },
      },
    });
    const child = scene.createEntity({
      id: 'child',
      tags: ['actor', 'sensor'],
      parent,
      transform: { position: { x: 0.5, y: 0, z: 0 } },
    });

    setSphereCollisionBody(parent, { radius: 1 });
    setBoxCollisionBody(child, { halfX: 0.25, halfY: 0.25, halfZ: 0.25, trigger: true });

    const snapshot = createGameInspectionSnapshot(game);

    assert.equal(snapshot.entityCount, 2);
    assert.equal(snapshot.rootCount, 1);
    assert.equal(snapshot.renderableCount, 1);
    assert.equal(snapshot.collisionBodyCount, 2);
    assert.equal(snapshot.collisionPairCount, 1);
    assert.equal(snapshot.triggerPairCount, 1);
    assert.deepEqual(snapshot.tags, [
      { tag: 'actor', count: 2 },
      { tag: 'sensor', count: 1 },
    ]);
    assert.equal(snapshot.world.entities.find((entity) => entity.id === 'child')?.parentId, 'parent');
  });
});
