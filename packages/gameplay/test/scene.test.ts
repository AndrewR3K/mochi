import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { disposeScene, mountScene } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('game scenes', () => {
  it('owns created entities and restores their initial transforms on reset', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    let resetCount = 0;
    const player = scene.createEntity({
      id: 'player',
      transform: {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0.1, y: 0.2, z: 0.3 },
        scale: { x: 2, y: 3, z: 4 },
      },
    });

    scene.addReset(() => {
      resetCount += 1;
    });
    player.transform.position.x = 20;
    player.transform.rotation.y = 1.5;
    player.transform.scale.z = 9;

    scene.reset();

    assert.equal(resetCount, 1);
    assert.deepEqual(player.transform.position, { x: 1, y: 2, z: 3 });
    assert.deepEqual(player.transform.rotation, { x: 0.1, y: 0.2, z: 0.3 });
    assert.deepEqual(player.transform.scale, { x: 2, y: 3, z: 4 });
  });

  it('disposes listeners, disposables, cleanups, and owned entities once', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const cleanupOrder: string[] = [];
    let frames = 0;

    scene.createEntity({ id: 'owned' });
    game.world.createEntity({ id: 'external' });
    scene.onFrame(() => {
      frames += 1;
    });
    scene.add({ dispose: () => cleanupOrder.push('disposable') });
    scene.addCleanup(() => cleanupOrder.push('cleanup'));

    game.runtime.tick(0.016);
    scene.dispose();
    scene.dispose();
    game.runtime.tick(0.016);

    assert.equal(frames, 1);
    assert.deepEqual(cleanupOrder, ['cleanup', 'disposable']);
    assert.equal(game.world.getEntity('owned'), undefined);
    assert.notEqual(game.world.getEntity('external'), undefined);
    assert.equal(scene.entities.length, 0);
  });

  it('mountScene returns setup results and forwards reset/dispose', () => {
    const game = createHeadlessGame();
    let resets = 0;
    const mounted = mountScene(game, (scene) => {
      const entity = scene.createEntity({ id: 'mounted' });
      scene.addReset(() => {
        resets += 1;
      });
      return { entity };
    });

    mounted.result.entity.transform.position.x = 5;
    mounted.reset();
    mounted.dispose();

    assert.equal(resets, 1);
    assert.equal(mounted.result.entity.transform.position.x, 0);
    assert.equal(game.world.getEntity('mounted'), undefined);
  });

  it('disposeScene delegates to scene disposal', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();

    scene.createEntity({ id: 'owned' });
    disposeScene(scene);

    assert.equal(game.world.getEntity('owned'), undefined);
  });
});
