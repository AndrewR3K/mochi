import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONTROLLER_PRESET_KINDS,
  createControllerPreset,
  createSpaceflightArcadeController,
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

    assert.equal(CONTROLLER_PRESET_KINDS.length, 11);
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

  it('keeps the isometric preset camera above the target with fixed diagonal framing', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({
      id: 'iso',
      transform: { position: { x: 0, y: 0.7, z: 0 } },
    });
    const controller = createControllerPreset(game, 'isometric', {
      target,
      bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    });

    for (let i = 0; i < 120; i += 1) {
      game.runtime.tick(1 / 60);
    }

    assert.ok(game.world.camera.position.y > game.world.camera.target.y + 2);
    assert.ok(game.world.camera.position.x < target.transform.position.x);
    assert.ok(game.world.camera.position.z > target.transform.position.z);
    controller.dispose();
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

  it('steers vehicle movement from front-wheel angle while staying on groundY', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({ id: 'vehicle' });
    const controller = createVehicleArcadeController(game, {
      target,
      groundY: 1.25,
    });

    game.runtime.inputWriter.setKey('KeyW', true);
    game.runtime.inputWriter.setKey('KeyD', true);
    for (let i = 0; i < 24; i += 1) {
      game.runtime.tick(1 / 60);
    }

    assert.ok(controller.getSteerAngle() > 0);
    assert.ok(target.transform.rotation.y > 0);
    assert.ok(target.transform.position.x > 0.02);
    assert.equal(target.transform.position.y, 1.25);
  });

  it('flies spaceflight controllers in open 3D space', () => {
    const game = createHeadlessGame();
    const target = game.world.createEntity({ id: 'ship' });
    const controller = createSpaceflightArcadeController(game, { target });

    game.runtime.inputWriter.setKey('KeyW', true);
    game.runtime.inputWriter.setKey('KeyD', true);
    game.runtime.inputWriter.setKey('Space', true);
    game.runtime.tick(0.25);

    assert.ok(controller.getSpeed() > 0);
    assert.ok(target.transform.position.y > 0);
    assert.ok(target.transform.position.z < 0);
    assert.ok(target.transform.rotation.y > 0);

    controller.reset();

    assert.equal(controller.getSpeed(), 0);
    assert.deepEqual(controller.velocity, { x: 0, y: 0, z: 0 });
    assert.deepEqual(target.transform.position, { x: 0, y: 0, z: 0 });
    assert.deepEqual(target.transform.rotation, { x: 0, y: 0, z: 0 });
  });
});
