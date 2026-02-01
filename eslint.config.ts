import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier/flat';
import markdown from 'eslint-plugin-markdown';
import n from 'eslint-plugin-n';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import eslintPlugin from './lib/index.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default defineConfig([
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
  ...compat.extends(
    'not-an-aardvark/node',
  ),

  // base config
  {
    files: ['**/*.{js,ts}'],
    languageOptions: { parser: tseslint.parser, sourceType: 'module' },
    plugins: { js, n, 'eslint-plugin': eslintPlugin },
    extends: [prettier, "js/recommended", tseslint.configs.recommended, "n/recommended", unicorn.configs.recommended, eslintComments.recommended],
    rules: {
      'n/no-missing-import': 'off',

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

  {
    // Apply eslint-plugin rules to our own rules/tests (but not docs).
    files: ['lib/**/*.ts', 'tests/**/*.ts'],
    plugins: { 'eslint-plugin': eslintPlugin },
    extends: ['eslint-plugin/all'],
    rules: {
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
