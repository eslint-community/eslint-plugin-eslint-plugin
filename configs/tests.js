/**
 * @fileoverview the `tests` config for `eslint.config.js`
 * @author 唯然<weiran.zsd@outlook.com>
 */

'use strict';

const mod = require('../lib/index.js');

module.exports = {
  plugins: { 'eslint-plugin': mod },
  rules: mod.configs.tests.rules,
};
