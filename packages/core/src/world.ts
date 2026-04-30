import {
  composeTransform,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
  transform,
  vec3,
  type Mat4,
  type Transform,
  type Vec3,
} from './math';
import type { ComponentStore } from './components';

export type EntityId = string;
export type PrimitiveKind = 'cube' | 'plane';

export interface Material {
  color: Vec3;
}

export interface Renderable {
  primitive: PrimitiveKind;
  material: Material;
}

export interface Entity {
  id: EntityId;
  name?: string;
  transform: Transform;
  parent: Entity | null;
  readonly children: readonly Entity[];
  readonly tags: ReadonlySet<string>;
  readonly components: ComponentStore;
  renderable?: Renderable;
}

export interface EntityOptions {
  id?: EntityId;
  name?: string;
  tags?: Iterable<string>;
  transform?: Partial<Transform>;
  parent?: Entity | null;
  renderable?: Renderable;
}

export interface Camera {
  position: Vec3;
  target: Vec3;
  fov: number;
  near: number;
  far: number;
}

export interface RenderObjectSnapshot {
  id: EntityId;
  primitive: PrimitiveKind;
  color: Vec3;
  worldMatrix: Mat4;
}

export interface RenderSnapshot {
  viewProjectionMatrix: Mat4;
  objects: RenderObjectSnapshot[];
}

export interface WorldEntitySnapshot {
  id: EntityId;
  name?: string;
  tags: string[];
  parentId: EntityId | null;
  childIds: EntityId[];
  transform: Transform;
  worldPosition: Vec3;
  renderable?: Renderable;
}

export interface WorldSnapshot {
  camera: Camera;
  entities: WorldEntitySnapshot[];
}

interface EntityRecord extends Entity {
  children: EntityRecord[];
  tags: Set<string>;
}

export class World {
  readonly camera: Camera = {
    position: vec3(0, 2, 6),
    target: vec3(0, 0.4, 0),
    fov: Math.PI / 4,
    near: 0.1,
    far: 2000,
  };

  private readonly entities = new Map<EntityId, EntityRecord>();
  private nextId = 1;

