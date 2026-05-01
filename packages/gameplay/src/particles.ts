import type { Entity, Vec3 } from '@mochi-labs/core';

import { createMaterial } from './materials';
import type { GameScene } from './scene';

export interface Particle {
  readonly entity: Entity;
  readonly velocity: Vec3;
  active: boolean;
  age: number;
  lifetime: number;
  size: number;
}

export interface ParticleEmitOptions {
  position: Vec3;
  color?: Vec3;
  direction?: Vec3;
  drag?: number;
  gravity?: Vec3;
  lifetime?: number;
  size?: number;
  speed?: number;
  velocity?: Vec3;
}

export interface ParticleEmitterOptions {
  scene: GameScene;
  color?: Vec3;
  drag?: number;
  endScale?: number;
  gravity?: Vec3;
  idPrefix?: string;
  lifetime?: number;
  maxParticles?: number;
  size?: number;
  startScale?: number;
}

export interface ParticleEmitter {
  readonly particles: readonly Particle[];
  burst(count: number, createOptions: (index: number) => ParticleEmitOptions): Particle[];
  emit(options: ParticleEmitOptions): Particle | null;
  reset(): void;
  dispose(): void;
}

interface ParticleState extends Particle {
  drag: number;
  gravity: Vec3;
}

export function createParticleEmitter(
  options: ParticleEmitterOptions,
): ParticleEmitter {
  const scene = options.scene;
  const maxParticles = options.maxParticles ?? 64;
  const defaultColor = options.color ?? { x: 1, y: 0.72, z: 0.24 };
  const defaultDrag = options.drag ?? 0;
  const defaultGravity = options.gravity ?? { x: 0, y: 0, z: 0 };
  const defaultLifetime = options.lifetime ?? 0.8;
  const defaultSize = options.size ?? 0.18;
  const startScale = options.startScale ?? 1;
  const endScale = options.endScale ?? 0;
  const particles: ParticleState[] = [];

  for (let index = 0; index < maxParticles; index += 1) {
    const entity = scene.createEntity({
      id: `${options.idPrefix ?? 'particle'}-${index}`,
      transform: {
        position: { x: 0, y: -9999, z: 0 },
        scale: { x: 0, y: 0, z: 0 },
      },
      renderable: {
        primitive: 'cube',
        material: createMaterial(defaultColor),
      },
    });

    particles.push({
      entity,
      velocity: { x: 0, y: 0, z: 0 },
      active: false,
      age: 0,
      lifetime: defaultLifetime,
      size: defaultSize,
      drag: defaultDrag,
      gravity: { ...defaultGravity },
    });
  }

  const unsubscribe = scene.onFrame(({ delta }) => {
    for (const particle of particles) {
      if (!particle.active) continue;

      particle.age += delta;
      if (particle.age >= particle.lifetime) {
        deactivate(particle);
        continue;
      }

      particle.velocity.x += particle.gravity.x * delta;
      particle.velocity.y += particle.gravity.y * delta;
      particle.velocity.z += particle.gravity.z * delta;
      applyDrag(particle.velocity, particle.drag, delta);

      particle.entity.transform.position.x += particle.velocity.x * delta;
      particle.entity.transform.position.y += particle.velocity.y * delta;
      particle.entity.transform.position.z += particle.velocity.z * delta;

      const t = particle.age / particle.lifetime;
      const scale = particle.size * lerp(startScale, endScale, t);
      particle.entity.transform.scale.x = scale;
      particle.entity.transform.scale.y = scale;
      particle.entity.transform.scale.z = scale;
    }
  });

  scene.addReset(reset);

  const emitter: ParticleEmitter = {
    particles,
    burst(count, createOptions) {
      const emitted: Particle[] = [];

      for (let index = 0; index < count; index += 1) {
        const particle = emit(createOptions(index));
        if (particle) emitted.push(particle);
      }

      return emitted;
    },
    emit,
    reset,
    dispose() {
      unsubscribe();
    },
  };

  return emitter;

  function emit(emitOptions: ParticleEmitOptions): Particle | null {
    const velocity = readVelocity(emitOptions);
    if (!velocity) return null;

    const particle = particles.find((candidate) => !candidate.active);
    if (!particle) return null;

    particle.active = true;
    particle.age = 0;
    particle.lifetime = emitOptions.lifetime ?? defaultLifetime;
    particle.size = emitOptions.size ?? defaultSize;
    particle.drag = emitOptions.drag ?? defaultDrag;
    particle.gravity = emitOptions.gravity
      ? { ...emitOptions.gravity }
      : { ...defaultGravity };
    particle.velocity.x = velocity.x;
    particle.velocity.y = velocity.y;
    particle.velocity.z = velocity.z;

    particle.entity.transform.position.x = emitOptions.position.x;
    particle.entity.transform.position.y = emitOptions.position.y;
    particle.entity.transform.position.z = emitOptions.position.z;
    particle.entity.transform.scale.x = particle.size * startScale;
    particle.entity.transform.scale.y = particle.size * startScale;
    particle.entity.transform.scale.z = particle.size * startScale;

    if (particle.entity.renderable) {
      particle.entity.renderable.material.color = emitOptions.color
        ? { ...emitOptions.color }
        : { ...defaultColor };
    }

    return particle;
  }

  function reset(): void {
    for (const particle of particles) {
      deactivate(particle);
    }
  }
}

function readVelocity(options: ParticleEmitOptions): Vec3 | null {
  if (options.velocity) return { ...options.velocity };

  if (!options.direction) {
    return { x: 0, y: 0, z: 0 };
  }

  const direction = normalize(options.direction);
  if (!direction) return null;

  const speed = options.speed ?? 1;
  return {
    x: direction.x * speed,
    y: direction.y * speed,
    z: direction.z * speed,
  };
}

function applyDrag(velocity: Vec3, drag: number, delta: number): void {
  if (drag <= 0) return;

  const damping = Math.max(0, 1 - drag * delta);
  velocity.x *= damping;
  velocity.y *= damping;
  velocity.z *= damping;
}

function deactivate(particle: ParticleState): void {
  particle.active = false;
  particle.age = 0;
  particle.velocity.x = 0;
  particle.velocity.y = 0;
  particle.velocity.z = 0;
  particle.entity.transform.position.y = -9999;
  particle.entity.transform.scale.x = 0;
  particle.entity.transform.scale.y = 0;
  particle.entity.transform.scale.z = 0;
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

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
