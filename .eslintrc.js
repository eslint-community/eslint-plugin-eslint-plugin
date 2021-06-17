'use strict';

module.exports = {
  root: true,
  plugins: ['node', 'self'],
  extends: [
    'not-an-aardvark/node',
    'plugin:node/recommended',
    'plugin:self/all',
    'plugin:unicorn/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script',
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        functions: 'never', // disallow trailing commas in function(es2017)
      },
    ],
    'require-jsdoc': 'error',

    'self/meta-property-ordering': 'off',
    'self/require-meta-docs-url': 'off',
    'self/report-message-format': ['error', '^[^a-z].*.$'],

    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: { mocha: true },
      plugins: ['mocha'],
      extends: ['plugin:mocha/recommended'],
      rules: {
        'prefer-arrow-callback': 'off', // Avoid conflict with mocha/no-mocha-arrows.

        'mocha/no-setup-in-describe': 'off', // Lots of false positives with dynamically-generated tests.
      },
    },
  ],
};
