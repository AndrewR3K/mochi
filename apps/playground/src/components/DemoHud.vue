<script setup lang="ts">
withDefaults(defineProps<{
  mode: string;
  title: string;
  meta?: string;
  hint?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  wide?: boolean;
}>(), {
  meta: '',
  hint: '',
  position: 'bottom-right',
  wide: false,
});
</script>

<template>
  <section
    class="demo-hud"
    :class="[
      `demo-hud--${position}`,
      { 'demo-hud--wide': wide },
    ]"
  >
    <p class="demo-hud__mode">{{ mode }}</p>
    <h2 class="demo-hud__title">{{ title }}</h2>
    <p v-if="meta" class="demo-hud__meta">{{ meta }}</p>
    <p v-if="hint" class="demo-hud__hint">{{ hint }}</p>
    <slot />
  </section>
</template>

<style scoped>
.demo-hud {
  position: absolute;
  z-index: 2;
  width: min(24rem, calc(100% - 2rem));
  padding: 0.95rem 1rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 8px;
  background: rgb(5 5 8 / 74%);
  color: #eef4ff;
  backdrop-filter: blur(12px);
}

.demo-hud--wide {
  width: min(30rem, calc(100% - 2rem));
}

.demo-hud--top-left {
  top: 1rem;
  left: 1rem;
}

.demo-hud--top-right {
  top: 4rem;
  right: 1rem;
}

.demo-hud--bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.demo-hud--bottom-right {
  right: 1rem;
  bottom: 1rem;
}

.demo-hud__mode,
.demo-hud__title,
.demo-hud__meta,
.demo-hud__hint {
  margin: 0;
}

.demo-hud__mode {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  opacity: 0.72;
}

.demo-hud__title {
  margin-top: 0.25rem;
  font-size: 1.45rem;
  line-height: 1.08;
}

.demo-hud__meta {
  margin-top: 0.35rem;
  font-size: 0.86rem;
  opacity: 0.82;
}

.demo-hud__hint {
  margin-top: 0.55rem;
  font-size: 0.8rem;
  opacity: 0.76;
}
</style>
