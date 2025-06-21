import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['lib/index.ts'],
  format: ['esm'],
  outDir: 'dist',
});
