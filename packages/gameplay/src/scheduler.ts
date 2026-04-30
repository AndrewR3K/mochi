import type { GameScene } from './scene';

export interface SceneScheduleEvent {
  elapsed: number;
  delta: number;
  executions: number;
}

export interface SceneScheduleOptions {
  repeat?: boolean;
  immediate?: boolean;
}

export interface SceneScheduledTask {
  readonly active: boolean;
  cancel(): void;
}

export interface SceneScheduler {
  delay(seconds: number, callback: (event: SceneScheduleEvent) => void): SceneScheduledTask;
  interval(seconds: number, callback: (event: SceneScheduleEvent) => void, options?: SceneScheduleOptions): SceneScheduledTask;
  clear(): void;
  reset(): void;
  dispose(): void;
}

interface TaskRecord {
  delay: number;
  remaining: number;
  repeat: boolean;
  callback: (event: SceneScheduleEvent) => void;
  active: boolean;
  executions: number;
}

export function createSceneScheduler(scene: GameScene): SceneScheduler {
  const tasks: TaskRecord[] = [];
  let elapsed = 0;

  const unsubscribe = scene.onFrame(({ delta }) => {
    elapsed += delta;

    for (const task of tasks) {
      if (!task.active) continue;

      task.remaining -= delta;
      if (task.remaining > 0) continue;

      task.executions += 1;
      task.callback({ elapsed, delta, executions: task.executions });

      if (task.repeat && task.active) {
        task.remaining += task.delay;
      } else {
        task.active = false;
      }
    }
  });

  const scheduler: SceneScheduler = {
    delay(seconds, callback) {
      return addTask(seconds, callback, false, false);
    },
    interval(seconds, callback, options = {}) {
      return addTask(seconds, callback, true, options.immediate ?? false);
    },
    clear() {
      for (const task of tasks) {
        task.active = false;
      }
      tasks.length = 0;
    },
    reset() {
      elapsed = 0;
      scheduler.clear();
    },
    dispose() {
      scheduler.clear();
      unsubscribe();
    },
  };

  scene.addReset(scheduler.reset);
  scene.addCleanup(scheduler.dispose);

  return scheduler;

  function addTask(
    seconds: number,
    callback: (event: SceneScheduleEvent) => void,
    repeat: boolean,
    immediate: boolean,
  ): SceneScheduledTask {
    const task: TaskRecord = {
      delay: seconds,
      remaining: immediate ? 0 : seconds,
      repeat,
      callback,
      active: true,
      executions: 0,
    };

    tasks.push(task);

    return {
      get active() {
        return task.active;
      },
      cancel() {
        task.active = false;
      },
    };
  }
}
