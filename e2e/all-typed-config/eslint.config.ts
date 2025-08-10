import { defineConfig } from 'eslint/config';

import eslintPlugin from 'eslint-plugin-eslint-plugin';

export default defineConfig([
  {
    extends: [eslintPlugin.configs.all],
    files: ['./index.js', './rule.js'],
  },
]);
