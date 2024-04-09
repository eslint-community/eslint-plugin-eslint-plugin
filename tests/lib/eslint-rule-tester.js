/**
 * @fileoverview Helpers for tests.
 * @author 唯然<weiran.zsd@outlook.com>
 */

'use strict';

const eslintVersion = require('eslint/package.json').version;
const { RuleTester } = require('eslint');
const { FlatRuleTester } = require('eslint/use-at-your-own-risk');

// greater than or equal to ESLint v9
exports.gteEslintV9 = +eslintVersion.split('.')[0] >= 9;

exports.RuleTester = exports.gteEslintV9 ? RuleTester : FlatRuleTester;
