<script setup lang="ts">
import { GameCanvas } from '@lite3d/vue';
import { computed, shallowRef } from 'vue';

import FirstPersonRangeDemo from './demos/FirstPersonRangeDemo.vue';
import NightfallDemo from './DemoScene.vue';
import OrbitalIslandsDemo from './demos/OrbitalIslandsDemo.vue';
import PresetLabDemo from './demos/PresetLabDemo.vue';
import TacticsBoardDemo from './demos/TacticsBoardDemo.vue';
import VelocityCircuitDemo from './demos/VelocityCircuitDemo.vue';

type DemoId = 'nightfall' | 'orbital' | 'velocity' | 'presets' | 'range' | 'tactics';

const selectedDemo = shallowRef<DemoId>('nightfall');
const demos = [
  { id: 'nightfall', label: 'Nightfall Run', component: NightfallDemo },
  { id: 'orbital', label: 'Orbital Islands', component: OrbitalIslandsDemo },
  { id: 'velocity', label: 'Velocity Circuit', component: VelocityCircuitDemo },
  { id: 'presets', label: 'Preset Lab', component: PresetLabDemo },
  { id: 'range', label: 'First Person Range', component: FirstPersonRangeDemo },
  { id: 'tactics', label: 'Tactics Board', component: TacticsBoardDemo },
] as const;

const currentDemo = computed(
  () => demos.find((demo) => demo.id === selectedDemo.value) ?? demos[0],
);
</script>

<template>
  <div class="app">
    <main class="app__viewport">
      <GameCanvas class="app__canvas">
        <nav class="app__switcher" aria-label="Demo switcher">
          <button
            v-for="demo in demos"
            :key="demo.id"
            class="app__switcher-button"
            :class="{ 'app__switcher-button--active': demo.id === selectedDemo }"
            type="button"
            @click="selectedDemo = demo.id"
          >
            {{ demo.label }}
          </button>
        </nav>
        <header class="app__header">
          <h1 class="app__title">lite3d</h1>
          <p class="app__subtitle">{{ currentDemo.label }}</p>
        </header>
        <component :is="currentDemo.component" />
      </GameCanvas>
    </main>
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  height: 100%;
}

.app {
  height: 100%;
  background: #050508;
  color: #e8e8ec;
  font-family:
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    sans-serif;
}

.app__header {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  text-align: right;
  pointer-events: none;
}

.app__switcher {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  z-index: 2;
  display: flex;
  max-width: calc(100% - 2rem);
  padding: 0.35rem;
  gap: 0.5rem;
  overflow-x: auto;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 999px;
  background: rgb(5 5 8 / 72%);
  backdrop-filter: blur(12px);
  transform: translateX(-50%);
}

.app__switcher-button {
  flex: 0 0 auto;
  padding: 0.45rem 0.7rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #e8e8ec;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.app__switcher-button--active {
  background: #e8e8ec;
  color: #090b12;
}

.app__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.app__subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  opacity: 0.75;
}

.app__viewport {
  height: 100%;
  min-height: 0;
}

.app__canvas {
  display: block;
  height: 100%;
}
</style>
