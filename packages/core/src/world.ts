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
  transform: Transform;
  readonly components: ComponentStore;
  renderable?: Renderable;
}

export interface EntityOptions {
  id?: EntityId;
  transform?: Partial<Transform>;
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

export class World {
  readonly camera: Camera = {
    position: vec3(0, 2, 6),
    target: vec3(0, 0.4, 0),
    fov: Math.PI / 4,
    near: 0.1,
    far: 2000,
  };

  private readonly entities = new Map<EntityId, Entity>();
  private nextId = 1;

  createEntity(options: EntityOptions = {}): Entity {
    const entity: Entity = {
      id: options.id ?? `entity-${this.nextId++}`,
      transform: transform(options.transform),
      components: new Map(),
      renderable: options.renderable,
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }

  removeEntity(id: EntityId): boolean {
    return this.entities.delete(id);
  }

  clear(): void {
    this.entities.clear();
  }

  allEntities(): Iterable<Entity> {
    return this.entities.values();
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
        worldMatrix: composeTransform(entity.transform),
      });
    }

    return {
      viewProjectionMatrix,
      objects,
    };
  }
}
