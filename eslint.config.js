'use strict';

/*
 * IMPORTANT!
 *
 * Any changes made to this file must also be made to .eslintrc.js.
 *
 * Internally, ESLint is using the eslint.config.js file to lint itself.
 * The .eslintrc.js file is needed too, because:
 *
 * 1. There are tests that expect .eslintrc.js to be present to actually run.
 * 2. ESLint VS Code extension expects eslintrc config files to be
 *    present to work correctly.
 *
 * Once we no longer need to support both eslintrc and flat config, we will
 * remove .eslintrc.js.
 */
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');
const markdown = require('eslint-plugin-markdown');
const eslintPlugin = require('eslint-plugin-eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends(
    'not-an-aardvark/node',
    'plugin:eslint-comments/recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
    'plugin:unicorn/recommended'
  ),
  {
    languageOptions: { sourceType: 'commonjs' },
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

      'eslint-comments/no-unused-disable': 'error',
      'eslint-comments/require-description': 'error',

      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'off', // TODO: enable once we drop support for Node 14.17.
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    // Apply eslint-plugin rules to our own rules/tests (but not docs).
    files: ['lib/**/*.js', 'tests/**/*.js'],
    plugins: { 'eslint-plugin': eslintPlugin },
    ...eslintPlugin.configs.recommended,
    rules: {
      'eslint-plugin/report-message-format': ['error', '^[^a-z].*.$'],
      'eslint-plugin/require-meta-docs-url': [
        'error',
        {
          pattern:
            'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/{{name}}.md',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: globals.mocha },
  },
  {
    files: ['**/*.md'],
    processor: 'markdown/markdown',
  },
  {
    // Markdown JS code samples in documentation:
    files: ['**/*.md/*.js'],
    plugins: { markdown },
    linterOptions: { noInlineConfig: true },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      strict: 'off',

      'eslint-comments/require-description': 'off',

      'unicorn/filename-case': 'off',
    },
  },
];
