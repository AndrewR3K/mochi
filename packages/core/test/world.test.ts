import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  World,
  getEntityWorldPosition,
  setSphereCollisionBody,
  overlapsCollisionBodies,
} from '../src';

describe('world hierarchy', () => {
  it('composes child world transforms through parent entities', () => {
    const world = new World();
    const platform = world.createEntity({
      id: 'platform',
      transform: { position: { x: 4, y: 1, z: -2 } },
    });
    const pickup = world.createEntity({
      id: 'pickup',
      parent: platform,
      transform: { position: { x: 0.5, y: 2, z: 1 } },
      renderable: {
        primitive: 'cube',
        material: { color: { x: 1, y: 1, z: 1 } },
      },
    });

    const worldPosition = world.getWorldPosition(pickup);
    const snapshot = world.createRenderSnapshot(800, 600);

    assert.deepEqual(worldPosition, { x: 4.5, y: 3, z: -1 });
    assert.equal(pickup.parent, platform);
    assert.deepEqual(platform.children, [pickup]);
    assert.equal(snapshot.objects[0].worldMatrix[12], 4.5);
    assert.equal(snapshot.objects[0].worldMatrix[13], 3);
    assert.equal(snapshot.objects[0].worldMatrix[14], -1);
  });

  it('detaches children when a parent is removed', () => {
    const world = new World();
    const parent = world.createEntity({ id: 'parent' });
    const child = world.createEntity({ id: 'child', parent });

    assert.equal(world.removeEntity('parent'), true);

    assert.equal(child.parent, null);
    assert.deepEqual(parent.children, []);
    assert.equal(world.getEntity('child'), child);
  });

  it('uses world-space positions for collision bodies', () => {
    const world = new World();
    const parent = world.createEntity({
      id: 'parent',
      transform: { position: { x: 5, y: 0, z: 0 } },
    });
    const child = world.createEntity({
      id: 'child',
      parent,
      transform: { position: { x: 1, y: 0, z: 0 } },
    });
    const target = world.createEntity({
      id: 'target',
      transform: { position: { x: 6.5, y: 0, z: 0 } },
    });

    const childBody = setSphereCollisionBody(child, { radius: 0.75 });
    const targetBody = setSphereCollisionBody(target, { radius: 0.75 });

    assert.deepEqual(getEntityWorldPosition(child), { x: 6, y: 0, z: 0 });
    assert.equal(overlapsCollisionBodies(childBody, targetBody), true);
  });

  it('serializes and restores world snapshots with hierarchy and renderables', () => {
    const world = new World();
    world.camera.position.x = 10;
    const parent = world.createEntity({
      id: 'entity-7',
      name: 'Carrier',
      tags: ['vehicle', 'boss'],
      transform: { position: { x: 2, y: 0, z: 0 } },
    });
    world.createEntity({
      id: 'child',
      parent,
      transform: { position: { x: 0, y: 3, z: 0 } },
      renderable: {
        primitive: 'cube',
        material: { color: { x: 0.2, y: 0.4, z: 0.8 } },
      },
    });

    const snapshot = world.createWorldSnapshot();
    const restored = new World();
    restored.loadWorldSnapshot(snapshot);
    const restoredParent = restored.getEntity('entity-7');
    const restoredChild = restored.getEntity('child');
    const generated = restored.createEntity();

    assert.ok(restoredParent);
    assert.equal(snapshot.entities.find((entity) => entity.id === 'child')?.parentId, 'entity-7');
    assert.deepEqual(snapshot.entities.find((entity) => entity.id === 'entity-7')?.tags, ['vehicle', 'boss']);
    assert.equal(restored.camera.position.x, 10);
    assert.equal(restored.getEntity('entity-7')?.name, 'Carrier');
    assert.equal(restored.hasTag(restoredParent, 'vehicle'), true);
    assert.deepEqual(restored.queryEntitiesByTag('boss'), [restoredParent]);
    assert.equal(restoredChild?.parent, restoredParent);
    assert.deepEqual(restoredParent?.children, [restoredChild]);
    assert.deepEqual(restoredChild?.renderable?.material.color, { x: 0.2, y: 0.4, z: 0.8 });
    assert.deepEqual(restoredChild ? restored.getWorldPosition(restoredChild) : null, { x: 2, y: 3, z: 0 });
    assert.equal(generated.id, 'entity-8');
  });

  it('manages entity tags through world APIs', () => {
    const world = new World();
    const player = world.createEntity({ id: 'player', tags: ['actor'] });
    const enemy = world.createEntity({ id: 'enemy' });

    world.addTag(enemy, 'actor');
    world.addTag(enemy, 'hostile');
    world.removeTag(player, 'actor');

    assert.equal(world.hasTag(player, 'actor'), false);
    assert.equal(world.hasTag(enemy, 'hostile'), true);
    assert.deepEqual(world.queryEntitiesByTag('actor'), [enemy]);
  });
});
