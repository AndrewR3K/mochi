import {
  createComponentType,
  getComponent,
  setComponent,
  type ComponentType,
} from './components';
import { getEntityWorldPosition, type Entity } from './world';
import type { Vec3 } from './math';

export type CollisionShapeKind = 'box' | 'sphere';
export type CollisionLayer = number;

export const DEFAULT_COLLISION_LAYER = 1;
export const DEFAULT_COLLISION_MASK = 0xffffffff;

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
  layer: CollisionLayer;
  mask: CollisionLayer;
}

export interface CollisionFilterOptions {
  layer?: CollisionLayer;
  mask?: CollisionLayer;
  trigger?: boolean;
}

export interface BoxCollisionOptions extends CollisionFilterOptions {
  halfX?: number;
  halfY?: number;
  halfZ?: number;
}

export interface SphereCollisionOptions extends CollisionFilterOptions {
  radius?: number;
}

export interface CollisionPair {
  a: CollisionBody;
  b: CollisionBody;
}

export interface CollisionQueryOptions extends CollisionFilterOptions {}

export interface CollisionRay {
  origin: Vec3;
  direction: Vec3;
}

export interface CollisionRayHit {
  body: CollisionBody;
  distance: number;
  point: Vec3;
}

export interface CollisionRayQueryOptions extends CollisionQueryOptions {
  maxDistance?: number;
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
    layer: options.layer ?? DEFAULT_COLLISION_LAYER,
    mask: options.mask ?? DEFAULT_COLLISION_MASK,
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
    layer: options.layer ?? DEFAULT_COLLISION_LAYER,
    mask: options.mask ?? DEFAULT_COLLISION_MASK,
  };
}

