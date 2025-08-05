import { defineConfig } from 'tsdown';

export default defineConfig({
  unbundle: true,
  clean: true,
  dts: true,
  entry: ['lib/**/*.ts'],
  format: ['esm'],
  outDir: 'dist',
});
