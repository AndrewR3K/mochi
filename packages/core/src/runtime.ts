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
}

export interface RuntimeStats {
  frame: number;
  delta: number;
  elapsed: number;
}

export interface Runtime {
  readonly world: World;
  readonly input: InputState;
  readonly inputWriter: InputWriter;
  readonly stats: RuntimeStats;
  tick(delta: number): void;
  onFrame(callback: FrameCallback): () => void;
  reset(): void;
}

export function createRuntime(options: RuntimeOptions = {}): Runtime {
  const world = new World();
  const input = createInputController();
  const frameListeners = new Set<FrameCallback>();
  const stats: RuntimeStats = {
    frame: 0,
    delta: 0,
    elapsed: 0,
  };

  let accumulator = 0;

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
    tick(delta) {
      if (!options.fixedStep) {
        runFrame(delta);
        return;
      }

      accumulator += delta;
      while (accumulator >= options.fixedStep) {
        runFrame(options.fixedStep);
        accumulator -= options.fixedStep;
      }
    },
    onFrame(callback) {
      frameListeners.add(callback);
      return () => {
        frameListeners.delete(callback);
      };
    },
    reset() {
      accumulator = 0;
      stats.frame = 0;
      stats.delta = 0;
      stats.elapsed = 0;
      world.clear();
      input.writer.clear();
      frameListeners.clear();
    },
  };

  return runtime;
}
