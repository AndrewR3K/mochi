import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createProjectileEmitter, type ProjectileHit } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('projectile emitters', () => {
  it('fires pooled projectiles and expires them after their lifetime', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const emitter = createProjectileEmitter({
      scene,
      maxProjectiles: 1,
      speed: 10,
      lifetime: 0.2,
    });

    const projectile = emitter.fire({
      position: { x: 0, y: 0, z: 0 },
      direction: { x: 0, y: 0, z: -1 },
    });

    assert.notEqual(projectile, null);
    assert.equal(projectile?.active, true);
    game.runtime.tick(0.1);
    assert.equal(projectile?.entity.transform.position.z, -1);
    game.runtime.tick(0.11);
    assert.equal(projectile?.active, false);
    assert.equal(projectile?.entity.transform.scale.x, 0);
  });

  it('emits target hits and deactivates projectiles', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const target = scene.createEntity({
      id: 'target',
      transform: { position: { x: 0, y: 0, z: -2 } },
    });
    const hits: ProjectileHit[] = [];
    let targetHit = 0;
    const emitter = createProjectileEmitter({
      scene,
      speed: 10,
      lifetime: 1,
      targets: () => [
        {
          entity: target,
          radius: 0.5,
          onHit: () => {
            targetHit += 1;
          },
        },
      ],
    });
    emitter.hits.on((hit) => hits.push(hit));

    const projectile = emitter.fire({
      position: { x: 0, y: 0, z: 0 },
      direction: { x: 0, y: 0, z: -1 },
      radius: 0.2,
    });
    game.runtime.tick(0.2);

    assert.equal(projectile?.active, false);
    assert.equal(targetHit, 1);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].target.entity, target);
  });

  it('resets active projectiles with the scene', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const emitter = createProjectileEmitter({ scene });
    const projectile = emitter.fire({
      position: { x: 1, y: 2, z: 3 },
      direction: { x: 1, y: 0, z: 0 },
    });

    scene.reset();

    assert.equal(projectile?.active, false);
    assert.deepEqual(projectile?.velocity, { x: 0, y: 0, z: 0 });
    assert.equal(projectile?.entity.transform.scale.x, 0);
  });
});
