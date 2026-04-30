<script setup lang="ts">
import {
  createGame,
  type FrameCallback,
  type Game,
  type RuntimeOptions,
} from '@mochi/gameplay';
import {
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useTemplateRef,
} from 'vue';

import { gameInjectionKey } from './injection';

const props = withDefaults(
  defineProps<{
    maxPixelRatio?: number;
    clearColor?: [number, number, number, number];
    runtime?: RuntimeOptions;
    autoStart?: boolean;
    onFrame?: FrameCallback;
  }>(),
  {
    maxPixelRatio: 2,
    clearColor: () => [0.04, 0.04, 0.08, 1],
    autoStart: true,
  },
);

const emit = defineEmits<{
  ready: [game: Game];
}>();

const rootEl = useTemplateRef<HTMLElement>('root');
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');
const gameRef = shallowRef<Game | null>(null);
const ready = shallowRef(false);

provide(gameInjectionKey, gameRef);

let unsubscribeFrame: (() => void) | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  const root = rootEl.value;
  if (!canvas || !root) return;

  const game = createGame({
    canvas,
    runtime: props.runtime,
    maxPixelRatio: props.maxPixelRatio,
    autoStart: props.autoStart,
    renderer: {
      clearColor: props.clearColor,
    },
  });

  unsubscribeFrame = props.onFrame ? game.onFrame(props.onFrame) : null;
  game.setSize(root.clientWidth, root.clientHeight);

  gameRef.value = game;
  ready.value = true;
  emit('ready', game);
});

onBeforeUnmount(() => {
  unsubscribeFrame?.();
  unsubscribeFrame = null;
  const game = gameRef.value;
  if (game) {
    game.dispose();
  }
  gameRef.value = null;
  ready.value = false;
});
</script>

<template>
  <div ref="root" class="mochi-game-canvas">
    <canvas ref="canvas" class="mochi-game-canvas__canvas" />
    <slot v-if="ready" />
  </div>
</template>

<style scoped>
.mochi-game-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  overflow: hidden;
}

.mochi-game-canvas__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
