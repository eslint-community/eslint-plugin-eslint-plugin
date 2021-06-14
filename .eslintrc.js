'use strict';

module.exports = {
  root: true,
  plugins: ['node', 'self'],
  extends: [
    'not-an-aardvark/node',
    'plugin:node/recommended',
    'plugin:self/all',
  ],
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
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: { mocha: true },
    },
  ],
};
