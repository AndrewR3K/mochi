<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';

const props = defineProps<{ demo?: string }>();

const src = computed(() => {
  const query = props.demo ? `?demo=${encodeURIComponent(props.demo)}` : '';
  return withBase(`/demos/playground/${query}`);
});
</script>

<template>
  <iframe class="demo-frame" :src="src" allow="gamepad; fullscreen" />
</template>

<style scoped>
.demo-frame {
  width: 100%;
  height: min(720px, calc(100vh - 160px));
  min-height: 520px;
  border: 0;
  border-radius: 18px;
  overflow: hidden;
  background: #050508;
  box-shadow: 0 24px 80px rgb(0 0 0 / 28%);
}
</style>
