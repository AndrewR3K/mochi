import type { Entity, EntityOptions, FrameCallback } from '@lite3d/runtime';

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
  dispose(): void;
}

export interface MountedScene<T> {
  readonly scene: GameScene;
  readonly result: T;
  dispose(): void;
}

export type SceneSetup<T> = (scene: GameScene) => T;

export function createScene(game: Game): GameScene {
  const entities: Entity[] = [];
  const cleanups: Array<() => void> = [];
  let disposed = false;

  const scene: GameScene = {
    game,
    entities,
    createEntity(options) {
      const entity = game.world.createEntity(options);
      entities.push(entity);
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
      entities.length = 0;
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
    dispose() {
      scene.dispose();
    },
  };
}

export function disposeScene(scene: GameScene): void {
  scene.dispose();
}
