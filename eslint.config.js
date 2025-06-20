import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import markdown from 'eslint-plugin-markdown';
import pluginN from 'eslint-plugin-n';
import eslintPluginConfig from 'eslint-plugin-eslint-plugin/configs/all';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends(
    'not-an-aardvark/node',
    'plugin:@eslint-community/eslint-comments/recommended',
    'plugin:prettier/recommended',
    'plugin:unicorn/recommended',
  ),
  ...pluginN.configs['flat/mixed-esm-and-cjs'],
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
      'unicorn/prefer-node-protocol': 'off', // TODO: enable once we drop support for Node 14.17.
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    // Apply eslint-plugin rules to our own rules/tests (but not docs).
    files: ['lib/**/*.js', 'tests/**/*.js'],
    plugins: eslintPluginConfig.plugins,
    rules: {
      ...eslintPluginConfig.rules,
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
    files: ['tests/**/*.js'],
    languageOptions: { sourceType: 'module' },
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
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

      '@eslint-community/eslint-comments/require-description': 'off',

      'unicorn/filename-case': 'off',
    },
  },
];
