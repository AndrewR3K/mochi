<script setup lang="ts">
import { withBase } from 'vitepress';
import { demos } from '../demoCatalog';
</script>

<template>
  <div class="demo-gallery">
    <a v-for="demo in demos" :key="demo.id" class="demo-card" :href="withBase(`/demos/${demo.id}`)">
      <div class="demo-card__eyebrow">Live demo</div>
      <h2>{{ demo.title }}</h2>
      <p>{{ demo.description }}</p>
      <span>Play {{ demo.title }} →</span>
    </a>
  </div>
</template>

<style scoped>
.demo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-top: 28px;
}
.demo-card {
  display: block;
  padding: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
}
</style>
