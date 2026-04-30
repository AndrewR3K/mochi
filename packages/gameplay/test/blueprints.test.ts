import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { instantiateEntityBlueprint } from '../src';
import { createHeadlessGame } from './headlessGame';

describe('entity blueprints', () => {
  it('instantiates reusable entity hierarchies', () => {
    const game = createHeadlessGame();
    const scene = game.createScene();
    const instance = instantiateEntityBlueprint(scene, {
      id: 'ship',
      name: 'Ship',
      tags: ['vehicle'],
      transform: { position: { x: 1, y: 2, z: 3 } },
      renderable: {
        primitive: 'cube',
        material: { color: { x: 0.2, y: 0.4, z: 1 } },
      },
      children: [
        {
          id: 'turret',
          tags: ['weapon'],
          transform: { position: { x: 0, y: 1, z: -0.5 } },
        },
      ],
    }, {
      idPrefix: 'player-',
    });

    const turret = game.world.getEntity('player-turret');

    assert.equal(instance.root.id, 'player-ship');
    assert.equal(instance.entities.length, 2);
    assert.equal(instance.root.name, 'Ship');
    assert.equal(game.world.hasTag(instance.root, 'vehicle'), true);
    assert.equal(turret?.parent, instance.root);
    assert.deepEqual(turret ? game.world.getWorldPosition(turret) : null, { x: 1, y: 3, z: 2.5 });
  });
});
