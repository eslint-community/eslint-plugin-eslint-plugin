import rule from './rule.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: '@e2e/all-typed-config',
    version: '1.0.0',
  },
  rules: { 'e2e-test': rule },
  configs: {
    recommended: {
      name: '@e2e/all-typed-config/recommended',
      plugins: {
        get ['@e2e/all-typed-config']() {
          return plugin;
        },
      },
      rules: {
        '@e2e/all-typed-config/e2e-test': 'error',
      },
    },
  },
};

export default plugin;
