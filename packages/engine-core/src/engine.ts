import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

export type FrameCallback = (delta: number, elapsed: number) => void;

export interface EngineOptions {
  /** Passed to WebGLRenderer */
  antialias?: boolean;
  /** Cap devicePixelRatio (default 2) */
  maxPixelRatio?: number;
  onFrame?: FrameCallback;
  clearColor?: number;
  /** Opacity of the clear color; 0 = transparent canvas */
  clearAlpha?: number;
}

export interface Engine {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly clock: Clock;
  start(): void;
  stop(): void;
  dispose(): void;
  /** Resize renderer and camera from CSS pixel dimensions */
  setSize(width: number, height: number): void;
  /** Runs after the main onFrame hook, before render. Returns unsubscribe. */
  addFrameListener(cb: FrameCallback): () => void;
}

export function createEngine(
  canvas: HTMLCanvasElement,
  options: EngineOptions = {},
): Engine {
  const {
    antialias = true,
    maxPixelRatio = 2,
    onFrame,
    clearColor = 0x000000,
    clearAlpha = 1,
  } = options;

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 2000);
  camera.position.set(0, 2, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({
    canvas,
    antialias,
    alpha: clearAlpha < 1,
  });
  renderer.setClearColor(clearColor, clearAlpha);

  const clock = new Clock();
  const frameListeners = new Set<FrameCallback>();

  const setSize = (width: number, height: number) => {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const pr = Math.min(
      typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      maxPixelRatio,
    );
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const tick = () => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    onFrame?.(delta, elapsed);
    for (const cb of frameListeners) {
      cb(delta, elapsed);
    }
    renderer.render(scene, camera);
  };

  const addFrameListener = (cb: FrameCallback) => {
    frameListeners.add(cb);
    return () => {
      frameListeners.delete(cb);
    };
  };

  let running = false;

  const start = () => {
    if (running) return;
    running = true;
    clock.start();
    renderer.setAnimationLoop(tick);
  };

  const stop = () => {
    running = false;
    renderer.setAnimationLoop(null);
  };

  const dispose = () => {
    stop();
    frameListeners.clear();
    renderer.dispose();
  };

  return {
    scene,
    camera,
    renderer,
    clock,
    start,
    stop,
    dispose,
    setSize,
    addFrameListener,
  };
}
