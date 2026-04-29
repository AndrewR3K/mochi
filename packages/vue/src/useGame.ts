import { inject } from 'vue';

import type { Game } from '@lite3d/gameplay';

import { gameInjectionKey } from './injection';

export function useGame(): Game {
  const gameRef = inject(gameInjectionKey, null);

  if (!gameRef) {
    throw new Error('useGame() must be used under <GameCanvas>.');
  }

  const game = gameRef.value;

  if (!game) {
    throw new Error(
      'useGame() was called before the game was ready; place usage inside the default slot of <GameCanvas>.',
    );
  }

  return game;
}
