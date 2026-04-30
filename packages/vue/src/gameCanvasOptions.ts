import type { GameOptions, RuntimeOptions } from '@mochi/gameplay';

export interface GameCanvasOptionsInput {
  canvas: HTMLCanvasElement;
  runtime?: RuntimeOptions;
  maxPixelRatio: number;
  autoStart: boolean;
  clearColor: [number, number, number, number];
}

export function createGameCanvasOptions(input: GameCanvasOptionsInput): GameOptions {
  return {
    canvas: input.canvas,
    runtime: input.runtime,
    maxPixelRatio: input.maxPixelRatio,
    autoStart: input.autoStart,
    renderer: {
      clearColor: input.clearColor,
    },
  };
}
