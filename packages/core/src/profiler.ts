import type { FrameContext, Runtime } from './runtime';

export type RuntimeProfilerBudgetSource = 'delta' | 'rawDelta';

export interface RuntimeProfilerOptions {
  frameBudget?: number;
  maxSamples?: number;
  budgetSource?: RuntimeProfilerBudgetSource;
}

export interface RuntimeProfilerSample {
  frame: number;
  delta: number;
  rawDelta: number;
  elapsed: number;
  fps: number;
  overBudget: boolean;
}

export interface RuntimeProfilerSummary {
  samples: number;
  frameBudget: number;
  averageDelta: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  maxDelta: number;
  overBudgetFrames: number;
  totalSampledTime: number;
}

export interface RuntimeProfiler {
  readonly samples: readonly RuntimeProfilerSample[];
  readonly summary: RuntimeProfilerSummary;
  reset(): void;
  dispose(): void;
}

export function createRuntimeProfiler(
  runtime: Runtime,
  options: RuntimeProfilerOptions = {},
): RuntimeProfiler {
  const frameBudget = options.frameBudget ?? 1 / 60;
  const maxSamples = Math.max(1, Math.floor(options.maxSamples ?? 120));
  const budgetSource = options.budgetSource ?? 'rawDelta';
  const samples: RuntimeProfilerSample[] = [];
  let summary = createEmptySummary(frameBudget);

  const unsubscribe = runtime.onFrame((context) => {
    const sample = createSample(context, frameBudget, budgetSource);
    samples.push(sample);

    while (samples.length > maxSamples) {
      samples.shift();
    }

    summary = summarizeSamples(samples, frameBudget);
  });

  return {
    get samples() {
      return samples;
    },
    get summary() {
      return summary;
    },
    reset() {
      samples.length = 0;
      summary = createEmptySummary(frameBudget);
    },
    dispose() {
      unsubscribe();
    },
  };
}

export function summarizeRuntimeSamples(
  samples: readonly RuntimeProfilerSample[],
  frameBudget = 1 / 60,
): RuntimeProfilerSummary {
  return summarizeSamples(samples, frameBudget);
}

function createSample(
  context: FrameContext,
  frameBudget: number,
  budgetSource: RuntimeProfilerBudgetSource,
): RuntimeProfilerSample {
  const rawDelta = context.runtime.stats.rawDelta;
  const budgetDelta = budgetSource === 'rawDelta' && rawDelta > 0 ? rawDelta : context.delta;
  const fps = context.delta > 0 ? 1 / context.delta : 0;

  return {
    frame: context.runtime.stats.frame,
    delta: context.delta,
    rawDelta,
    elapsed: context.elapsed,
    fps,
    overBudget: budgetDelta > frameBudget,
  };
}

function summarizeSamples(
  samples: readonly RuntimeProfilerSample[],
  frameBudget: number,
): RuntimeProfilerSummary {
  if (samples.length === 0) return createEmptySummary(frameBudget);

  let totalDelta = 0;
  let totalFps = 0;
  let minFps = Infinity;
  let maxFps = 0;
  let maxDelta = 0;
  let overBudgetFrames = 0;

  for (const sample of samples) {
    totalDelta += sample.delta;
    totalFps += sample.fps;
    minFps = Math.min(minFps, sample.fps);
    maxFps = Math.max(maxFps, sample.fps);
    maxDelta = Math.max(maxDelta, sample.delta);
    if (sample.overBudget) overBudgetFrames += 1;
  }

  return {
    samples: samples.length,
    frameBudget,
    averageDelta: totalDelta / samples.length,
    averageFps: totalFps / samples.length,
    minFps,
    maxFps,
    maxDelta,
    overBudgetFrames,
    totalSampledTime: totalDelta,
  };
}

function createEmptySummary(frameBudget: number): RuntimeProfilerSummary {
  return {
    samples: 0,
    frameBudget,
    averageDelta: 0,
    averageFps: 0,
    minFps: 0,
    maxFps: 0,
    maxDelta: 0,
    overBudgetFrames: 0,
    totalSampledTime: 0,
  };
}
