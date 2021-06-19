'use strict';

module.exports = {
  root: true,
  plugins: ['node'],
  extends: [
    'not-an-aardvark/node',
    'plugin:node/recommended',
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
      // Apply eslint-plugin rules to our own rules/tests (but not docs).
      files: ['lib/**/*.js', 'tests/**/*.js'],
      plugins: ['self'],
      extends: ['plugin:self/all'],
      rules: {
        'self/report-message-format': ['error', '^[^a-z].*.$'],
        'self/require-meta-docs-url': 'off',
      },
    },
    {
      files: ['tests/**/*.js'],
      env: { mocha: true },
    },
    {
      files: ['**/*.md'],
      processor: 'markdown/markdown',
    },
    {
      // Markdown JS code samples in documentation:
      files: ['**/*.md/*.js'],
      plugins: ['markdown'],
      noInlineConfig: true,
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        strict: 'off',

        'unicorn/filename-case': 'off',
      },
    },
  ],
};
