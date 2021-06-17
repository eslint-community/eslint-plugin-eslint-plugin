'use strict';

const { inspect } = require('util');
const lodash = require('lodash');
const espree = require('espree');
const eslintScope = require('eslint-scope');
const estraverse = require('estraverse');
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
          const ast = espree.parse(noRuleCase, { ecmaVersion: 8, range: true });
          assert.isNull(utils.getRuleInfo({ ast }), 'Expected no rule to be found');
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
          const ast = espree.parse(ruleSource, { ecmaVersion: 6, range: true });
          const ruleInfo = utils.getRuleInfo({ ast });
          assert(
            lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(CASES[ruleSource])}`
          );
        });
      });

      for (const scopeOptions of [
        { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true },
        { ignoreEval: true, ecmaVersion: 6, sourceType: 'script' },
        { ignoreEval: true, ecmaVersion: 6, sourceType: 'module' },
      ]) {
        const ast = espree.parse(`
          const create = () => {};
          const meta = {};
          module.exports = { create, meta };
        `, { ecmaVersion: 6 });
        const expected = {
          create: { type: 'Identifier' },
          meta: { type: 'Identifier' },
          isNewStyle: true,
        };
        it(`ScopeOptions: ${JSON.stringify(scopeOptions)}`, () => {
          const scopeManager = eslintScope.analyze(ast, scopeOptions);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            lodash.isMatch(ruleInfo, expected),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(expected)}`
          );
        });
      }
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
        const ast = espree.parse(ruleSource, { ecmaVersion: 6, range: true });
        const scope = eslintScope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
        const identifiers = utils.getContextIdentifiers(scope, ast);

        assert(identifiers instanceof Set, 'getContextIdentifiers should return a Set');
        [...identifiers].forEach((identifier, index) => {
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
        const ast = espree.parse(objectSource, { ecmaVersion: 6, range: true });

        assert.strictEqual(utils.getKeyName(ast.body[0].expression.properties[0]), CASES[objectSource]);
      });
    });

    const CASES_ES9 = {
      '({ ...foo })': null,
    };
    Object.keys(CASES_ES9).forEach(objectSource => {
      it(objectSource, () => {
        const ast = espree.parse(objectSource, { ecmaVersion: 9, range: true });

        assert.strictEqual(utils.getKeyName(ast.body[0].expression.properties[0]), CASES_ES9[objectSource]);
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
          const ast = espree.parse(noTestsCase, { ecmaVersion: 8, range: true });
          const scope = eslintScope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
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
        'var foo = new bar.RuleTester; foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] })': { valid: 0, invalid: 2 },
      };

      Object.keys(CASES).forEach(testSource => {
        it(testSource, () => {
          const ast = espree.parse(testSource, { ecmaVersion: 6, range: true });
          const scope = eslintScope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
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
          const ast = espree.parse(testSource, { ecmaVersion: 6, range: true });
          const scope = eslintScope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });
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

  describe('getReportInfo', () => {
    const CASES = new Map([
      [[], () => null],
      [['foo', 'bar'], () => null],
      [['foo', '"bar"', 'baz', 'qux', 'boop'], args => ({ node: args[0], message: args[1], data: args[2], fix: args[3] })],
      [['foo', '`bar`', 'baz', 'qux', 'boop'], args => ({ node: args[0], message: args[1], data: args[2], fix: args[3] })],
      [
        ['foo', '{ bar: 1 }', 'baz', 'qux', 'boop'],
        args => ({ node: args[0], loc: args[1], message: args[2], data: args[3], fix: args[4] }),
      ],
      [['foo', 'bar', 'baz'], () => null],
      [
        ['{ node, message }'],
        () => ({
          node: { type: 'Identifier', name: 'node', start: 17, end: 21 },
          message: { type: 'Identifier', name: 'message', start: 23, end: 30 },
        }),
      ],
    ]);

    for (const args of CASES.keys()) {
      it(args.join(', '), () => {
        const parsedArgs = espree.parse(
          `context.report(${args.join(', ')})`,
          { ecmaVersion: 6, loc: false, range: false }
        ).body[0].expression.arguments;
        const context = { getScope () {} }; // mock object
        const reportInfo = utils.getReportInfo(parsedArgs, context);

        assert.deepEqual(reportInfo, CASES.get(args)(parsedArgs));
      });
    }
  });

  describe('getSourceCodeIdentifiers', () => {
    const CASES = {
      'module.exports = context => { const sourceCode = context.getSourceCode(); sourceCode; foo; }': 2,
      'module.exports = context => { const x = 1, sc = context.getSourceCode(); sc; sc; sc; sourceCode; }': 4,
      'module.exports = context => { const sourceCode = context.getNotSourceCode(); }': 0,
    };

    Object.keys(CASES).forEach(testSource => {
      it(testSource, () => {
        const ast = espree.parse(testSource, { ecmaVersion: 6, range: true });
        const scope = eslintScope.analyze(ast, { ignoreEval: true, ecmaVersion: 6, sourceType: 'script', nodejsScope: true });

        estraverse.traverse(ast, {
          enter (node, parent) {
            node.parent = parent;
          },
        });

        assert.strictEqual(utils.getSourceCodeIdentifiers(scope, ast).size, CASES[testSource]);
      });
    });
  });
});
