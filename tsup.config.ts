import { defineConfig } from 'tsup';

export default defineConfig({
  bundle: false,
  clean: true,
  dts: true,
  entry: ['lib/**/*.ts'],
  format: ['esm'],
  outDir: 'dist',
});
