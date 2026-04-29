import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONTROLLER_PRESET_KINDS,
  createControllerPreset,
  createThirdPersonController,
  createThirdPersonOrbitController,
  createVehicleArcadeController,
} from '../src';
import { createHeadlessGame } from './headlessGame';

describe('controller presets', () => {
  it('creates every public preset kind as a disposable controller', () => {
    const game = createHeadlessGame();

    for (const kind of CONTROLLER_PRESET_KINDS) {
      const target = game.world.createEntity({ id: kind });
      const controller = createControllerPreset(game, kind, { target });

      controller.reset();
      controller.dispose();
    }

    assert.equal(CONTROLLER_PRESET_KINDS.length, 10);
  });

  it('moves third-person targets from configured input bindings', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({ id: 'player' });
    const controller = createThirdPersonOrbitController(game, {
      target,
      input: {
        forward: 'KeyI',
      },
    });

    game.runtime.inputWriter.setKey('KeyI', true);
    game.runtime.tick(0.1);
    controller.dispose();
    game.runtime.tick(0.1);

    const movedZ = target.transform.position.z;
    assert.ok(movedZ < 0, `expected target to move forward, received z=${movedZ}`);
    assert.equal(target.transform.position.z, movedZ);
  });

  it('resets third-person jump state after the target returns to its scene start', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const target = scene.createEntity({ id: 'jumper' });
    const controller = scene.add(createThirdPersonController(game, {
      target,
      doubleJump: false,
    }));

    scene.addReset(controller.reset);
    game.runtime.inputWriter.setKey('Space', true);
    game.runtime.tick(0.1);
    game.runtime.inputWriter.setKey('Space', false);
    target.transform.position.y = 12;

    scene.reset();
    game.runtime.tick(0.1);

    assert.equal(target.transform.position.y, 0);
  });

  it('accelerates and resets vehicle arcade controllers', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({ id: 'vehicle' });
    const controller = createVehicleArcadeController(game, { target });

    game.runtime.inputWriter.setKey('KeyW', true);
    game.runtime.tick(0.25);

    assert.ok(controller.getSpeed() > 0);
    assert.ok(target.transform.position.z < 0);

    controller.reset();

    assert.equal(controller.getSpeed(), 0);
    assert.deepEqual(target.transform.position, { x: 0, y: 0, z: 0 });
    assert.equal(target.transform.rotation.y, 0);
  });
});
