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
const PLUGIN_NAME = require('../package').name.replace(/^eslint-plugin-/, '');

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------


// import all rules in lib/rules
const allRules = fs
  .readdirSync(`${__dirname}/rules`)
  .filter(fileName => fileName.endsWith('.js') && /^[^._]/.test(fileName))
  .map(fileName => fileName.replace(/\.js$/, ''))
  .reduce((rules, ruleName) => Object.assign(rules, { [ruleName]: require(path.join(__dirname, 'rules', ruleName)) }), {});

module.exports.rules = allRules;

module.exports.configs = {
  recommended: {
    rules: Object.keys(allRules)
        .filter(ruleName => allRules[ruleName].meta.docs.recommended)
        .reduce((rules, ruleName) => Object.assign(rules, { [`${PLUGIN_NAME}/${ruleName}`]: 2 }), {}),
  },
};
