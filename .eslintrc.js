'use strict';

const plugin = require('.');
const allRules = Object.keys(plugin.rules)
  .reduce((rules, ruleName) => Object.assign(rules, { [`self/${ruleName}`]: 'error' }), {});

module.exports = {
  plugins: [
    'node',
    'self',
  ],
  extends: [
    'not-an-aardvark/node',
    'plugin:node/recommended',
  ],
  root: true,
  rules: Object.assign(allRules, {
    'require-jsdoc': 'error',
    'self/report-message-format': ['error', '^[^a-z].*\\.$'],
  }),
};
