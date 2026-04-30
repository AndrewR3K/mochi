import { createInputController, type InputState, type InputWriter } from './input';
import { World } from './world';

export interface FrameContext {
  runtime: Runtime;
  world: World;
  input: InputState;
  delta: number;
  elapsed: number;
}

export type FrameCallback = (context: FrameContext) => void;

export interface RuntimeOptions {
  fixedStep?: number;
  timeScale?: number;
  maxDelta?: number;
  maxFixedSteps?: number;
}

export interface RuntimeStats {
  frame: number;
  rawDelta: number;
  delta: number;
  elapsed: number;
}

export interface Runtime {
  readonly world: World;
  readonly input: InputState;
  readonly inputWriter: InputWriter;
  readonly stats: RuntimeStats;
  readonly paused: boolean;
  readonly timeScale: number;
  tick(delta: number): void;
  step(delta?: number): void;
  setTimeScale(timeScale: number): void;
  pause(): void;
  resume(): void;
  onFrame(callback: FrameCallback): () => void;
  reset(): void;
}

export function createRuntime(options: RuntimeOptions = {}): Runtime {
  const world = new World();
  const input = createInputController();
  const frameListeners = new Set<FrameCallback>();
  const stats: RuntimeStats = {
    frame: 0,
    rawDelta: 0,
    delta: 0,
    elapsed: 0,
  };

  let accumulator = 0;
  let paused = false;
  let timeScale = options.timeScale ?? 1;
  const maxDelta = options.maxDelta ?? Infinity;
  const maxFixedSteps = options.maxFixedSteps ?? Infinity;

  const runFrame = (delta: number) => {
    stats.frame += 1;
    stats.delta = delta;
    stats.elapsed += delta;

    const context: FrameContext = {
      runtime,
      world,
      input: input.state,
      delta,
      elapsed: stats.elapsed,
    };

    for (const listener of frameListeners) {
      listener(context);
    }
    input.writer.resetFrame();
  };

  const runtime: Runtime = {
    world,
    input: input.state,
    inputWriter: input.writer,
    stats,
    get paused() {
      return paused;
    },
    get timeScale() {
      return timeScale;
    },
    tick(delta) {
      stats.rawDelta = delta;
      if (paused) {
        stats.delta = 0;
        input.writer.resetFrame();
        return;
      }

      const scaledDelta = Math.min(delta, maxDelta) * timeScale;
      if (!options.fixedStep) {
        runFrame(scaledDelta);
        return;
      }

      accumulator += scaledDelta;
      let steps = 0;
      while (accumulator >= options.fixedStep && steps < maxFixedSteps) {
        runFrame(options.fixedStep);
        accumulator -= options.fixedStep;
        steps += 1;
      }

      if (steps === maxFixedSteps) {
        accumulator = 0;
      }
    },
    step(delta = options.fixedStep ?? 1 / 60) {
      stats.rawDelta = delta;
      runFrame(delta);
    },
    setTimeScale(nextTimeScale) {
      timeScale = Math.max(0, nextTimeScale);
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    onFrame(callback) {
      frameListeners.add(callback);
      return () => {
        frameListeners.delete(callback);
      };
    },
    reset() {
      accumulator = 0;
      paused = false;
      timeScale = options.timeScale ?? 1;
      stats.frame = 0;
      stats.rawDelta = 0;
      stats.delta = 0;
      stats.elapsed = 0;
      world.clear();
      input.writer.clear();
      frameListeners.clear();
    },
  };

  return runtime;
}
