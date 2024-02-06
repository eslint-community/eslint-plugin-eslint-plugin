'use strict';

const mod = require('../lib/index.js');

module.exports = {
  plugins: { 'eslint-plugin': mod },
  rules: mod.configs['all-type-checked'].rules,
};
