import type { Entity, EntityOptions, FrameCallback, Transform } from '@lite3d/runtime';

import type { Game } from './game';

export interface Disposable {
  dispose(): void;
}

export interface GameScene {
  readonly game: Game;
  readonly entities: readonly Entity[];
  createEntity(options?: EntityOptions): Entity;
  onFrame(callback: FrameCallback): () => void;
  add<T extends Disposable>(disposable: T): T;
  addCleanup(cleanup: () => void): () => void;
  addReset(reset: () => void): () => void;
  reset(): void;
  dispose(): void;
}

export interface MountedScene<T> {
  readonly scene: GameScene;
  readonly result: T;
  reset(): void;
  dispose(): void;
}

export type SceneSetup<T> = (scene: GameScene) => T;

export function createScene(game: Game): GameScene {
  const entities: Entity[] = [];
  const cleanups: Array<() => void> = [];
  const resets: Array<() => void> = [];
  const transformSnapshots: Array<{ entity: Entity; transform: Transform }> = [];
  let disposed = false;

  const scene: GameScene = {
    game,
    entities,
    createEntity(options) {
      const entity = game.world.createEntity(options);
      entities.push(entity);
      transformSnapshots.push({
        entity,
        transform: cloneTransform(entity.transform),
      });
      return entity;
    },
    onFrame(callback) {
      const unsubscribe = game.onFrame(callback);
      cleanups.push(unsubscribe);
      return unsubscribe;
    },
    add(disposable) {
      cleanups.push(() => disposable.dispose());
      return disposable;
    },
    addCleanup(cleanup) {
      cleanups.push(cleanup);
      return cleanup;
    },
    addReset(reset) {
      resets.push(reset);
      return reset;
    },
    reset() {
      for (const snapshot of transformSnapshots) {
        copyTransform(snapshot.transform, snapshot.entity.transform);
      }

      for (const reset of resets) {
        reset();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;

      for (let i = cleanups.length - 1; i >= 0; i -= 1) {
        cleanups[i]();
      }

      for (let i = entities.length - 1; i >= 0; i -= 1) {
        game.world.removeEntity(entities[i].id);
      }

      cleanups.length = 0;
      resets.length = 0;
      entities.length = 0;
      transformSnapshots.length = 0;
    },
  };

  return scene;
}

export function mountScene<T>(game: Game, setup: SceneSetup<T>): MountedScene<T> {
  const scene = createScene(game);
  const result = setup(scene);

  return {
    scene,
    result,
    reset() {
      scene.reset();
    },
    dispose() {
      scene.dispose();
    },
  };
}

export function disposeScene(scene: GameScene): void {
  scene.dispose();
}

function cloneTransform(transform: Transform): Transform {
  return {
    position: { ...transform.position },
    rotation: { ...transform.rotation },
    scale: { ...transform.scale },
  };
}

function copyTransform(source: Transform, target: Transform): void {
  target.position.x = source.position.x;
  target.position.y = source.position.y;
  target.position.z = source.position.z;
  target.rotation.x = source.rotation.x;
  target.rotation.y = source.rotation.y;
  target.rotation.z = source.rotation.z;
  target.scale.x = source.scale.x;
  target.scale.y = source.scale.y;
  target.scale.z = source.scale.z;
}
