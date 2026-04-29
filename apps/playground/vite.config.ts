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
      '@lite3d/engine-vue': path.join(monorepoRoot, 'packages/engine-vue/src'),
      '@lite3d/game': path.join(monorepoRoot, 'packages/game/src'),
      '@lite3d/render-webgl': path.join(
        monorepoRoot,
        'packages/render-webgl/src',
      ),
      '@lite3d/runtime': path.join(monorepoRoot, 'packages/runtime/src'),
    },
  },
  server: {
    fs: {
      allow: [monorepoRoot],
    },
  },
});
