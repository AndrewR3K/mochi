import type { InjectionKey, ShallowRef } from 'vue';

import type { Game } from '@lite3d/game';

export const gameInjectionKey: InjectionKey<ShallowRef<Game | null>> =
  Symbol('lite3d-game');
