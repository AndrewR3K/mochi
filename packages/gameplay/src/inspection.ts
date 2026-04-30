import {
  queryCollisionBodies,
  queryCollisionPairs,
  queryTriggerPairs,
  type WorldSnapshot,
} from '@mochi-labs/core';

import type { Game } from './game';

export interface TagInspection {
  tag: string;
  count: number;
}

export interface GameInspectionSnapshot {
  world: WorldSnapshot;
  entityCount: number;
  rootCount: number;
  renderableCount: number;
  collisionBodyCount: number;
  collisionPairCount: number;
  triggerPairCount: number;
  tags: TagInspection[];
}

export function createGameInspectionSnapshot(game: Game): GameInspectionSnapshot {
  const world = game.world.createWorldSnapshot();
  const bodies = queryCollisionBodies(game.world.allEntities());
  const tagCounts = new Map<string, number>();
  let rootCount = 0;
  let renderableCount = 0;

  for (const entity of world.entities) {
    if (!entity.parentId) rootCount += 1;
    if (entity.renderable) renderableCount += 1;

    for (const tag of entity.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return {
    world,
    entityCount: world.entities.length,
    rootCount,
    renderableCount,
    collisionBodyCount: bodies.length,
    collisionPairCount: queryCollisionPairs(bodies).length,
    triggerPairCount: queryTriggerPairs(bodies).length,
    tags: [...tagCounts]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag)),
  };
}
