<script setup lang="ts">
import { withBase } from 'vitepress';
import { demos } from '../demoCatalog';
</script>

<template>
  <div class="demo-gallery">
    <a
      v-for="demo in demos"
      :key="demo.id"
      class="demo-card"
      :href="withBase(`/demos/${demo.id}`)"
    >
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
  background:
    radial-gradient(circle at top right, rgb(25 195 125 / 16%), transparent 34%),
    var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.demo-card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 18px 50px rgb(0 0 0 / 16%);
}

.demo-card__eyebrow {
  margin-bottom: 12px;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.demo-card h2 {
  margin: 0;
  border: 0;
  font-size: 1.2rem;
}

.demo-card p {
  margin: 10px 0 18px;
  color: var(--vp-c-text-2);
}

.demo-card span {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}
</style>
