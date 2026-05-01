import type { WorldSnapshot } from './world';
import { World } from './world';

type Awaitable<T> = T | Promise<T>;

export interface WorldSnapshotStore {
  saveSnapshot(slot: string, snapshot: WorldSnapshot): Awaitable<void>;
  loadSnapshot(slot: string): Awaitable<WorldSnapshot | null>;
  deleteSnapshot?(slot: string): Awaitable<void>;
  listSnapshots?(): Awaitable<string[]>;
}

export interface MemoryWorldSnapshotStore extends WorldSnapshotStore {
  readonly slots: readonly string[];
  clear(): void;
}

export function serializeWorldSnapshot(snapshot: WorldSnapshot): string {
  return JSON.stringify(snapshot);
}

export function deserializeWorldSnapshot(serialized: string): WorldSnapshot {
  const value: unknown = JSON.parse(serialized);
  assertWorldSnapshot(value);
  return value;
}

export async function saveWorldSnapshot(
  world: World,
  store: WorldSnapshotStore,
  slot: string,
): Promise<void> {
  await store.saveSnapshot(slot, world.createWorldSnapshot());
}

export async function loadWorldSnapshot(
  world: World,
  store: WorldSnapshotStore,
  slot: string,
): Promise<boolean> {
  const snapshot = await store.loadSnapshot(slot);
  if (!snapshot) return false;

  world.loadWorldSnapshot(snapshot);
  return true;
}

export function createMemoryWorldSnapshotStore(
  initialSnapshots: Record<string, WorldSnapshot> = {},
): MemoryWorldSnapshotStore {
  const snapshots = new Map<string, string>();

  for (const [slot, snapshot] of Object.entries(initialSnapshots)) {
    snapshots.set(slot, serializeWorldSnapshot(snapshot));
  }

  return {
    get slots() {
      return [...snapshots.keys()];
    },
    async saveSnapshot(slot, snapshot) {
      snapshots.set(slot, serializeWorldSnapshot(snapshot));
    },
    async loadSnapshot(slot) {
      const serialized = snapshots.get(slot);
      return serialized ? deserializeWorldSnapshot(serialized) : null;
    },
    async deleteSnapshot(slot) {
      snapshots.delete(slot);
    },
    async listSnapshots() {
      return [...snapshots.keys()];
    },
    clear() {
      snapshots.clear();
    },
  };
}

function assertWorldSnapshot(value: unknown): asserts value is WorldSnapshot {
  if (!isRecord(value)) {
    throw new Error('World snapshot must be an object.');
  }

  assertCamera(value.camera);
  if (!Array.isArray(value.entities)) {
    throw new Error('World snapshot entities must be an array.');
  }

  for (const entity of value.entities) {
    assertWorldEntitySnapshot(entity);
  }
}

function assertCamera(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error('World snapshot camera must be an object.');
  }

  assertVec3(value.position, 'camera.position');
  assertVec3(value.target, 'camera.target');
  assertNumber(value.fov, 'camera.fov');
  assertNumber(value.near, 'camera.near');
  assertNumber(value.far, 'camera.far');
}

function assertWorldEntitySnapshot(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error('World snapshot entity must be an object.');
  }

  assertString(value.id, 'entity.id');
  if (value.name !== undefined) assertString(value.name, 'entity.name');
  assertStringOrNull(value.parentId, 'entity.parentId');
  if (!Array.isArray(value.childIds) || !value.childIds.every((id) => typeof id === 'string')) {
    throw new Error('World snapshot entity.childIds must be a string array.');
  }
  if (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === 'string')) {
    throw new Error('World snapshot entity.tags must be a string array.');
  }

  assertTransform(value.transform);
  assertVec3(value.worldPosition, 'entity.worldPosition');

  if (value.renderable !== undefined) {
    assertRenderable(value.renderable);
  }
}

function assertTransform(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error('World snapshot transform must be an object.');
  }

  assertVec3(value.position, 'transform.position');
  assertVec3(value.rotation, 'transform.rotation');
  assertVec3(value.scale, 'transform.scale');
}

function assertRenderable(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error('World snapshot renderable must be an object.');
  }

  if (
    value.primitive !== 'cube' &&
    value.primitive !== 'plane' &&
    value.primitive !== 'cylinder'
  ) {
    throw new Error('World snapshot renderable.primitive must be a known primitive.');
  }
  if (!isRecord(value.material)) {
    throw new Error('World snapshot renderable.material must be an object.');
  }
  assertVec3(value.material.color, 'renderable.material.color');
}

function assertVec3(value: unknown, label: string): void {
  if (!isRecord(value)) {
    throw new Error(`World snapshot ${label} must be an object.`);
  }

  assertNumber(value.x, `${label}.x`);
  assertNumber(value.y, `${label}.y`);
  assertNumber(value.z, `${label}.z`);
}

function assertString(value: unknown, label: string): void {
  if (typeof value !== 'string') {
    throw new Error(`World snapshot ${label} must be a string.`);
  }
}

function assertStringOrNull(value: unknown, label: string): void {
  if (value !== null && typeof value !== 'string') {
    throw new Error(`World snapshot ${label} must be a string or null.`);
  }
}

function assertNumber(value: unknown, label: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`World snapshot ${label} must be a finite number.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
