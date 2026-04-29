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
      '@lite3d/vue': path.join(monorepoRoot, 'packages/vue/src'),
      '@lite3d/gameplay': path.join(monorepoRoot, 'packages/gameplay/src'),
      '@lite3d/renderer-webgl': path.join(
        monorepoRoot,
        'packages/renderer-webgl/src',
      ),
      '@lite3d/core': path.join(monorepoRoot, 'packages/core/src'),
    },
  },
  server: {
    fs: {
      allow: [monorepoRoot],
    },
  },
});
