import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createParticleEmitter } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('particle emitters', () => {
  it('emits pooled particles and scales them over their lifetime', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const emitter = createParticleEmitter({
      scene,
      maxParticles: 1,
      lifetime: 0.4,
      size: 2,
      endScale: 0,
    });

    const particle = emitter.emit({
      position: { x: 0, y: 1, z: 0 },
      velocity: { x: 0, y: 2, z: 0 },
    });

    assert.notEqual(particle, null);
    assert.equal(particle?.active, true);
    assert.equal(particle?.entity.transform.scale.x, 2);

    game.runtime.tick(0.2);

    assert.equal(particle?.entity.transform.position.y, 1.4);
    assert.equal(particle?.entity.transform.scale.x, 1);

    game.runtime.tick(0.21);

    assert.equal(particle?.active, false);
    assert.equal(particle?.entity.transform.scale.x, 0);
  });

  it('bursts particles with direction, speed, gravity, and drag', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const emitter = createParticleEmitter({
      scene,
      maxParticles: 3,
      gravity: { x: 0, y: -10, z: 0 },
      drag: 1,
      lifetime: 1,
    });

    const particles = emitter.burst(3, (index) => ({
      position: { x: index, y: 0, z: 0 },
      direction: { x: 0, y: 1, z: 0 },
      speed: 10,
    }));
    const overflow = emitter.emit({
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
    });

    game.runtime.tick(0.1);

    assert.equal(particles.length, 3);
    assert.equal(overflow, null);
    assert.ok(particles[0].velocity.y < 9);
    assert.ok(particles[0].entity.transform.position.y > 0);
    assert.equal(particles[1].entity.transform.position.x, 1);
  });

  it('resets active particles with the scene', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const emitter = createParticleEmitter({ scene });
    const particle = emitter.emit({
      position: { x: 1, y: 2, z: 3 },
      velocity: { x: 1, y: 0, z: 0 },
      color: { x: 0.2, y: 0.8, z: 1 },
    });

    scene.reset();

    assert.equal(particle?.active, false);
    assert.deepEqual(particle?.velocity, { x: 0, y: 0, z: 0 });
    assert.equal(particle?.entity.transform.scale.x, 0);
  });
});