  createEntity(options: EntityOptions = {}): Entity {
    const id = options.id ?? `entity-${this.nextId++}`;
    if (this.entities.has(id)) {
      throw new Error(`Entity "${id}" already exists.`);
    }

    const entity: EntityRecord = {
      id,
      name: options.name,
      transform: transform(options.transform),
      parent: null,
      children: [],
      tags: new Set(options.tags),
      components: new Map(),
      renderable: options.renderable,
    };

    this.entities.set(entity.id, entity);
    if (options.parent) {
      this.setParent(entity, options.parent);
    }
    return entity;
  }

  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }

  removeEntity(id: EntityId): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    for (const child of [...entity.children]) {
      this.setParent(child, null);
    }

    this.setParent(entity, null);
    return this.entities.delete(id);
  }

  clear(): void {
    for (const entity of this.entities.values()) {
      entity.parent = null;
      entity.children.length = 0;
    }
    this.entities.clear();
    this.nextId = 1;
  }

  allEntities(): Iterable<Entity> {
    return this.entities.values();
  }

  addTag(entity: Entity, tag: string): void {
    this.getEntityRecord(entity).tags.add(tag);
  }

  removeTag(entity: Entity, tag: string): void {
    this.getEntityRecord(entity).tags.delete(tag);
  }

  hasTag(entity: Entity, tag: string): boolean {
    return this.getEntityRecord(entity).tags.has(tag);
  }

  queryEntitiesByTag(tag: string): Entity[] {
    const matches: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (entity.tags.has(tag)) matches.push(entity);
    }

    return matches;
  }

  setParent(entity: Entity, parent: Entity | null): void {
    const record = this.getEntityRecord(entity);

    const parentRecord = parent ? this.entities.get(parent.id) : null;
    if (parent && !parentRecord) {
      throw new Error(`Parent entity "${parent.id}" does not belong to this world.`);
    }

    let ancestor = parent;
    while (ancestor) {
      if (ancestor === entity) {
        throw new Error('Entity hierarchy cannot contain cycles.');
      }
      ancestor = ancestor.parent;
    }

    const previousParent = record.parent as EntityRecord | null;
    if (previousParent) {
      const index = previousParent.children.indexOf(record);
      if (index >= 0) previousParent.children.splice(index, 1);
    }

    record.parent = parentRecord ?? null;
    if (parentRecord) {
      parentRecord.children.push(record);
    }
  }

  getWorldMatrix(entity: Entity): Mat4 {
    return composeEntityWorldMatrix(entity);
  }

  getWorldPosition(entity: Entity): Vec3 {
    return getEntityWorldPosition(entity);
  }

  createRenderSnapshot(width: number, height: number): RenderSnapshot {
    const aspect = Math.max(1, width) / Math.max(1, height);
    const projection = mat4Perspective(
      this.camera.fov,
      aspect,
      this.camera.near,
      this.camera.far,
    );
    const view = mat4LookAt(this.camera.position, this.camera.target);
    const viewProjectionMatrix = mat4Multiply(projection, view);
    const objects: RenderObjectSnapshot[] = [];

    for (const entity of this.entities.values()) {
      if (!entity.renderable) continue;
      objects.push({
        id: entity.id,
        primitive: entity.renderable.primitive,
        color: entity.renderable.material.color,
        worldMatrix: composeEntityWorldMatrix(entity),
      });
    }

    return {
      viewProjectionMatrix,
      objects,
    };
  }

  createWorldSnapshot(): WorldSnapshot {
    const entities: WorldEntitySnapshot[] = [];

    for (const entity of this.entities.values()) {
      entities.push({
        id: entity.id,
        name: entity.name,
        tags: [...entity.tags],
        parentId: entity.parent?.id ?? null,
        childIds: entity.children.map((child) => child.id),
        transform: cloneTransform(entity.transform),
        worldPosition: getEntityWorldPosition(entity),
        renderable: entity.renderable ? cloneRenderable(entity.renderable) : undefined,
      });
    }

    return {
      camera: cloneCamera(this.camera),
      entities,
    };
  }

  loadWorldSnapshot(snapshot: WorldSnapshot): void {
    this.clear();
    copyVec3(snapshot.camera.position, this.camera.position);
    copyVec3(snapshot.camera.target, this.camera.target);
    this.camera.fov = snapshot.camera.fov;
    this.camera.near = snapshot.camera.near;
    this.camera.far = snapshot.camera.far;

    const created = new Map<EntityId, Entity>();
    for (const entitySnapshot of snapshot.entities) {
      const entity = this.createEntity({
        id: entitySnapshot.id,
        name: entitySnapshot.name,
        tags: entitySnapshot.tags,
        transform: cloneTransform(entitySnapshot.transform),
        renderable: entitySnapshot.renderable
          ? cloneRenderable(entitySnapshot.renderable)
          : undefined,
      });
      created.set(entity.id, entity);
    }

    for (const entitySnapshot of snapshot.entities) {
      if (!entitySnapshot.parentId) continue;

      const entity = created.get(entitySnapshot.id);
      const parent = created.get(entitySnapshot.parentId);
      if (entity && parent) {
        this.setParent(entity, parent);
      }
    }

    this.nextId = nextGeneratedId(snapshot.entities.map((entity) => entity.id));
  }

  private getEntityRecord(entity: Entity): EntityRecord {
    const record = this.entities.get(entity.id);
    if (!record) {
      throw new Error(`Entity "${entity.id}" does not belong to this world.`);
    }
    return record;
  }
}

export function composeEntityWorldMatrix(entity: Entity): Mat4 {
  let worldMatrix = composeTransform(entity.transform);
  let parent = entity.parent;

  while (parent) {
    worldMatrix = mat4Multiply(composeTransform(parent.transform), worldMatrix);
    parent = parent.parent;
  }

  return worldMatrix;
}

export function getEntityWorldPosition(entity: Entity): Vec3 {
  const matrix = composeEntityWorldMatrix(entity);
  return vec3(matrix[12], matrix[13], matrix[14]);
}

function cloneCamera(camera: Camera): Camera {
  return {
    position: { ...camera.position },
    target: { ...camera.target },
    fov: camera.fov,
    near: camera.near,
    far: camera.far,
  };
}

function cloneRenderable(renderable: Renderable): Renderable {
  return {
    primitive: renderable.primitive,
    material: {
      color: { ...renderable.material.color },
    },
  };
}

function cloneTransform(transform: Transform): Transform {
  return {
    position: { ...transform.position },
    rotation: { ...transform.rotation },
    scale: { ...transform.scale },
  };
}

function copyVec3(source: Vec3, target: Vec3): void {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
}

function nextGeneratedId(ids: readonly EntityId[]): number {
  let next = 1;

  for (const id of ids) {
    const match = /^entity-(\d+)$/.exec(id);
    if (match) {
      next = Math.max(next, Number(match[1]) + 1);
    }
  }

  return next;
}
