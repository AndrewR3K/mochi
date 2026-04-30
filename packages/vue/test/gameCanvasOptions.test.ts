import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createGameCanvasOptions } from '../src/gameCanvasOptions';

describe('GameCanvas options', () => {
  it('forwards runtime and renderer options into createGame options', () => {
    const canvas = {} as HTMLCanvasElement;
    const runtime = {
      fixedStep: 1 / 60,
      maxDelta: 0.1,
      maxFixedSteps: 5,
    };
    const options = createGameCanvasOptions({
      canvas,
      runtime,
      maxPixelRatio: 1.5,
      autoStart: false,
      clearColor: [0.1, 0.2, 0.3, 1],
    });

    assert.equal(options.canvas, canvas);
    assert.equal(options.runtime, runtime);
    assert.equal(options.maxPixelRatio, 1.5);
    assert.equal(options.autoStart, false);
    assert.deepEqual(options.renderer?.clearColor, [0.1, 0.2, 0.3, 1]);
  });
});
