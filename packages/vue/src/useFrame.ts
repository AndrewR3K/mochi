import { onBeforeUnmount } from 'vue';

import type { FrameCallback } from '@mochi/gameplay';

import { useGame } from './useGame';

export function useFrame(callback: FrameCallback): void {
  const game = useGame();
  const unsubscribe = game.onFrame(callback);

  onBeforeUnmount(() => {
    unsubscribe();
  });
}
