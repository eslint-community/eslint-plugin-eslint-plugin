/**
 * @fileoverview the `tests-recommended` config for `eslint.config.js`
 * @author 唯然<weiran.zsd@outlook.com>
 */

'use strict';

const { configs, rules } = require('../lib/index.js');

module.exports = {
  plugins: { 'eslint-plugin': { rules } },
  rules: configs['tests-recommended'].rules,
};
