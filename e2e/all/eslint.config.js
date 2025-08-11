import { defineConfig } from 'eslint/config';

import eslintPlugin from 'eslint-plugin-eslint-plugin';

export default defineConfig([
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    extends: [eslintPlugin.configs.all],
    files: ['./index.js', './rule.js'],
  },
]);
