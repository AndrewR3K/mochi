import {
  getCollisionBody,
  overlapsCollisionBodies,
  setBoxCollisionBody,
  setSphereCollisionBody,
  type CollisionBody,
  type Entity,
  type Vec3,
} from '@mochi/core';

import { createEventSignal, type EventSignal } from './events';
import type { GameScene } from './scene';

export type TriggerVolumeShape =
  | {
      kind: 'box';
      halfX?: number;
      halfY?: number;
      halfZ?: number;
    }
  | {
      kind: 'sphere';
      radius?: number;
    };

export interface TriggerVolumeEvent {
  volume: TriggerVolume;
  target: Entity;
  targetBody: CollisionBody;
  elapsed: number;
}

export interface TriggerVolumeOptions {
  scene: GameScene;
  targets: () => Iterable<Entity>;
  entity?: Entity;
  id?: string;
  position?: Vec3;
  shape?: TriggerVolumeShape;
  visible?: boolean;
  color?: Vec3;
  onEnter?: (event: TriggerVolumeEvent) => void;
  onStay?: (event: TriggerVolumeEvent) => void;
  onExit?: (event: TriggerVolumeEvent) => void;
}

export interface TriggerVolume {
  readonly entity: Entity;
  readonly body: CollisionBody;
  readonly entered: EventSignal<TriggerVolumeEvent>;
  readonly stayed: EventSignal<TriggerVolumeEvent>;
  readonly exited: EventSignal<TriggerVolumeEvent>;
  reset(): void;
  dispose(): void;
}

export interface DamageZoneEvent extends TriggerVolumeEvent {
  damage: number;
}

export interface DamageZoneOptions extends Omit<
  TriggerVolumeOptions,
  'onEnter' | 'onStay' | 'onExit'
> {
  damage: number;
  interval?: number;
  applyOnEnter?: boolean;
  onDamage?: (event: DamageZoneEvent) => void;
}

export interface DamageZone {
  readonly volume: TriggerVolume;
  readonly damaged: EventSignal<DamageZoneEvent>;
  reset(): void;
  dispose(): void;
}

export function createTriggerVolume(options: TriggerVolumeOptions): TriggerVolume {
  const shape = options.shape ?? { kind: 'box' };
  const entity = options.entity ?? createVolumeEntity(options.scene, options, shape);
  const body = shape.kind === 'sphere'
    ? setSphereCollisionBody(entity, {
      radius: shape.radius,
      trigger: true,
    })
    : setBoxCollisionBody(entity, {
      halfX: shape.halfX,
      halfY: shape.halfY,
      halfZ: shape.halfZ,
      trigger: true,
    });
  const entered = createEventSignal<TriggerVolumeEvent>();
  const stayed = createEventSignal<TriggerVolumeEvent>();
  const exited = createEventSignal<TriggerVolumeEvent>();
  const activeTargets = new Map<Entity, CollisionBody>();

  const trigger: TriggerVolume = {
    entity,
    body,
    entered,
    stayed,
    exited,
    reset() {
      activeTargets.clear();
    },
    dispose() {
      unsubscribe();
      activeTargets.clear();
      entered.clear();
      stayed.clear();
      exited.clear();
    },
  };

  const unsubscribe = options.scene.onFrame(({ elapsed }) => {
    const nextTargets = new Map<Entity, CollisionBody>();

    for (const target of options.targets()) {
      const targetBody = getCollisionBody(target);
      if (!targetBody || !overlapsCollisionBodies(body, targetBody)) continue;

      nextTargets.set(target, targetBody);
      const event = { volume: trigger, target, targetBody, elapsed };

      if (activeTargets.has(target)) {
        stayed.emit(event);
        options.onStay?.(event);
      } else {
        entered.emit(event);
        options.onEnter?.(event);
      }
    }

    for (const [target, targetBody] of activeTargets) {
      if (nextTargets.has(target)) continue;

      const event = { volume: trigger, target, targetBody, elapsed };
      exited.emit(event);
      options.onExit?.(event);
    }

    activeTargets.clear();
    for (const entry of nextTargets) {
      activeTargets.set(entry[0], entry[1]);
    }
  });

  options.scene.addReset(trigger.reset);

  return trigger;
}

export function createDamageZone(options: DamageZoneOptions): DamageZone {
  const damaged = createEventSignal<DamageZoneEvent>();
  const nextDamageAt = new Map<Entity, number>();
  const interval = options.interval ?? 0.5;
  const applyOnEnter = options.applyOnEnter ?? true;
  const volume = createTriggerVolume(options);

  const stopEnter = volume.entered.on((event) => {
    if (applyOnEnter) applyDamage(event);
  });
  const stopStay = volume.stayed.on(applyDamage);
  const stopExit = volume.exited.on((event) => {
    nextDamageAt.delete(event.target);
  });

  return {
    volume,
    damaged,
    reset() {
      volume.reset();
      nextDamageAt.clear();
    },
    dispose() {
      stopExit();
      stopStay();
      stopEnter();
      volume.dispose();
      nextDamageAt.clear();
      damaged.clear();
    },
  };

  function applyDamage(event: TriggerVolumeEvent): void {
    const nextAt = nextDamageAt.get(event.target) ?? -Infinity;
    if (event.elapsed < nextAt) return;

    const damageEvent = { ...event, damage: options.damage };
    damaged.emit(damageEvent);
    options.onDamage?.(damageEvent);
    nextDamageAt.set(event.target, event.elapsed + interval);
  }
}

function createVolumeEntity(
  scene: GameScene,
  options: TriggerVolumeOptions,
  shape: TriggerVolumeShape,
): Entity {
  const scale = shape.kind === 'sphere'
    ? sphereScale(shape.radius ?? 0.5)
    : {
      x: (shape.halfX ?? 0.5) * 2,
      y: (shape.halfY ?? 0.5) * 2,
      z: (shape.halfZ ?? 0.5) * 2,
    };

  return scene.createEntity({
    id: options.id,
    transform: {
      position: options.position,
      scale,
    },
    renderable: options.visible ? {
      primitive: 'cube',
      material: {
        color: options.color ?? { x: 1, y: 0.45, z: 0.2 },
      },
    } : undefined,
  });
}

function sphereScale(radius: number): Vec3 {
  const diameter = radius * 2;
  return { x: diameter, y: diameter, z: diameter };
}
