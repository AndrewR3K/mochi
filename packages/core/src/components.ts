import type { Entity } from './world';

export type ComponentId = string;
export type ComponentStore = Map<ComponentId, unknown>;

export interface ComponentType<T> {
  readonly id: ComponentId;
}

export interface EntityComponent<T> {
  entity: Entity;
  component: T;
}

export function createComponentType<T>(id: ComponentId): ComponentType<T> {
  return { id };
}

export function setComponent<T>(
  entity: Entity,
  type: ComponentType<T>,
  component: T,
): T {
  entity.components.set(type.id, component);
  return component;
}

export function getComponent<T>(
  entity: Entity,
  type: ComponentType<T>,
): T | undefined {
  return entity.components.get(type.id) as T | undefined;
}

export function hasComponent<T>(
  entity: Entity,
  type: ComponentType<T>,
): boolean {
  return entity.components.has(type.id);
}

export function removeComponent<T>(
  entity: Entity,
  type: ComponentType<T>,
): boolean {
  return entity.components.delete(type.id);
}

export function queryComponents<T>(
  entities: Iterable<Entity>,
  type: ComponentType<T>,
): EntityComponent<T>[] {
  const matches: EntityComponent<T>[] = [];

  for (const entity of entities) {
    const component = getComponent(entity, type);
    if (component === undefined) continue;

    matches.push({ entity, component });
  }

  return matches;
}
