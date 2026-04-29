import type { Entity } from '@mochi/core';

export interface BoxCollider {
  entity: Entity;
  halfX: number;
  halfZ: number;
  topY: number;
  passY?: number;
  standable?: boolean;
}

export interface BoxColliderOptions {
  halfX?: number;
  halfZ?: number;
  topY?: number;
  passY?: number;
  standable?: boolean;
}

export interface ResolveBoxCollisionOptions {
  radius?: number;
  topSnapDistance?: number;
}

export interface ResolveGroundHeightOptions {
  baseY: number;
  radius?: number;
  snapDistance?: number;
}

export interface MoveWithBoxCollisionsOptions {
  radius?: number;
  stepDistance?: number;
}

export function createBoxCollider(
  entity: Entity,
  options: BoxColliderOptions = {},
): BoxCollider {
  return {
    entity,
    halfX: options.halfX ?? entity.transform.scale.x / 2,
    halfZ: options.halfZ ?? entity.transform.scale.z / 2,
    topY: options.topY ?? entity.transform.position.y + entity.transform.scale.y / 2 + 0.001,
    passY: options.passY,
    standable: options.standable,
  };
}

export function distance2d(a: Entity, b: Entity): number {
  return Math.hypot(
    a.transform.position.x - b.transform.position.x,
    a.transform.position.z - b.transform.position.z,
  );
}

export function horizontalRadius(entity: Entity): number {
  return Math.min(entity.transform.scale.x, entity.transform.scale.z) * 0.5;
}

export function overlapsBoxFootprint(
  entity: Entity,
  collider: BoxCollider,
  radius = horizontalRadius(entity),
): boolean {
  const dx = Math.abs(entity.transform.position.x - collider.entity.transform.position.x);
  const dz = Math.abs(entity.transform.position.z - collider.entity.transform.position.z);
  return collider.halfX + radius - dx > 0 && collider.halfZ + radius - dz > 0;
}

export function resolveBoxCollisions(
  entity: Entity,
  colliders: BoxCollider[],
  options: ResolveBoxCollisionOptions = {},
): void {
  const radius = options.radius ?? horizontalRadius(entity);
  const topSnapDistance = options.topSnapDistance ?? 0.14;

  for (const collider of colliders) {
    if (collider.passY !== undefined && entity.transform.position.y > collider.passY) continue;

    const dx = entity.transform.position.x - collider.entity.transform.position.x;
    const dz = entity.transform.position.z - collider.entity.transform.position.z;
    const overlapX = collider.halfX + radius - Math.abs(dx);
    const overlapZ = collider.halfZ + radius - Math.abs(dz);

    if (overlapX <= 0 || overlapZ <= 0) continue;

    if (collider.standable) {
      const standingY = collider.topY + entity.transform.scale.y * 0.5;
      if (entity.transform.position.y >= standingY - topSnapDistance) continue;
    }

    if (overlapX < overlapZ) {
      entity.transform.position.x += Math.sign(dx || 1) * overlapX;
    } else {
      entity.transform.position.z += Math.sign(dz || 1) * overlapZ;
    }
  }
}

export function resolveGroundHeight(
  entity: Entity,
  colliders: BoxCollider[],
  options: ResolveGroundHeightOptions,
): number {
  const radius = options.radius ?? horizontalRadius(entity);
  const snapDistance = options.snapDistance ?? 0.55;
  const halfHeight = entity.transform.scale.y * 0.5;
  let height = options.baseY;

  for (const collider of colliders) {
    if (!collider.standable || !overlapsBoxFootprint(entity, collider, radius)) continue;

    const standingY = collider.topY + halfHeight;
    if (entity.transform.position.y < standingY - snapDistance) continue;

    height = Math.max(height, standingY);
  }

  return height;
}

export function moveWithBoxCollisions(
  entity: Entity,
  targetX: number,
  targetZ: number,
  colliders: BoxCollider[],
  options: MoveWithBoxCollisionsOptions = {},
): void {
  const radius = options.radius ?? horizontalRadius(entity);
  const stepDistance = options.stepDistance ?? 0.12;
  const startX = entity.transform.position.x;
  const startZ = entity.transform.position.z;
  const dx = targetX - startX;
  const dz = targetZ - startZ;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / stepDistance));

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const nextX = startX + dx * t;
    const nextZ = startZ + dz * t;

    if (overlapsAnyBox(entity, nextX, nextZ, colliders, radius)) return;

    entity.transform.position.x = nextX;
    entity.transform.position.z = nextZ;
  }
}

function overlapsAnyBox(
  entity: Entity,
  x: number,
  z: number,
  colliders: BoxCollider[],
  radius: number,
): boolean {
  for (const collider of colliders) {
    const dx = x - collider.entity.transform.position.x;
    const dz = z - collider.entity.transform.position.z;
    const overlapX = collider.halfX + radius - Math.abs(dx);
    const overlapZ = collider.halfZ + radius - Math.abs(dz);
    if (overlapX > 0 && overlapZ > 0) return true;
  }

  return false;
}
