import type { Entity, EntityOptions } from '@mochi/core';

import type { GameScene } from './scene';

export interface EntityBlueprint extends Omit<EntityOptions, 'parent'> {
  children?: EntityBlueprint[];
}

export interface EntityBlueprintInstance {
  root: Entity;
  entities: Entity[];
}

export interface EntityBlueprintOptions {
  idPrefix?: string;
}

export function instantiateEntityBlueprint(
  scene: GameScene,
  blueprint: EntityBlueprint,
  options: EntityBlueprintOptions = {},
): EntityBlueprintInstance {
  const entities: Entity[] = [];
  const root = instantiate(scene, blueprint, null, options.idPrefix, entities);

  return {
    root,
    entities,
  };
}

function instantiate(
  scene: GameScene,
  blueprint: EntityBlueprint,
  parent: Entity | null,
  idPrefix: string | undefined,
  entities: Entity[],
): Entity {
  const entity = scene.createEntity({
    id: blueprint.id ? `${idPrefix ?? ''}${blueprint.id}` : undefined,
    name: blueprint.name,
    tags: blueprint.tags,
    transform: blueprint.transform,
    parent,
    renderable: blueprint.renderable ? cloneRenderable(blueprint.renderable) : undefined,
  });

  entities.push(entity);

  for (const child of blueprint.children ?? []) {
    instantiate(scene, child, entity, idPrefix, entities);
  }

  return entity;
}

function cloneRenderable(renderable: NonNullable<EntityOptions['renderable']>): NonNullable<EntityOptions['renderable']> {
  return {
    primitive: renderable.primitive,
    material: {
      color: { ...renderable.material.color },
    },
  };
}
