<script setup lang="ts">
import { GameCanvas } from '@mochi-labs/vue';
import { computed } from 'vue';

import DemoShellHeader from './components/playground/DemoShellHeader.vue';
import DemoSwitcherBar from './components/playground/DemoSwitcherBar.vue';
import { usePlaygroundDemoSelection } from './composables/usePlaygroundDemoSelection';
import { demoRegistry } from './demoRegistry';

const { selectedDemo, currentDemo, selectDemo } = usePlaygroundDemoSelection(demoRegistry);

const demoTabs = computed(() =>
  demoRegistry.map((demo) => ({ id: demo.id, label: demo.label })),
);
</script>

<template>
  <div class="app">
    <main class="app__viewport">
      <GameCanvas class="app__canvas">
        <DemoSwitcherBar :demos="demoTabs" :selected-id="selectedDemo" @select="selectDemo" />
        <DemoShellHeader brand-title="Mochi" :demo-label="currentDemo.label" />
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

.app__viewport {
  height: 100%;
  min-height: 0;
}

.app__canvas {
  display: block;
  height: 100%;
}
</style>
