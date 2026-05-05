<script setup lang="ts">
import type { DemoId } from '../../demoRegistry';

defineProps<{
  demos: readonly { id: DemoId; label: string }[];
  selectedId: DemoId;
}>();

const emit = defineEmits<{
  select: [id: DemoId];
}>();
</script>

<template>
  <nav class="demo-switcher" aria-label="Demo switcher">
    <button
      v-for="demo in demos"
      :key="demo.id"
      class="demo-switcher__button"
      :class="{ 'demo-switcher__button--active': demo.id === selectedId }"
      type="button"
      @click="emit('select', demo.id)"
    >
      {{ demo.label }}
    </button>
  </nav>
</template>

<style scoped>
.demo-switcher {
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

.demo-switcher__button {
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

.demo-switcher__button--active {
  background: #e8e8ec;
  color: #090b12;
}
</style>
