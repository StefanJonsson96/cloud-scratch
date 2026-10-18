import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` produces a single self-contained dist/index.html that can be
// opened straight from disk (double-click) or hosted anywhere.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  server: { host: true },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
