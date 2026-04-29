import {
  createComponentType,
  getComponent,
  setComponent,
  type ComponentType,
} from './components';
import type { Entity } from './world';

export type CollisionShapeKind = 'box' | 'sphere';

export interface BoxCollisionShape {
  kind: 'box';
  halfX: number;
  halfY: number;
  halfZ: number;
}

export interface SphereCollisionShape {
  kind: 'sphere';
  radius: number;
}

export type CollisionShape = BoxCollisionShape | SphereCollisionShape;

export interface CollisionBody {
  entity: Entity;
  shape: CollisionShape;
  trigger: boolean;
}

export interface BoxCollisionOptions {
  halfX?: number;
  halfY?: number;
  halfZ?: number;
  trigger?: boolean;
}

export interface SphereCollisionOptions {
  radius?: number;
  trigger?: boolean;
}

export interface CollisionPair {
  a: CollisionBody;
  b: CollisionBody;
}

export const collisionBody: ComponentType<CollisionBody> =
  createComponentType<CollisionBody>('runtime.collisionBody');

export function setBoxCollisionBody(
  entity: Entity,
  options: BoxCollisionOptions = {},
): CollisionBody {
  return setComponent(entity, collisionBody, createBoxCollisionBody(entity, options));
}

export function setSphereCollisionBody(
  entity: Entity,
  options: SphereCollisionOptions = {},
): CollisionBody {
  return setComponent(entity, collisionBody, createSphereCollisionBody(entity, options));
}

export function getCollisionBody(entity: Entity): CollisionBody | undefined {
  return getComponent(entity, collisionBody);
}

export function createBoxCollisionBody(
  entity: Entity,
  options: BoxCollisionOptions = {},
): CollisionBody {
  return {
    entity,
    shape: {
      kind: 'box',
      halfX: options.halfX ?? entity.transform.scale.x / 2,
      halfY: options.halfY ?? entity.transform.scale.y / 2,
      halfZ: options.halfZ ?? entity.transform.scale.z / 2,
    },
    trigger: options.trigger ?? false,
  };
}

export function createSphereCollisionBody(
  entity: Entity,
  options: SphereCollisionOptions = {},
): CollisionBody {
  return {
    entity,
    shape: {
      kind: 'sphere',
      radius: options.radius ?? Math.max(
        entity.transform.scale.x,
        entity.transform.scale.y,
        entity.transform.scale.z,
      ) / 2,
    },
    trigger: options.trigger ?? false,
  };
}

export function overlapsCollisionBodies(a: CollisionBody, b: CollisionBody): boolean {
  if (a.shape.kind === 'box') {
    if (b.shape.kind === 'box') {
      return overlapsBoxes(a.entity, a.shape, b.entity, b.shape);
    }

    return overlapsBoxSphere(a.entity, a.shape, b.entity, b.shape);
  }

  if (b.shape.kind === 'sphere') {
    return overlapsSpheres(a.entity, a.shape, b.entity, b.shape);
  }

  return overlapsBoxSphere(b.entity, b.shape, a.entity, a.shape);
}

export function queryCollisionBodies(entities: Iterable<Entity>): CollisionBody[] {
  const bodies: CollisionBody[] = [];

  for (const entity of entities) {
    const body = getCollisionBody(entity);
    if (body) bodies.push(body);
  }

  return bodies;
}

export function queryCollisionPairs(bodies: readonly CollisionBody[]): CollisionPair[] {
  const pairs: CollisionPair[] = [];

  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      if (overlapsCollisionBodies(bodies[i], bodies[j])) {
        pairs.push({ a: bodies[i], b: bodies[j] });
      }
    }
  }

  return pairs;
}

export function queryTriggerPairs(bodies: readonly CollisionBody[]): CollisionPair[] {
  return queryCollisionPairs(bodies).filter((pair) => pair.a.trigger || pair.b.trigger);
}

function overlapsBoxes(
  a: Entity,
  aShape: BoxCollisionShape,
  b: Entity,
  bShape: BoxCollisionShape,
): boolean {
  const aPosition = a.transform.position;
  const bPosition = b.transform.position;

  return (
    Math.abs(aPosition.x - bPosition.x) < aShape.halfX + bShape.halfX &&
    Math.abs(aPosition.y - bPosition.y) < aShape.halfY + bShape.halfY &&
    Math.abs(aPosition.z - bPosition.z) < aShape.halfZ + bShape.halfZ
  );
}

function overlapsSpheres(
  a: Entity,
  aShape: SphereCollisionShape,
  b: Entity,
  bShape: SphereCollisionShape,
): boolean {
  const aPosition = a.transform.position;
  const bPosition = b.transform.position;
  const radius = aShape.radius + bShape.radius;

  return distanceSquared(
    aPosition.x - bPosition.x,
    aPosition.y - bPosition.y,
    aPosition.z - bPosition.z,
  ) < radius * radius;
}

function overlapsBoxSphere(
  box: Entity,
  boxShape: BoxCollisionShape,
  sphere: Entity,
  sphereShape: SphereCollisionShape,
): boolean {
  const boxPosition = box.transform.position;
  const spherePosition = sphere.transform.position;
  const closestX = clamp(spherePosition.x, boxPosition.x - boxShape.halfX, boxPosition.x + boxShape.halfX);
  const closestY = clamp(spherePosition.y, boxPosition.y - boxShape.halfY, boxPosition.y + boxShape.halfY);
  const closestZ = clamp(spherePosition.z, boxPosition.z - boxShape.halfZ, boxPosition.z + boxShape.halfZ);

  return distanceSquared(
    spherePosition.x - closestX,
    spherePosition.y - closestY,
    spherePosition.z - closestZ,
  ) < sphereShape.radius * sphereShape.radius;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distanceSquared(x: number, y: number, z: number): number {
  return x * x + y * y + z * z;
}
