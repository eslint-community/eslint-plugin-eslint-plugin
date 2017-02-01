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
        const scope = escope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
        const identifiers = utils.getContextIdentifiers(scope, ast);

        assert(identifiers instanceof Set, 'getContextIdentifiers should return a Set');
        Array.from(identifiers).forEach((identifier, index) => {
          assert.strictEqual(identifier, CASES[ruleSource](ast)[index]);
        });
      });
    });
  });

  describe('getKeyName', () => {
    const CASES = {
      '({ foo: 1 })': 'foo',
      '({ "foo": 1 })': 'foo',
      '({ ["foo"]: 1 })': 'foo',
      '({ [`foo`]: 1 })': 'foo',
      '({ foo() {} })': 'foo',
      '({ "foo"() {} })': 'foo',
      '({ ["foo"]() {} })': 'foo',
      '({ [`foo`]() {} })': 'foo',
      '({ 5: 1 })': '5',
      '({ 0x123: 1 })': '291',
      '({ [foo]: 1 })': null,
      '({ [tag`foo`]: 1 })': null,
      '({ ["foo" + "bar"]: 1 })': null,
    };
    Object.keys(CASES).forEach(objectSource => {
      it(objectSource, () => {
        const ast = espree.parse(objectSource, { ecmaVersion: 6 });

        assert.strictEqual(utils.getKeyName(ast.body[0].expression.properties[0]), CASES[objectSource]);
      });
    });
  });

  describe('getTestInfo', () => {
    describe('the file does not have valid tests', () => {
      [
        '',
        'module.exports = context => context.report(foo);',
        'new (require("eslint").NotRuleTester).run(foo, bar, { valid: [] })',
        'new NotRuleTester().run(foo, bar, { valid: [] })',
        'new RuleTester()',
        'const foo = new RuleTester; bar.run(foo, bar, { valid: [] })',
        'new RuleTester().run()',
        'new RuleTester().run(foo)',
        'new RuleTester().run(foo, bar)',
        'new RuleTester().run(foo, bar, notAnObject)',
      ].forEach(noTestsCase => {
        it(`returns no tests for ${noTestsCase}`, () => {
          const ast = espree.parse(noTestsCase, { ecmaVersion: 8 });
          const scope = escope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
          assert.deepEqual(utils.getTestInfo(scope, ast), [], 'Expected no tests to be found');
        });
      });
    });

    describe('the file has valid tests', () => {
      const CASES = {
        'new RuleTester().run(bar, baz, { valid: [foo], invalid: [bar, baz] })': { valid: 1, invalid: 2 },
        'var foo = new RuleTester(); foo.run(bar, baz, { valid: [foo], invalid: [bar] })': { valid: 1, invalid: 1 },
        'var foo = new (require("eslint")).RuleTester; foo.run(bar, baz, { valid: [], invalid: [] })': { valid: 0, invalid: 0 },
        'var foo = new bar.RuleTester; foo.run(bar, baz, { valid: [], invalid: [bar, baz] })': { valid: 0, invalid: 2 },
      };

      Object.keys(CASES).forEach(testSource => {
        it(testSource, () => {
          const ast = espree.parse(testSource, { ecmaVersion: 6 });
          const scope = escope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
          const testInfo = utils.getTestInfo(scope, ast);

          assert.strictEqual(testInfo.length, 1, 'Expected to find one test run');

          assert.strictEqual(
            testInfo[0].valid.length,
            CASES[testSource].valid,
            `Expected ${CASES[testSource].valid} valid cases but got ${testInfo[0].valid.length}`
          );

          assert.strictEqual(
            testInfo[0].invalid.length,
            CASES[testSource].invalid,
            `Expected ${CASES[testSource].invalid} invalid cases but got ${testInfo[0].invalid.length}`
          );
        });
      });
    });

    describe('the file has multiple test runs', () => {
      const CASES = {
        [`
          new RuleTester().run(foo, bar, { valid: [foo], invalid: [] });
          new RuleTester().run(foo, bar, { valid: [], invalid: [foo, bar] });
        `]: [{ valid: 1, invalid: 0 }, { valid: 0, invalid: 2 }],

        [`
          var foo = new RuleTester;
          var bar = new RuleTester;
          foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
        `]: [{ valid: 3, invalid: 1 }, { valid: 0, invalid: 2 }],

        [`
          var foo = new RuleTester, bar = new RuleTester;
          foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
        `]: [{ valid: 3, invalid: 1 }, { valid: 0, invalid: 2 }],

      };

      Object.keys(CASES).forEach(testSource => {
        it(testSource, () => {
          const ast = espree.parse(testSource, { ecmaVersion: 6 });
          const scope = escope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
          const testInfo = utils.getTestInfo(scope, ast);

          assert.strictEqual(
            testInfo.length,
            CASES[testSource].length,
            `Expected to find ${CASES[testSource].length} test runs but got ${testInfo.length}`
          );

          CASES[testSource].forEach((testRun, index) => {
            assert.strictEqual(
              testRun.valid,
              testInfo[index].valid.length,
              `On run ${index + 1}, expected ${testRun.valid} valid cases but got ${testInfo[index].valid.length}`
            );
            assert.strictEqual(
              testRun.invalid,
              testInfo[index].invalid.length,
              `On run ${index + 1}, expected ${testRun.invalid} valid cases but got ${testInfo[index].invalid.length}`
            );
          });
        });
      });
    });
  });
});
