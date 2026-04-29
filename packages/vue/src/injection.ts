import type { InjectionKey, ShallowRef } from 'vue';

import type { Game } from '@lite3d/gameplay';

export const gameInjectionKey: InjectionKey<ShallowRef<Game | null>> =
  Symbol('lite3d-game');
