import type { InjectionKey, ShallowRef } from 'vue';

import type { Game } from '@mochi/gameplay';

export const gameInjectionKey: InjectionKey<ShallowRef<Game | null>> =
  Symbol('mochi-game');
