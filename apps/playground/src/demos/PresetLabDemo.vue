<script setup lang="ts">
import { useGame } from '@lite3d/vue';
import {
  CONTROLLER_PRESET_KINDS,
  createControllerPreset,
  type ControllerPresetKind,
  type Entity,
  type ThirdPersonController,
} from '@lite3d/gameplay';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import DemoHud from '../components/DemoHud.vue';

const presetLabels: Record<ControllerPresetKind, string> = {
  firstPerson: 'First Person',
  thirdPersonOrbit: 'Third Person Orbit',
  thirdPersonOverShoulder: 'Over Shoulder',
  topDown: 'Top Down',
  isometric: 'Isometric',
  sideScroller2D: 'Side Scroller',
  vehicleArcade: 'Vehicle Arcade',
  vehicleSim: 'Vehicle Sim',
  railCamera: 'Rail Camera',
  strategyFreeCam: 'Strategy Free Cam',
};

const game = useGame();
const scene = game.createScene();
const selectedPreset = shallowRef<ControllerPresetKind>('thirdPersonOrbit');
let controller: ThirdPersonController | null = null;
scene.addCleanup(() => {
  controller?.dispose();
});

scene.createEntity({
  id: 'preset-lab-ground',
  transform: { scale: { x: 26, y: 1, z: 26 } },
  renderable: {
    primitive: 'plane',
    material: { color: { x: 0.08, y: 0.09, z: 0.13 } },
  },
});

const player = createBox('preset-lab-player', 0, 0.7, 0, 0.9, 1.4, 0.9, {
  x: 0.48,
  y: 0.66,
  z: 1,
});

const markers = [
  createBox('preset-marker-a', -5.5, 0.5, -4.5, 1, 1, 1, { x: 0.22, y: 0.5, z: 1 }),
  createBox('preset-marker-b', 5.5, 0.5, -4.5, 1, 1, 1, { x: 1, y: 0.38, z: 0.24 }),
  createBox('preset-marker-c', 5.5, 0.5, 4.5, 1, 1, 1, { x: 0.42, y: 1, z: 0.55 }),
  createBox('preset-marker-d', -5.5, 0.5, 4.5, 1, 1, 1, { x: 0.9, y: 0.55, z: 1 }),
];

const activeLabel = computed(() => presetLabels[selectedPreset.value]);

selectPreset(selectedPreset.value);

scene.onFrame(({ delta }) => {
  for (const marker of markers) {
    marker.transform.rotation.y += delta;
  }
});

onBeforeUnmount(() => {
  scene.dispose();
});

function selectPreset(kind: ControllerPresetKind): void {
  controller?.dispose();
  selectedPreset.value = kind;
  scene.reset();
  controller = createControllerPreset(game, kind, {
    target: player,
    groundY: 0.7,
    bounds: { minX: -11.5, maxX: 11.5, minZ: -11.5, maxZ: 11.5 },
  });
}

function createBox(
  id: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: { x: number; y: number; z: number },
): Entity {
  return scene.createEntity({
    id,
    transform: { position: { x, y, z }, scale: { x: sx, y: sy, z: sz } },
    renderable: { primitive: 'cube', material: { color } },
  });
}
</script>

<template>
  <DemoHud
    mode="PRESET LAB"
    :title="activeLabel"
    hint="Switch control models live. WASD/arrows move, Space jumps where supported, right mouse or drag orbits where supported."
    position="bottom-left"
    wide
  >
    <div class="preset-lab__grid">
      <button
        v-for="kind in CONTROLLER_PRESET_KINDS"
        :key="kind"
        class="preset-lab__button"
        :class="{ 'preset-lab__button--active': selectedPreset === kind }"
        type="button"
        @click="selectPreset(kind)"
      >
        {{ presetLabels[kind] }}
      </button>
    </div>
  </DemoHud>
</template>

<style scoped>
.preset-lab__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.preset-lab__button {
  padding: 0.45rem 0.65rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 8px;
  background: rgb(255 255 255 / 7%);
  color: inherit;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.preset-lab__button--active {
  background: #eef4ff;
  color: #090b12;
}
</style>
