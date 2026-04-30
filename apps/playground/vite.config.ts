import path from 'node:path';
import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const monorepoRoot = fileURLToPath(new URL('../..', import.meta.url));
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      '@mochi-labs/vue': path.join(monorepoRoot, 'packages/vue/src'),
      '@mochi-labs/gameplay': path.join(monorepoRoot, 'packages/gameplay/src'),
      '@mochi-labs/renderer-webgl': path.join(
        monorepoRoot,
        'packages/renderer-webgl/src',
      ),
      '@mochi-labs/core': path.join(monorepoRoot, 'packages/core/src'),
    },
  },
  server: {
    fs: {
      allow: [monorepoRoot],
    },
  },
});
