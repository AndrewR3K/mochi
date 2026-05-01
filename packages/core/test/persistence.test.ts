import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  World,
  createMemoryWorldSnapshotStore,
  deserializeWorldSnapshot,
  loadWorldSnapshot,
  saveWorldSnapshot,
  serializeWorldSnapshot,
} from '../src';

describe('world snapshot persistence', () => {
  it('serializes and deserializes world snapshots', () => {
    const world = new World();
    world.camera.position.x = 6;
    const parent = world.createEntity({
      id: 'parent',
      tags: ['save-root'],
      transform: { position: { x: 1, y: 2, z: 3 } },
    });
    world.createEntity({
      id: 'child',
      parent,
      renderable: {
        primitive: 'cube',
        material: { color: { x: 0.3, y: 0.5, z: 0.7 } },
      },
    });

    const restored = new World();
    restored.loadWorldSnapshot(deserializeWorldSnapshot(
      serializeWorldSnapshot(world.createWorldSnapshot()),
    ));

    assert.equal(restored.camera.position.x, 6);
    assert.equal(restored.getEntity('child')?.parent?.id, 'parent');
    assert.deepEqual(restored.getEntity('child')?.renderable?.material.color, {
      x: 0.3,
      y: 0.5,
      z: 0.7,
    });
  });

  it('saves, lists, loads, and deletes snapshots through memory stores', async () => {
    const world = new World();
    world.createEntity({
      id: 'player',
      transform: { position: { x: 4, y: 0, z: -2 } },
    });
    const store = createMemoryWorldSnapshotStore();
    const restored = new World();

    await saveWorldSnapshot(world, store, 'slot-a');
    world.getEntity('player')!.transform.position.x = 99;
    const loaded = await loadWorldSnapshot(restored, store, 'slot-a');

    assert.equal(loaded, true);
    assert.deepEqual(store.slots, ['slot-a']);
    assert.deepEqual(await store.listSnapshots?.(), ['slot-a']);
    assert.equal(restored.getEntity('player')?.transform.position.x, 4);

    await store.deleteSnapshot?.('slot-a');
    assert.equal(await loadWorldSnapshot(restored, store, 'slot-a'), false);
  });

  it('rejects invalid serialized snapshots before they reach the world', () => {
    assert.throws(
      () => deserializeWorldSnapshot('{"camera":{"position":{"x":"bad"}},"entities":[]}'),
      /camera.position.x/,
    );
  });
});
