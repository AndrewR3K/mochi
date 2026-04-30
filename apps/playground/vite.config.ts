import path from 'node:path';
import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const monorepoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      '@mochi/vue': path.join(monorepoRoot, 'packages/vue/src'),
      '@mochi/gameplay': path.join(monorepoRoot, 'packages/gameplay/src'),
      '@mochi/renderer-webgl': path.join(
        monorepoRoot,
        'packages/renderer-webgl/src',
      ),
      '@mochi/core': path.join(monorepoRoot, 'packages/core/src'),
    },
  },
  server: {
    fs: {
      allow: [monorepoRoot],
    },
  },
});
