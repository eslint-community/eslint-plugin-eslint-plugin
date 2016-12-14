'use strict';

const util = require('util');
const lodash = require('lodash');
const espree = require('espree');
const escope = require('escope');
const assert = require('chai').assert;
const utils = require('../../lib/utils');

describe('utils', () => {
  describe('getRuleInfo', () => {
    describe('the file does not have a valid rule', () => {
      [
        '',
        'module.exports;',
        'module.exports = foo;',
        'module.boop = function() {};',
        'exports = function() {};',
        'module.exports = function* () {};',
        'module.exports = async function () {};',
        'module.exports = {};',
        'module.exports = { meta: {} }',
        'module.exports = { create: {} }',
        'module.exports = { create: foo }',
        'module.exports = { create: function* foo() {} }',
        'module.exports = { create: async function foo() {} }',
      ].forEach(noRuleCase => {
        it(`returns null for ${noRuleCase}`, () => {
          const ast = espree.parse(noRuleCase, { ecmaVersion: 8 });
          assert.isNull(utils.getRuleInfo(ast), 'Expected no rule to be found');
        });
      });
    });

    describe('the file has a valid rule', () => {
      const CASES = {
        'module.exports = { create: function foo() {} };': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } }, // (This property will actually contain the AST node.)
          meta: null,
          isNewStyle: true,
        },
        'module.exports = { create: () => { } };': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: true,
        },
        'module.exports = { create() {}, meta: { } };': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'module.exports.create = function foo() {}; module.exports.meta = {}': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'exports.create = function foo() {}; exports.meta = {};': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'module.exports = { create: () => { } }; exports.create = function foo() {}; exports.meta = {};': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: true,
        },
        'exports.meta = {}; module.exports = { create: () => { } };': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: true,
        },
        'module.exports = { create: () => { } }; module.exports.meta = {};': {
          create: { type: 'ArrowFunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'module.exports = { meta: {} }; module.exports.create = () => { };': {
          create: { type: 'ArrowFunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'module.exports = { "meta": {} }; module.exports.create = () => { };': {
          create: { type: 'ArrowFunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'module.exports = { create: () => { } }; exports.meta = {};': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: true,
        },
        'module.exports = function foo() {}': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: null,
          isNewStyle: false,
        },
        'module.exports = () => {}': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
        'exports.meta = {}; module.exports = () => {}': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
        'module.exports = () => {}; module.exports.meta = {};': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
      };

      Object.keys(CASES).forEach(ruleSource => {
        it(ruleSource, () => {
          const ast = espree.parse(ruleSource, { ecmaVersion: 6 });
          const ruleInfo = utils.getRuleInfo(ast);
          assert(
            lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${util.inspect(ruleInfo)}\nto match\n${util.inspect(CASES[ruleSource])}`
          );
        });
      });
    });
  });

  describe('getContextIdentifiers', () => {
    const CASES = {
      'module.exports = context => { context; context; context; }' (ast) {
        return [
          ast.body[0].expression.right.body.body[0].expression,
          ast.body[0].expression.right.body.body[1].expression,
          ast.body[0].expression.right.body.body[2].expression,
        ];
      },
      'module.exports = { meta: {}, create(context, foo = context) {} }' (ast) {
        return [ast.body[0].expression.right.properties[1].value.params[1].right];
      },
      'module.exports = { meta: {}, create(notContext) { notContext; notContext; notContext; } }' (ast) {
        return [
          ast.body[0].expression.right.properties[1].value.body.body[0].expression,
          ast.body[0].expression.right.properties[1].value.body.body[1].expression,
          ast.body[0].expression.right.properties[1].value.body.body[2].expression,
        ];
      },
    };

    Object.keys(CASES).forEach(ruleSource => {
      it(ruleSource, () => {
        const ast = espree.parse(ruleSource, { ecmaVersion: 6 });
        const scope = escope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script' });
        const identifiers = utils.getContextIdentifiers(scope, ast);

        assert(identifiers instanceof Set, 'getContextIdentifiers should return a Set');
        Array.from(identifiers).forEach((identifier, index) => {
          assert.strictEqual(identifier, CASES[ruleSource](ast)[index]);
        });
      });
    });
  });
});
