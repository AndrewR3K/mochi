export { default as GameCanvas } from './GameCanvas.vue';
export { gameInjectionKey } from './injection';
export { useFrame } from './useFrame';
export { useGame } from './useGame';
export { useGameScene, type GameSceneHandle } from './useGameScene';
export { useGameStats, type GameStatsRefs } from './useGameStats';

export type { FrameCallback, Game, GameOptions, RuntimeOptions } from '@mochi-labs/gameplay';
