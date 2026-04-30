import type { Entity, Vec3 } from '@mochi/core';

import { createEventSignal, type EventSignal } from './events';
import type { GameScene } from './scene';

export interface ProjectileTarget {
  entity: Entity;
  radius?: number;
  active?: () => boolean;
  onHit?: (hit: ProjectileHit) => void;
}

export interface ProjectileHit {
  projectile: Projectile;
  target: ProjectileTarget;
}

export interface Projectile {
  readonly entity: Entity;
  readonly velocity: Vec3;
  active: boolean;
  age: number;
  lifetime: number;
  radius: number;
}

export interface ProjectileFireOptions {
  position: Vec3;
  direction: Vec3;
  speed?: number;
  lifetime?: number;
  radius?: number;
}

export interface ProjectileEmitterOptions {
  scene: GameScene;
  idPrefix?: string;
  maxProjectiles?: number;
  speed?: number;
  lifetime?: number;
  radius?: number;
  size?: number;
  color?: Vec3;
  targets?: () => readonly ProjectileTarget[];
}

export interface ProjectileEmitter {
  readonly projectiles: readonly Projectile[];
  readonly hits: EventSignal<ProjectileHit>;
  fire(options: ProjectileFireOptions): Projectile | null;
  reset(): void;
  dispose(): void;
}

export function createProjectileEmitter(
  options: ProjectileEmitterOptions,
): ProjectileEmitter {
  const scene = options.scene;
  const maxProjectiles = options.maxProjectiles ?? 24;
  const defaultSpeed = options.speed ?? 34;
  const defaultLifetime = options.lifetime ?? 1.4;
  const defaultRadius = options.radius ?? 0.35;
  const size = options.size ?? 0.18;
  const color = options.color ?? { x: 0.35, y: 0.9, z: 1 };
  const hits = createEventSignal<ProjectileHit>();
  const projectiles: Projectile[] = [];

  for (let index = 0; index < maxProjectiles; index += 1) {
    const entity = scene.createEntity({
      id: `${options.idPrefix ?? 'projectile'}-${index}`,
      transform: {
        position: { x: 0, y: -9999, z: 0 },
        scale: { x: 0, y: 0, z: 0 },
      },
      renderable: {
        primitive: 'cube',
        material: { color: { ...color } },
      },
    });

    projectiles.push({
      entity,
      velocity: { x: 0, y: 0, z: 0 },
      active: false,
      age: 0,
      lifetime: defaultLifetime,
      radius: defaultRadius,
    });
  }

  const unsubscribe = scene.onFrame(({ delta }) => {
    const targets = options.targets?.() ?? [];

    for (const projectile of projectiles) {
      if (!projectile.active) continue;

      projectile.age += delta;
      projectile.entity.transform.position.x += projectile.velocity.x * delta;
      projectile.entity.transform.position.y += projectile.velocity.y * delta;
      projectile.entity.transform.position.z += projectile.velocity.z * delta;

      if (projectile.age >= projectile.lifetime) {
        deactivate(projectile);
        continue;
      }

      const hitTarget = findHitTarget(projectile, targets);
      if (hitTarget) {
        const hit = { projectile, target: hitTarget };
        hitTarget.onHit?.(hit);
        hits.emit(hit);
        deactivate(projectile);
      }
    }
  });

  scene.addReset(reset);

  return {
    projectiles,
    hits,
    fire(options) {
      const direction = normalize(options.direction);
      if (!direction) return null;

      const projectile = projectiles.find((candidate) => !candidate.active);
      if (!projectile) return null;

      const speed = options.speed ?? defaultSpeed;
      projectile.active = true;
      projectile.age = 0;
      projectile.lifetime = options.lifetime ?? defaultLifetime;
      projectile.radius = options.radius ?? defaultRadius;
      projectile.velocity.x = direction.x * speed;
      projectile.velocity.y = direction.y * speed;
      projectile.velocity.z = direction.z * speed;
      projectile.entity.transform.position.x = options.position.x;
      projectile.entity.transform.position.y = options.position.y;
      projectile.entity.transform.position.z = options.position.z;
      projectile.entity.transform.rotation.x = Math.asin(-direction.y);
      projectile.entity.transform.rotation.y = Math.atan2(direction.x, -direction.z);
      projectile.entity.transform.rotation.z = 0;
      projectile.entity.transform.scale.x = size;
      projectile.entity.transform.scale.y = size;
      projectile.entity.transform.scale.z = size * 2.8;

      return projectile;
    },
    reset,
    dispose() {
      unsubscribe();
      hits.clear();
    },
  };

  function reset(): void {
    for (const projectile of projectiles) {
      deactivate(projectile);
    }
    hits.clear();
  }
}

function findHitTarget(
  projectile: Projectile,
  targets: readonly ProjectileTarget[],
): ProjectileTarget | null {
  for (const target of targets) {
    if (target.active && !target.active()) continue;

    const radius = target.radius ?? 0.75;
    if (distance3d(projectile.entity, target.entity) <= projectile.radius + radius) {
      return target;
    }
  }

  return null;
}

function deactivate(projectile: Projectile): void {
  projectile.active = false;
  projectile.age = 0;
  projectile.velocity.x = 0;
  projectile.velocity.y = 0;
  projectile.velocity.z = 0;
  projectile.entity.transform.position.y = -9999;
  projectile.entity.transform.scale.x = 0;
  projectile.entity.transform.scale.y = 0;
  projectile.entity.transform.scale.z = 0;
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

function distance3d(a: Entity, b: Entity): number {
  const dx = a.transform.position.x - b.transform.position.x;
  const dy = a.transform.position.y - b.transform.position.y;
  const dz = a.transform.position.z - b.transform.position.z;
  return Math.hypot(dx, dy, dz);
}
