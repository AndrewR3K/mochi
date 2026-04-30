import {
  createRuntime,
  type FrameCallback,
  type Runtime,
  type RuntimeOptions,
  type RuntimeStats,
  type World,
} from '@mochi-labs/core';
import {
  createWebGLRenderer,
  type WebGLGameRenderer,
  type WebGLRendererOptions,
} from '@mochi-labs/renderer-webgl';

import { connectBrowserInput } from './browserInput';
import {
  createScene,
  mountScene,
  type GameScene,
  type MountedScene,
  type SceneSetup,
} from './scene';

export interface GameOptions {
  canvas: HTMLCanvasElement;
  runtime?: RuntimeOptions;
  renderer?: WebGLRendererOptions;
  maxPixelRatio?: number;
  autoStart?: boolean;
  autoResize?: boolean;
}

export interface GameStats extends RuntimeStats {
  fps: number;
}

export interface Game {
  readonly canvas: HTMLCanvasElement;
  readonly runtime: Runtime;
  readonly renderer: WebGLGameRenderer;
  readonly world: World;
  readonly stats: GameStats;
  start(): void;
  stop(): void;
  dispose(): void;
  setSize(width: number, height: number): void;
  onFrame(callback: FrameCallback): () => void;
  createScene(): GameScene;
  mountScene<T>(setup: SceneSetup<T>): MountedScene<T>;
}

export function createGame(options: GameOptions): Game {
  const runtime = createRuntime(options.runtime);
  const renderer = createWebGLRenderer(options.canvas, options.renderer);
  const maxPixelRatio = options.maxPixelRatio ?? 2;
  const stats: GameStats = {
    frame: 0,
    rawDelta: 0,
    delta: 0,
    elapsed: 0,
    fps: 0,
  };

  let animationFrame = 0;
  let lastTime = 0;
  let running = false;
  let disposed = false;
  let resizeObserver: ResizeObserver | null = null;
  let disconnectInput: (() => void) | null = connectBrowserInput(
    options.canvas,
    runtime.inputWriter,
  );

  const syncStats = () => {
    stats.frame = runtime.stats.frame;
    stats.rawDelta = runtime.stats.rawDelta;
    stats.delta = runtime.stats.delta;
    stats.elapsed = runtime.stats.elapsed;
    stats.fps = stats.delta > 0 ? 1 / stats.delta : 0;
  };

  const pixelRatio = () =>
    Math.min(window.devicePixelRatio, maxPixelRatio);

  const setSize = (width: number, height: number) => {
    renderer.setSize(width, height, pixelRatio());
  };

  const fitCanvas = () => {
    const parent = options.canvas.parentElement;
    const width = parent?.clientWidth ?? options.canvas.clientWidth;
    const height = parent?.clientHeight ?? options.canvas.clientHeight;
    setSize(width, height);
  };

  const frame = (time: number) => {
    if (!running || disposed) return;

    const delta = lastTime === 0 ? 0 : (time - lastTime) / 1000;
    lastTime = time;
    runtime.tick(delta);
    syncStats();
    renderer.render(runtime.world.createRenderSnapshot(renderer.width, renderer.height));
    animationFrame = window.requestAnimationFrame(frame);
  };

  const game: Game = {
    canvas: options.canvas,
    runtime,
    renderer,
    world: runtime.world,
    stats,
    start() {
      if (running || disposed) return;
      running = true;
      lastTime = 0;
      animationFrame = window.requestAnimationFrame(frame);
    },
    stop() {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    },
    dispose() {
      if (disposed) return;
      game.stop();
      disposed = true;
      resizeObserver?.disconnect();
      resizeObserver = null;
      disconnectInput?.();
      disconnectInput = null;
      runtime.reset();
      renderer.dispose();
    },
    setSize,
    onFrame(callback) {
      return runtime.onFrame(callback);
    },
    createScene() {
      return createScene(game);
    },
    mountScene(setup) {
      return mountScene(game, setup);
    },
  };

  fitCanvas();

  if (options.autoResize !== false) {
    const resizeTarget = options.canvas.parentElement ?? options.canvas;
    resizeObserver = new ResizeObserver(fitCanvas);
    resizeObserver.observe(resizeTarget);
  }

  if (options.autoStart !== false) {
    game.start();
  }

  return game;
}
