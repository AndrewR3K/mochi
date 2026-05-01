import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createRuntime,
  createRuntimeProfiler,
  summarizeRuntimeSamples,
} from '../src';

describe('runtime profiler', () => {
  it('samples runtime frames and summarizes frame pacing', () => {
    const runtime = createRuntime();
    const profiler = createRuntimeProfiler(runtime, {
      frameBudget: 1 / 30,
      maxSamples: 2,
      budgetSource: 'delta',
    });

    runtime.tick(1 / 60);
    runtime.tick(1 / 20);
    runtime.tick(1 / 30);

    assert.equal(profiler.samples.length, 2);
    assert.equal(profiler.samples[0].frame, 2);
    assert.equal(profiler.samples[0].overBudget, true);
    assert.equal(profiler.summary.samples, 2);
    assert.equal(profiler.summary.overBudgetFrames, 1);
    assert.equal(profiler.summary.maxDelta, 1 / 20);
    assert.ok(profiler.summary.averageFps > 0);
  });

  it('can use raw host delta to catch fixed-step frame stalls', () => {
    const runtime = createRuntime({ fixedStep: 1 / 60 });
    const profiler = createRuntimeProfiler(runtime, {
      frameBudget: 1 / 30,
      budgetSource: 'rawDelta',
    });

    runtime.tick(0.12);

    assert.equal(profiler.samples.length, 7);
    assert.equal(profiler.summary.overBudgetFrames, 7);
    assert.equal(profiler.samples[0].delta, 1 / 60);
    assert.equal(profiler.samples[0].rawDelta, 0.12);
  });

  it('resets, disposes, and summarizes sample arrays directly', () => {
    const runtime = createRuntime();
    const profiler = createRuntimeProfiler(runtime);

    runtime.tick(0.01);
    profiler.reset();
    runtime.tick(0.02);
    profiler.dispose();
    runtime.tick(0.03);

    const summary = summarizeRuntimeSamples(profiler.samples);

    assert.equal(profiler.samples.length, 1);
    assert.equal(profiler.summary.samples, 1);
    assert.equal(summary.samples, 1);
    assert.equal(summary.averageDelta, 0.02);
  });
});
