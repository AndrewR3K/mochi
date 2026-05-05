<script setup lang="ts">
defineProps<{
  brandTitle: string;
  demoLabel: string;
}>();
</script>

<template>
  <header class="demo-shell-header">
    <h1 class="demo-shell-header__title">{{ brandTitle }}</h1>
    <p class="demo-shell-header__subtitle">{{ demoLabel }}</p>
  </header>
</template>

<style scoped>
.demo-shell-header {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  text-align: right;
  pointer-events: none;
}

.demo-shell-header__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.demo-shell-header__subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  opacity: 0.75;
}
</style>
