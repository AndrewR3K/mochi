import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  World,
  canCollisionBodiesInteract,
  overlapsCollisionBodies,
  queryCollisionBodies,
  queryCollisionBodiesAtPoint,
  queryCollisionBodiesInSphere,
  queryCollisionPairs,
  queryTriggerPairs,
  setBoxCollisionBody,
  setSphereCollisionBody,
} from '../src';

describe('collision bodies', () => {
  it('uses entity scale for default box and sphere dimensions', () => {
    const world = new World();
    const box = world.createEntity({
      id: 'box',
      transform: { scale: { x: 2, y: 4, z: 6 } },
    });
    const sphere = world.createEntity({
      id: 'sphere',
      transform: { scale: { x: 3, y: 8, z: 5 } },
    });

    const boxBody = setBoxCollisionBody(box);
    const sphereBody = setSphereCollisionBody(sphere);

    assert.deepEqual(boxBody.shape, { kind: 'box', halfX: 1, halfY: 2, halfZ: 3 });
    assert.deepEqual(sphereBody.shape, { kind: 'sphere', radius: 4 });
  });

  it('detects box, sphere, and mixed overlaps', () => {
    const world = new World();
    const boxA = setBoxCollisionBody(world.createEntity({ id: 'box-a' }), { halfX: 1, halfY: 1, halfZ: 1 });
    const boxB = setBoxCollisionBody(world.createEntity({
      id: 'box-b',
      transform: { position: { x: 1.5, y: 0, z: 0 } },
    }), { halfX: 1, halfY: 1, halfZ: 1 });
    const sphere = setSphereCollisionBody(world.createEntity({
      id: 'sphere',
      transform: { position: { x: 0, y: 0, z: 1.25 } },
    }), { radius: 0.5 });
    const farSphere = setSphereCollisionBody(world.createEntity({
      id: 'far-sphere',
      transform: { position: { x: 10, y: 0, z: 0 } },
    }), { radius: 1 });

    assert.equal(overlapsCollisionBodies(boxA, boxB), true);
    assert.equal(overlapsCollisionBodies(boxA, sphere), true);
    assert.equal(overlapsCollisionBodies(sphere, farSphere), false);
  });

  it('queries collision and trigger pairs from entities', () => {
    const world = new World();
    const player = world.createEntity({ id: 'player' });
    const pickup = world.createEntity({ id: 'pickup' });
    const blocker = world.createEntity({
      id: 'blocker',
      transform: { position: { x: 5, y: 0, z: 0 } },
    });

    setSphereCollisionBody(player, { radius: 1 });
    setSphereCollisionBody(pickup, { radius: 1, trigger: true });
    setBoxCollisionBody(blocker, { halfX: 1, halfY: 1, halfZ: 1 });

    const bodies = queryCollisionBodies(world.allEntities());
    const pairs = queryCollisionPairs(bodies);
    const triggerPairs = queryTriggerPairs(bodies);

    assert.equal(bodies.length, 3);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].a.entity.id, 'player');
    assert.equal(pairs[0].b.entity.id, 'pickup');
    assert.equal(triggerPairs.length, 1);
  });

  it('filters collision pairs with layers and masks', () => {
    const world = new World();
    const playerLayer = 1;
    const enemyLayer = 1 << 1;
    const pickupLayer = 1 << 2;
    const player = setSphereCollisionBody(world.createEntity({ id: 'player' }), {
      radius: 1,
      layer: playerLayer,
      mask: enemyLayer | pickupLayer,
    });
    const enemy = setSphereCollisionBody(world.createEntity({ id: 'enemy' }), {
      radius: 1,
      layer: enemyLayer,
      mask: playerLayer,
    });
    const decoration = setSphereCollisionBody(world.createEntity({ id: 'decoration' }), {
      radius: 1,
      layer: pickupLayer,
      mask: 0,
    });

    const pairs = queryCollisionPairs(queryCollisionBodies(world.allEntities()));

    assert.equal(canCollisionBodiesInteract(player, enemy), true);
    assert.equal(canCollisionBodiesInteract(player, decoration), false);
    assert.equal(overlapsCollisionBodies(player, decoration), false);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].a.entity.id, 'player');
    assert.equal(pairs[0].b.entity.id, 'enemy');
  });

  it('queries collision bodies by point and sphere volume', () => {
    const world = new World();
    const terrainLayer = 1;
    const actorLayer = 1 << 1;
    const floor = setBoxCollisionBody(world.createEntity({
      id: 'floor',
      transform: { scale: { x: 10, y: 1, z: 10 } },
    }), {
      layer: terrainLayer,
      mask: actorLayer,
    });
    const unit = setSphereCollisionBody(world.createEntity({
      id: 'unit',
      transform: { position: { x: 3, y: 0, z: 0 } },
    }), {
      radius: 0.5,
      layer: actorLayer,
      mask: terrainLayer,
    });
    const bodies = [floor, unit];

    const pointHits = queryCollisionBodiesAtPoint(bodies, { x: 0, y: 0, z: 0 }, {
      layer: actorLayer,
      mask: terrainLayer,
    });
    const terrainHits = queryCollisionBodiesInSphere(bodies, { x: 2.25, y: 0, z: 0 }, 0.5, {
      layer: actorLayer,
      mask: terrainLayer,
    });
    const actorHits = queryCollisionBodiesInSphere(bodies, { x: 2.25, y: 0, z: 0 }, 0.5, {
      layer: terrainLayer,
      mask: actorLayer,
    });

    assert.deepEqual(pointHits.map((body) => body.entity.id), ['floor']);
    assert.deepEqual(terrainHits.map((body) => body.entity.id), ['floor']);
    assert.deepEqual(actorHits.map((body) => body.entity.id), ['unit']);
  });
});
