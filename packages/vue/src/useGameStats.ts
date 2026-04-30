import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue';

import { useGame } from './useGame';

export interface GameStatsRefs {
  readonly frame: ShallowRef<number>;
  readonly rawDelta: ShallowRef<number>;
  readonly delta: ShallowRef<number>;
  readonly elapsed: ShallowRef<number>;
  readonly fps: ShallowRef<number>;
}

export function useGameStats(): GameStatsRefs {
  const game = useGame();
  const frame = shallowRef(game.stats.frame);
  const rawDelta = shallowRef(game.stats.rawDelta);
  const delta = shallowRef(game.stats.delta);
  const elapsed = shallowRef(game.stats.elapsed);
  const fps = shallowRef(game.stats.fps);

  const sync = () => {
    frame.value = game.stats.frame;
    rawDelta.value = game.stats.rawDelta;
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
    rawDelta,
    delta,
    elapsed,
    fps,
  };
}
