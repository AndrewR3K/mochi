<script setup lang="ts">
import { GameCanvas } from '@mochi/vue';
import { computed, shallowRef } from 'vue';

import FirstGameScene from './game/FirstGameScene.vue';

const score = shallowRef(0);
const status = shallowRef('Collect all 3 signals.');
const showDebug = shallowRef(false);
const complete = computed(() => score.value >= 3);
</script>

<template>
  <main class="starter">
    <GameCanvas
      class="starter__canvas"
      :runtime="{ fixedStep: 1 / 60, maxDelta: 0.1, maxFixedSteps: 5 }"
      :clear-color="[0.03, 0.035, 0.06, 1]"
    >
      <FirstGameScene
        :show-debug="showDebug"
        @score="score = $event"
        @status="status = $event"
      />

      <section class="starter__hud" aria-label="Game status">
        <p class="starter__eyebrow">Mochi alpha starter</p>
        <h1 class="starter__title">Signal Grove</h1>
        <p class="starter__status">{{ status }}</p>
        <p class="starter__score">Signals: {{ score }} / 3</p>
        <button
          class="starter__button"
          type="button"
          @click="showDebug = !showDebug"
        >
          {{ showDebug ? 'Hide debug' : 'Show debug' }}
        </button>
        <p class="starter__help">
          WASD to move, mouse drag to look, Space to jump.
        </p>
      </section>

      <div v-if="complete" class="starter__win">
        Alpha loop complete
      </div>
    </GameCanvas>
  </main>
</template>

<style scoped>
.starter {
  height: 100vh;
  margin: 0;
  overflow: hidden;
  background: #050711;
  color: #f2f6ff;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.starter__canvas {
  height: 100%;
}

.starter__hud {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  width: min(24rem, calc(100% - 2rem));
  padding: 1rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 1rem;
  background: rgb(6 9 18 / 72%);
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 30%);
  backdrop-filter: blur(16px);
}

.starter__eyebrow,
.starter__help,
.starter__score,
.starter__status {
  margin: 0;
}

.starter__eyebrow {
  color: #86efac;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.starter__title {
  margin: 0.2rem 0 0.5rem;
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  line-height: 1;
}

.starter__status {
  color: rgb(242 246 255 / 78%);
}

.starter__score {
  margin-top: 0.85rem;
  font-weight: 700;
}

.starter__button {
  margin-top: 0.9rem;
  padding: 0.55rem 0.8rem;
  border: 0;
  border-radius: 999px;
  background: #f2f6ff;
  color: #090d18;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.starter__help {
  margin-top: 0.75rem;
  color: rgb(242 246 255 / 62%);
  font-size: 0.84rem;
}

.starter__win {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  background: #86efac;
  color: #08110d;
  font-weight: 800;
}
</style>
