/**
 * @fileoverview the configs for `eslint.config.js`
 * @link https://eslint.org/docs/latest/use/configure/configuration-files-new
 * @author 唯然<weiran.zsd@outlook.com>
 */

'use strict';

const { configs, rules } = require('../lib/index.js');
const configNames = Object.keys(configs);

configNames.forEach((configName) => {
  // the only difference is the `plugins` property must be an object
  // TODO: we might better copy the config instead of mutating it, in case it's used by somewhere else
  configs[configName].plugins = { 'eslint-plugin': { rules } };
});

module.exports = configs;
