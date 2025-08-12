import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier/flat';
import markdown from 'eslint-plugin-markdown';
import pluginN from 'eslint-plugin-n';
import tseslint from 'typescript-eslint';

import eslintPlugin from './lib/index.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default tseslint.config([
  // Global ignores
  {
    ignores: [
      'node_modules',
      'coverage',
      'dist',
      'tests/lib/fixtures',
      'e2e/fixtures',
    ],
  },
  // Global settings
  {
    languageOptions: { parser: tseslint.parser, sourceType: 'module' },
  },
  ...compat.extends(
    'not-an-aardvark/node',
    'plugin:@eslint-community/eslint-comments/recommended',
    'plugin:unicorn/recommended',
  ),
  pluginN.configs['flat/recommended'],
  prettier,
  {
    rules: {
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@eslint-community/eslint-comments/require-description': 'error',

      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-nested-ternary': 'off',
    },
  },
  // TypeScript rules
  tseslint.configs.recommended.map((config) => ({
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    ...config,
    rules: { ...config.rules, 'n/no-missing-import': 'off' },
  })),
  {
    // Apply eslint-plugin rules to our own rules/tests (but not docs).
    files: ['lib/**/*.ts', 'tests/**/*.ts'],
    plugins: { 'eslint-plugin': eslintPlugin },
    rules: {
      ...eslintPlugin.configs.all.rules,
      'eslint-plugin/no-meta-schema-default': 'off', // TODO: enable once https://github.com/bmish/eslint-doc-generator/issues/513 is fixed and released
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
    files: ['**/*.md'],
    plugins: { markdown },
    processor: 'markdown/markdown',
  },
  {
    // Markdown JS code samples in documentation:
    files: ['**/*.md/*.js', '**/*.md/*.ts'],
    plugins: { markdown },
    linterOptions: { noInlineConfig: true },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      strict: 'off',

      '@eslint-community/eslint-comments/require-description': 'off',

      'n/no-missing-import': 'off',

      'unicorn/filename-case': 'off',
    },
  },
]);