export function overlapsCollisionBodies(a: CollisionBody, b: CollisionBody): boolean {
  if (!canCollisionBodiesInteract(a, b)) return false;

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

export function canCollisionBodiesInteract(a: CollisionBody, b: CollisionBody): boolean {
  return (a.mask & b.layer) !== 0 && (b.mask & a.layer) !== 0;
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

export function queryCollisionBodiesInSphere(
  bodies: readonly CollisionBody[],
  center: Vec3,
  radius: number,
  options: CollisionQueryOptions = {},
): CollisionBody[] {
  return bodies.filter((body) =>
    canCollisionBodyMatchFilter(body, options) &&
    overlapsBodySphere(body, center, radius),
  );
}

export function queryCollisionBodiesAtPoint(
  bodies: readonly CollisionBody[],
  point: Vec3,
  options: CollisionQueryOptions = {},
): CollisionBody[] {
  return queryCollisionBodiesInSphere(bodies, point, 0, options);
}

export function queryCollisionBodiesAlongRay(
  bodies: readonly CollisionBody[],
  ray: CollisionRay,
  options: CollisionRayQueryOptions = {},
): CollisionRayHit[] {
  const direction = normalize(ray.direction);
  if (!direction) return [];

  const maxDistance = options.maxDistance ?? Infinity;
  const hits: CollisionRayHit[] = [];

  for (const body of bodies) {
    if (!canCollisionBodyMatchFilter(body, options)) continue;

    const distance = intersectBodyRay(body, ray.origin, direction);
    if (distance === null || distance > maxDistance) continue;

    hits.push({
      body,
      distance,
      point: {
        x: ray.origin.x + direction.x * distance,
        y: ray.origin.y + direction.y * distance,
        z: ray.origin.z + direction.z * distance,
      },
    });
  }

  return hits.sort((a, b) => a.distance - b.distance);
}

function overlapsBoxes(
  a: Entity,
  aShape: BoxCollisionShape,
  b: Entity,
  bShape: BoxCollisionShape,
): boolean {
  const aPosition = getEntityWorldPosition(a);
  const bPosition = getEntityWorldPosition(b);

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
  const aPosition = getEntityWorldPosition(a);
  const bPosition = getEntityWorldPosition(b);
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
  const boxPosition = getEntityWorldPosition(box);
  const spherePosition = getEntityWorldPosition(sphere);
  const closestX = clamp(spherePosition.x, boxPosition.x - boxShape.halfX, boxPosition.x + boxShape.halfX);
  const closestY = clamp(spherePosition.y, boxPosition.y - boxShape.halfY, boxPosition.y + boxShape.halfY);
  const closestZ = clamp(spherePosition.z, boxPosition.z - boxShape.halfZ, boxPosition.z + boxShape.halfZ);

  return distanceSquared(
    spherePosition.x - closestX,
    spherePosition.y - closestY,
    spherePosition.z - closestZ,
  ) < sphereShape.radius * sphereShape.radius;
}

function overlapsBodySphere(body: CollisionBody, center: Vec3, radius: number): boolean {
  if (body.shape.kind === 'sphere') {
    const bodyPosition = getEntityWorldPosition(body.entity);
    const combinedRadius = body.shape.radius + radius;
    return distanceSquared(
      bodyPosition.x - center.x,
      bodyPosition.y - center.y,
      bodyPosition.z - center.z,
    ) <= combinedRadius * combinedRadius;
  }

  const boxPosition = getEntityWorldPosition(body.entity);
  const closestX = clamp(center.x, boxPosition.x - body.shape.halfX, boxPosition.x + body.shape.halfX);
  const closestY = clamp(center.y, boxPosition.y - body.shape.halfY, boxPosition.y + body.shape.halfY);
  const closestZ = clamp(center.z, boxPosition.z - body.shape.halfZ, boxPosition.z + body.shape.halfZ);

  return distanceSquared(
    center.x - closestX,
    center.y - closestY,
    center.z - closestZ,
  ) <= radius * radius;
}

function canCollisionBodyMatchFilter(
  body: CollisionBody,
  options: CollisionQueryOptions,
): boolean {
  const layer = options.layer ?? DEFAULT_COLLISION_LAYER;
  const mask = options.mask ?? DEFAULT_COLLISION_MASK;
  return (mask & body.layer) !== 0 && (body.mask & layer) !== 0;
}

function intersectBodyRay(body: CollisionBody, origin: Vec3, direction: Vec3): number | null {
  if (body.shape.kind === 'sphere') {
    return intersectSphereRay(getEntityWorldPosition(body.entity), body.shape.radius, origin, direction);
  }

  const center = getEntityWorldPosition(body.entity);
  return intersectBoxRay(
    {
      x: center.x - body.shape.halfX,
      y: center.y - body.shape.halfY,
      z: center.z - body.shape.halfZ,
    },
    {
      x: center.x + body.shape.halfX,
      y: center.y + body.shape.halfY,
      z: center.z + body.shape.halfZ,
    },
    origin,
    direction,
  );
}

function intersectSphereRay(
  center: Vec3,
  radius: number,
  origin: Vec3,
  direction: Vec3,
): number | null {
  const ox = origin.x - center.x;
  const oy = origin.y - center.y;
  const oz = origin.z - center.z;
  const b = ox * direction.x + oy * direction.y + oz * direction.z;
  const c = distanceSquared(ox, oy, oz) - radius * radius;
  const discriminant = b * b - c;

  if (discriminant < 0) return null;

  const root = Math.sqrt(discriminant);
  const near = -b - root;
  if (near >= 0) return near;

  const far = -b + root;
  return far >= 0 ? far : null;
}

function intersectBoxRay(min: Vec3, max: Vec3, origin: Vec3, direction: Vec3): number | null {
  let near = -Infinity;
  let far = Infinity;

  const x = intersectAxis(origin.x, direction.x, min.x, max.x, near, far);
  if (!x) return null;
  near = x.near;
  far = x.far;

  const y = intersectAxis(origin.y, direction.y, min.y, max.y, near, far);
  if (!y) return null;
  near = y.near;
  far = y.far;

  const z = intersectAxis(origin.z, direction.z, min.z, max.z, near, far);
  if (!z) return null;
  near = z.near;
  far = z.far;

  if (far < 0) return null;
  return near >= 0 ? near : far;
}

function intersectAxis(
  origin: number,
  direction: number,
  min: number,
  max: number,
  currentNear: number,
  currentFar: number,
): { near: number; far: number } | null {
  if (direction === 0) {
    return origin < min || origin > max
      ? null
      : { near: currentNear, far: currentFar };
  }

  const inverse = 1 / direction;
  let near = (min - origin) * inverse;
  let far = (max - origin) * inverse;

  if (near > far) {
    const swap = near;
    near = far;
    far = swap;
  }

  near = Math.max(currentNear, near);
  far = Math.min(currentFar, far);

  return near > far ? null : { near, far };
}

function normalize(vector: Vec3): Vec3 | null {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (length === 0) return null;

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distanceSquared(x: number, y: number, z: number): number {
  return x * x + y * y + z * z;
}
