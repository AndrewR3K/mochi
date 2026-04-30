import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createSceneScheduler } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('scene scheduler', () => {
  it('runs delayed and interval tasks through scene frames', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const scheduler = createSceneScheduler(scene);
    const events: string[] = [];

    scheduler.delay(0.3, () => events.push('delay'));
    scheduler.interval(0.2, ({ executions }) => events.push(`interval-${executions}`));

    game.runtime.tick(0.1);
    game.runtime.tick(0.1);
    game.runtime.tick(0.1);
    game.runtime.tick(0.1);

    assert.deepEqual(events, ['interval-1', 'delay', 'interval-2']);
  });

  it('clears scheduled tasks when scenes reset or dispose', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const scheduler = createSceneScheduler(scene);
    let count = 0;

    scheduler.interval(0.1, () => {
      count += 1;
    });
    game.runtime.tick(0.1);
    scene.reset();
    game.runtime.tick(0.1);
    scheduler.interval(0.1, () => {
      count += 10;
    });
    scene.dispose();
    game.runtime.tick(0.1);

    assert.equal(count, 1);
  });
});
