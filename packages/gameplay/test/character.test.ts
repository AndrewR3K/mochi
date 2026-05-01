import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCharacterMotor } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('character motors', () => {
  it('moves characters horizontally and rotates toward travel direction', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({ id: 'character' });
    const motor = createCharacterMotor({ target });

    motor.step({
      delta: 0.5,
      move: { x: 1, z: 0 },
      speed: 4,
    });

    assert.equal(target.transform.position.x, 2);
    assert.equal(target.transform.position.z, 0);
    assert.equal(target.transform.rotation.y, Math.PI / 2);
    assert.equal(motor.state.grounded, true);
  });

  it('supports jump counts, gravity, and reset', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({ id: 'jumper' });
    const motor = createCharacterMotor({
      target,
      gravity: 10,
      jumpVelocity: 5,
      maxJumps: 1,
    });

    motor.step({ delta: 0.1, jump: true });

    assert.equal(motor.state.grounded, false);
    assert.equal(motor.state.jumpsRemaining, 0);
    assert.equal(motor.state.verticalVelocity, 4);
    assert.equal(target.transform.position.y, 0.4);

    motor.reset();

    assert.equal(motor.state.grounded, true);
    assert.equal(motor.state.jumpsRemaining, 1);
    assert.equal(motor.state.verticalVelocity, 0);
  });

  it('uses dynamic ground height and clamps movement bounds', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({
      id: 'bounded',
      transform: { position: { x: 0, y: 3, z: 0 } },
    });
    const motor = createCharacterMotor({
      target,
      gravity: 20,
      resolveGroundHeight: () => 1.25,
      bounds: { minX: -1, maxX: 1, minZ: -2, maxZ: 2 },
    });

    motor.step({
      delta: 1,
      move: { x: 10, z: -10 },
      speed: 10,
    });

    assert.equal(target.transform.position.x, 1);
    assert.equal(target.transform.position.z, -2);
    assert.equal(target.transform.position.y, 1.25);
    assert.equal(motor.state.grounded, true);
  });
});
