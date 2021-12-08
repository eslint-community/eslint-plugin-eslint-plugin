/**
 * @fileoverview An ESLint plugin for linting ESLint plugins
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const packageMetadata = require('../package');
const PLUGIN_NAME = packageMetadata.name.replace(/^eslint-plugin-/, '');

const configFilters = {
  all: () => true,
  recommended: (rule) => rule.meta.docs.recommended,
  rules: (rule) => rule.meta.docs.category === 'Rules',
  tests: (rule) => rule.meta.docs.category === 'Tests',
  'rules-recommended': (rule) =>
    configFilters.recommended(rule) && configFilters.rules(rule),
  'tests-recommended': (rule) =>
    configFilters.recommended(rule) && configFilters.tests(rule),
};

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------

// import all rules in lib/rules
const allRules = Object.fromEntries(
  fs
    .readdirSync(`${__dirname}/rules`)
    .filter((fileName) => fileName.endsWith('.js') && /^[^._]/.test(fileName))
    .map((fileName) => fileName.replace(/\.js$/, ''))
    .map((ruleName) => [
      ruleName,
      require(path.join(__dirname, 'rules', ruleName)),
    ])
);

module.exports.rules = allRules;

// eslint-disable-next-line unicorn/prefer-object-from-entries
module.exports.configs = Object.keys(configFilters).reduce(
  (configs, configName) => {
    return Object.assign(configs, {
      [configName]: {
        plugins: ['eslint-plugin'],
        rules: Object.fromEntries(
          Object.keys(allRules)
            .filter((ruleName) => configFilters[configName](allRules[ruleName]))
            .map((ruleName) => [`${PLUGIN_NAME}/${ruleName}`, 'error'])
        ),
      },
    });
  },
  {}
);
