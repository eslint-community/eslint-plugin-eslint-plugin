import { defineConfig } from 'tsdown';

export default defineConfig({
  unbundle: true,
  dts: true,
  entry: ['lib/**/*.ts'],
  outDir: 'dist',
});
