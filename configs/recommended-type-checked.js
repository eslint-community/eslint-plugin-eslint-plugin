'use strict';

const mod = require('../lib/index.js');

module.exports = {
  plugins: { 'eslint-plugin': mod },
  rules: mod.configs['recommended-type-checked'].rules,
};
