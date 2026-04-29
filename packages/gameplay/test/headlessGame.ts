import { createRuntime, type FrameCallback, type Runtime } from '@lite3d/core';
import type { WebGLGameRenderer } from '@lite3d/renderer-webgl';
import type { Game, GameStats } from '../src/game';
import { createScene, mountScene, type MountedScene, type SceneSetup } from '../src/scene';

export interface HeadlessGame extends Game {
  readonly runtime: Runtime;
}

export function createHeadlessGame(): HeadlessGame {
  const runtime = createRuntime();
  const stats: GameStats = {
    frame: 0,
    delta: 0,
    elapsed: 0,
    fps: 0,
  };
  const canvas = {} as HTMLCanvasElement;
  const renderer: WebGLGameRenderer = {
    canvas,
    gl: {} as WebGL2RenderingContext,
    width: 640,
    height: 360,
    setSize() {},
    render() {},
    dispose() {},
  };

  return {
    canvas,
    runtime,
    renderer,
    world: runtime.world,
    stats,
    start() {},
    stop() {},
    dispose() {
      runtime.reset();
    },
    setSize() {},
    onFrame(callback: FrameCallback) {
      return runtime.onFrame(callback);
    },
    createScene() {
      return createScene(this);
    },
    mountScene<T>(setup: SceneSetup<T>): MountedScene<T> {
      return mountScene(this, setup);
    },
  };
}
