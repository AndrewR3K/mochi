import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createDamageZone,
  createTriggerVolume,
  setSphereCollisionBody,
} from '../src';
import { createHeadlessGame } from './headlessGame';

describe('trigger volumes', () => {
  it('emits enter, stay, and exit events for overlapping collision bodies', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const target = scene.createEntity({
      id: 'target',
      transform: { position: { x: 4, y: 0, z: 0 } },
    });
    const events: string[] = [];

    setSphereCollisionBody(target, { radius: 0.5 });
    createTriggerVolume({
      scene,
      targets: () => [target],
      shape: { kind: 'sphere', radius: 1 },
      onEnter: () => events.push('enter'),
      onStay: () => events.push('stay'),
      onExit: () => events.push('exit'),
    });

    game.runtime.tick(0.1);
    target.transform.position.x = 0.5;
    game.runtime.tick(0.1);
    game.runtime.tick(0.1);
    target.transform.position.x = 4;
    game.runtime.tick(0.1);

    assert.deepEqual(events, ['enter', 'stay', 'exit']);
  });

  it('applies damage on an interval while targets remain inside', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const target = scene.createEntity({
      id: 'target',
      transform: { position: { x: 0.25, y: 0, z: 0 } },
    });
    const damageEvents: number[] = [];

    setSphereCollisionBody(target, { radius: 0.5 });
    createDamageZone({
      scene,
      targets: () => [target],
      shape: { kind: 'sphere', radius: 1 },
      damage: 12,
      interval: 0.5,
      onDamage: ({ damage }) => {
        damageEvents.push(damage);
      },
    });

    game.runtime.tick(0.1);
    game.runtime.tick(0.2);
    game.runtime.tick(0.3);

    assert.deepEqual(damageEvents, [12, 12]);
  });
});
