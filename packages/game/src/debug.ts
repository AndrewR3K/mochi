import type { Entity, Vec3 } from '@lite3d/runtime';

import type { BoxCollider } from './collision';
import { createMaterial } from './materials';
import type { Disposable, GameScene } from './scene';

type DebugEnabled = boolean | (() => boolean);

export interface DebugVisual extends Disposable {
  readonly enabled: boolean;
  setEnabled(enabled: boolean): void;
}

export interface DebugBoxBoundsOptions {
  color?: Vec3;
  enabled?: DebugEnabled;
  height?: number;
  idPrefix?: string;
  thickness?: number;
  yOffset?: number;
}

export interface DebugTargetMarkerOptions {
  color?: Vec3;
  enabled?: DebugEnabled;
  id?: string;
  size?: number;
  yOffset?: number;
}

type EdgeKind = 'north' | 'south' | 'east' | 'west';

interface DebugEdge {
  entity: Entity;
  collider: BoxCollider;
  kind: EdgeKind;
}

export function createDebugBoxBounds(
  scene: GameScene,
  colliders: readonly BoxCollider[],
  options: DebugBoxBoundsOptions = {},
): DebugVisual {
  const color = options.color ?? { x: 0.2, y: 1, z: 0.72 };
  const thickness = options.thickness ?? 0.08;
  const height = options.height ?? 0.08;
  const yOffset = options.yOffset ?? 0.08;
  const idPrefix = options.idPrefix ?? 'debug-box';
  const edges: DebugEdge[] = [];

  let enabled = readEnabled(options.enabled, false);

  for (let i = 0; i < colliders.length; i += 1) {
    const collider = colliders[i];
    edges.push(
      createEdge(scene, collider, 'north', `${idPrefix}-${i}-north`, color),
      createEdge(scene, collider, 'south', `${idPrefix}-${i}-south`, color),
      createEdge(scene, collider, 'east', `${idPrefix}-${i}-east`, color),
      createEdge(scene, collider, 'west', `${idPrefix}-${i}-west`, color),
    );
  }

  const sync = () => {
    enabled = readEnabled(options.enabled, enabled);

    for (const edge of edges) {
      syncEdge(edge, enabled, thickness, height, yOffset);
    }
  };

  sync();
  const unsubscribe = scene.onFrame(sync);

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(value) {
      enabled = value;
      sync();
    },
    dispose() {
      unsubscribe();
      for (const edge of edges) {
        scene.game.world.removeEntity(edge.entity.id);
      }
    },
  };
}

export function createDebugTargetMarker(
  scene: GameScene,
  target: Entity,
  options: DebugTargetMarkerOptions = {},
): DebugVisual {
  const size = options.size ?? 0.32;
  const yOffset = options.yOffset ?? 1.25;
  let enabled = readEnabled(options.enabled, false);

  const marker = scene.createEntity({
    id: options.id ?? `${target.id}-debug-target`,
    renderable: {
      primitive: 'cube',
      material: createMaterial(options.color ?? { x: 1, y: 0.8, z: 0.18 }),
    },
  });

  const sync = () => {
    enabled = readEnabled(options.enabled, enabled);
    marker.transform.position.x = target.transform.position.x;
    marker.transform.position.y = target.transform.position.y + yOffset;
    marker.transform.position.z = target.transform.position.z;
    marker.transform.scale.x = enabled ? size : 0;
    marker.transform.scale.y = enabled ? size : 0;
    marker.transform.scale.z = enabled ? size : 0;
  };

  sync();
  const unsubscribe = scene.onFrame(sync);

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(value) {
      enabled = value;
      sync();
    },
    dispose() {
      unsubscribe();
      scene.game.world.removeEntity(marker.id);
    },
  };
}

function createEdge(
  scene: GameScene,
  collider: BoxCollider,
  kind: EdgeKind,
  id: string,
  color: Vec3,
): DebugEdge {
  return {
    collider,
    kind,
    entity: scene.createEntity({
      id,
      renderable: {
        primitive: 'cube',
        material: createMaterial(color),
      },
    }),
  };
}

function syncEdge(
  edge: DebugEdge,
  enabled: boolean,
  thickness: number,
  height: number,
  yOffset: number,
): void {
  const position = edge.entity.transform.position;
  const scale = edge.entity.transform.scale;
  const colliderPosition = edge.collider.entity.transform.position;
  const width = edge.collider.halfX * 2;
  const depth = edge.collider.halfZ * 2;
  const visibleHeight = enabled ? height : 0;

  position.y = edge.collider.topY + yOffset;

  if (edge.kind === 'north' || edge.kind === 'south') {
    position.x = colliderPosition.x;
    position.z = colliderPosition.z + (edge.kind === 'north' ? edge.collider.halfZ : -edge.collider.halfZ);
    scale.x = enabled ? width : 0;
    scale.y = visibleHeight;
    scale.z = enabled ? thickness : 0;
    return;
  }

  position.x = colliderPosition.x + (edge.kind === 'east' ? edge.collider.halfX : -edge.collider.halfX);
  position.z = colliderPosition.z;
  scale.x = enabled ? thickness : 0;
  scale.y = visibleHeight;
  scale.z = enabled ? depth : 0;
}

function readEnabled(enabled: DebugEnabled | undefined, fallback: boolean): boolean {
  if (typeof enabled === 'function') return enabled();
  return enabled ?? fallback;
}
