import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue';

import { useGame } from './useGame';

export interface GameStatsRefs {
  readonly frame: ShallowRef<number>;
  readonly delta: ShallowRef<number>;
  readonly elapsed: ShallowRef<number>;
  readonly fps: ShallowRef<number>;
}

export function useGameStats(): GameStatsRefs {
  const game = useGame();
  const frame = shallowRef(game.stats.frame);
  const delta = shallowRef(game.stats.delta);
  const elapsed = shallowRef(game.stats.elapsed);
  const fps = shallowRef(game.stats.fps);

  const sync = () => {
    frame.value = game.stats.frame;
    delta.value = game.stats.delta;
    elapsed.value = game.stats.elapsed;
    fps.value = game.stats.fps;
  };

  sync();
  const unsubscribe = game.onFrame(sync);

  onBeforeUnmount(() => {
    unsubscribe();
  });

  return {
    frame,
    delta,
    elapsed,
    fps,
  };
}
