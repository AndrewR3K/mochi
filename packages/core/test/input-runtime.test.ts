import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createInputController, createRuntime } from '../src';

describe('input controller', () => {
  it('tracks held keys separately from one-frame key presses', () => {
    const input = createInputController();

    input.writer.setKey('KeyW', true);
    assert.equal(input.state.isKeyDown('KeyW'), true);
    assert.equal(input.state.wasKeyPressed('KeyW'), true);

    input.writer.resetFrame();
    assert.equal(input.state.isKeyDown('KeyW'), true);
    assert.equal(input.state.wasKeyPressed('KeyW'), false);

    input.writer.setKey('KeyW', false);
    assert.equal(input.state.isKeyDown('KeyW'), false);
  });

  it('accumulates pointer movement during a frame and clears deltas on reset', () => {
    const input = createInputController();

    input.writer.setPointerPosition(10, 20);
    input.writer.setPointerPosition(13, 18);

    assert.equal(input.state.pointer.x, 13);
    assert.equal(input.state.pointer.y, 18);
    assert.equal(input.state.pointer.deltaX, 13);
    assert.equal(input.state.pointer.deltaY, 18);

    input.writer.resetFrame();
    assert.equal(input.state.pointer.deltaX, 0);
    assert.equal(input.state.pointer.deltaY, 0);
  });
});

describe('runtime frame loop', () => {
  it('runs variable-step listeners once per tick and clears pressed input afterward', () => {
    const runtime = createRuntime();
    const deltas: number[] = [];

    runtime.inputWriter.setKey('Space', true);
    runtime.onFrame(({ delta, input }) => {
      deltas.push(delta);
      assert.equal(input.wasKeyPressed('Space'), true);
    });

    runtime.tick(0.016);

    assert.deepEqual(deltas, [0.016]);
    assert.equal(runtime.input.wasKeyPressed('Space'), false);
    assert.equal(runtime.input.isKeyDown('Space'), true);
  });

  it('uses fixed-step accumulation when configured', () => {
    const runtime = createRuntime({ fixedStep: 0.1 });
    const elapsed: number[] = [];

    runtime.onFrame(({ elapsed: frameElapsed }) => {
      elapsed.push(frameElapsed);
    });

    runtime.tick(0.05);
    runtime.tick(0.2);

    assert.equal(runtime.stats.frame, 2);
    assert.deepEqual(elapsed, [0.1, 0.2]);
    assert.equal(runtime.stats.delta, 0.1);
  });

  it('supports time scaling, pause, and manual stepping', () => {
    const runtime = createRuntime({ timeScale: 0.5 });
    const deltas: number[] = [];

    runtime.onFrame(({ delta }) => {
      deltas.push(delta);
    });

    runtime.tick(0.2);
    runtime.pause();
    runtime.tick(0.2);
    runtime.step(0.1);
    runtime.resume();
    runtime.setTimeScale(2);
    runtime.tick(0.1);

    assert.deepEqual(deltas, [0.1, 0.1, 0.2]);
    assert.equal(runtime.stats.rawDelta, 0.1);
    assert.equal(runtime.paused, false);
    assert.equal(runtime.timeScale, 2);
  });

  it('clamps large fixed-step catch-up work', () => {
    const runtime = createRuntime({
      fixedStep: 0.1,
      maxDelta: 1,
      maxFixedSteps: 3,
    });
    const deltas: number[] = [];

    runtime.onFrame(({ delta }) => {
      deltas.push(delta);
    });
    runtime.tick(4);

    assert.deepEqual(deltas, [0.1, 0.1, 0.1]);
    assert.equal(runtime.stats.rawDelta, 4);
    assert.equal(runtime.stats.elapsed, 0.30000000000000004);
  });

  it('reset clears world, listeners, input, and stats', () => {
    const runtime = createRuntime();
    let frames = 0;

    runtime.world.createEntity({ id: 'player' });
    runtime.inputWriter.setKey('KeyA', true);
    runtime.onFrame(() => {
      frames += 1;
    });
    runtime.tick(0.016);

    runtime.reset();
    runtime.tick(0.016);

    assert.equal(frames, 1);
    assert.equal(runtime.world.getEntity('player'), undefined);
    assert.equal(runtime.input.isKeyDown('KeyA'), false);
    assert.equal(runtime.stats.frame, 1);
  });
});
