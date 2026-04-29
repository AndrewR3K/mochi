import { onBeforeUnmount } from 'vue';

import type { GameScene } from '@mochi/gameplay';

import { useGame } from './useGame';

export interface GameSceneHandle {
  readonly scene: GameScene;
  reset(): void;
  dispose(): void;
}

export function useGameScene(): GameSceneHandle {
  const game = useGame();
  const scene = game.createScene();

  const dispose = () => {
    scene.dispose();
  };

  onBeforeUnmount(dispose);

  return {
    scene,
    reset() {
      scene.reset();
    },
    dispose,
  };
}
