import rule from './rule.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: '@e2e/all',
    version: '1.0.0',
  },
  rules: { 'e2e-test': rule },
  configs: {
    recommended: {
      name: '@e2e/all/recommended',
      plugins: {
        get ['@e2e/all']() {
          return plugin;
        },
      },
      rules: {
        '@e2e/all/e2e-test': 'error',
      },
    },
  },
};

export default plugin;
