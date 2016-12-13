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

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------


// import all rules in lib/rules
module.exports.rules = fs
  .readdirSync(`${__dirname}/rules`)
  .filter(fileName => fileName.endsWith('.js') && /^[^._]/.test(fileName))
  .map(fileName => fileName.replace(/\.js$/, ''))
  .reduce((rules, ruleName) => Object.assign(rules, { [ruleName]: require(path.join(__dirname, 'rules', ruleName)) }), {});
