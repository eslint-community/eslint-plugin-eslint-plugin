'use strict';

const { getPathIgnorePattern } = require('eslint-remote-tester-repositories');

/** @type {import('eslint-remote-tester').Config} */
module.exports = {
  /** Repositories to scan */
  repositories: [
    // A few dozen top ESLint plugins.
    'Intellicode/eslint-plugin-react-native',
    'JoshuaKGoldberg/eslint-plugin-expect-type',
    'SonarSource/eslint-plugin-sonarjs',
    'avajs/eslint-plugin-ava',
    'cypress-io/eslint-plugin-cypress',
    'dangreenisrael/eslint-plugin-jest-formatting',
    'ember-cli/eslint-plugin-ember',
    'emberjs/eslint-plugin-ember-internal',
    'eslint-community/eslint-plugin-eslint-plugin',
    'eslint-community/eslint-plugin-n',
    'eslint-community/eslint-plugin-promise',
    'eslint-community/eslint-plugin-security',
    'eslint-functional/eslint-plugin-functional',
    'eslint/eslint',
    'import-js/eslint-plugin-import',
    'jest-community/eslint-plugin-jest',
    'jest-community/eslint-plugin-jest-extended',
    'jsx-eslint/eslint-plugin-jsx-a11y',
    'jsx-eslint/eslint-plugin-react',
    'lo1tuma/eslint-plugin-mocha',
    'ota-meshi/eslint-plugin-regexp',
    'platinumazure/eslint-plugin-qunit',
    'sindresorhus/eslint-plugin-unicorn',
    'square/eslint-plugin-square',
    'storybookjs/eslint-plugin-storybook',
    'testing-library/eslint-plugin-jest-dom',
    'testing-library/eslint-plugin-testing-library',
    'typescript-eslint/typescript-eslint',
  ],

  /** Optional pattern used to exclude paths */
  pathIgnorePattern: getPathIgnorePattern(),

  /** Extensions of files under scanning */
  extensions: ['js', 'ts'],

  /** Optional boolean flag used to enable caching of cloned repositories. For CIs it's ideal to disable caching. Defaults to true. */
  cache: false,

  /** ESLint configuration */
  eslintrc: {
    extends: ['plugin:eslint-plugin/all'],
  },
};
