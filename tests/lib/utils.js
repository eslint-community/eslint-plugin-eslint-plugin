import { inspect } from 'node:util';

import typescriptEslintParser from '@typescript-eslint/parser';
import * as eslintScope from 'eslint-scope';
import * as espree from 'espree';
import * as estraverse from 'estraverse';
import lodash from 'lodash';
import { assert, describe, it } from 'vitest';

import * as utils from '../../lib/utils.js';

describe('utils', () => {
  describe('getRuleInfo', () => {
    describe('the file does not have a valid rule (CJS)', () => {
      [
        '',
        'module.exports;',
        'module.exports = foo;',
        'const foo = {}; module.exports = foo;',
        'const foo = function() { return {}; }; module.exports = foo;',
        'const foo = 123; module.exports = foo;',
        'module.boop = function(context) { return {};};',
        'exports = function(context) { return {};};',
        'module.exports = function* (context) { return {}; };',
        'module.exports = async function (context) { return {};};',
        'module.exports = {};',
        'module.exports = { meta: {} }',
        'module.exports = { create: {} }',
        'module.exports = { create: foo }',
        'module.exports = { create: function* foo() {} }',
        'module.exports = { create: async function foo() {} }',
        'module.exports = { create, meta }',
        'module.exports = { create: getCreate(), meta: getMeta() }',

        // Function-style rule but missing object return.
        'module.exports = (context) => { }',
        'module.exports = (context) => { return; }',
        'module.exports = (context) => { return 123; }',
        'module.exports = (context) => { return FOO; }',
        'module.exports = function foo(context) { }',
        'module.exports = (context) => { }',
        'exports.meta = {}; module.exports = (context) => { }',
        'module.exports = (context) => { }; module.exports.meta = {};',

        // Function-style rule but missing context parameter.
        'module.exports = () => { return {}; }',
        'module.exports = (foo, bar) => { return {}; }',

        // Correct TypeScript helper structure but we don't support CJS for TypeScript rules:
        'module.exports = createESLintRule({ create() {}, meta: {} });',
        'module.exports = util.createRule({ create() {}, meta: {} });',
        'module.exports = ESLintUtils.RuleCreator(docsUrl)({ create() {}, meta: {} });',

        // Named export of a rule, only supported in ESM within this plugin
        'module.exports.rule = { create: function() {} };',
        'exports.rule = { create: function() {} };',
        'const rule = { create: function() {} }; module.exports.rule = rule;',
        'const rule = { create: function() {} }; exports.rule = rule;',
      ].forEach((noRuleCase) => {
        it(`returns null for ${noRuleCase}`, () => {
          const ast = espree.parse(noRuleCase, { ecmaVersion: 8, range: true });
          const scopeManager = eslintScope.analyze(ast);
          assert.isNull(
            utils.getRuleInfo({ ast, scopeManager }),
            'Expected no rule to be found',
          );
        });
      });
    });

    describe('the file does not have a valid rule (ESM)', () => {
      [
        '',
        'export default { foo: {} }',
        'const foo = {}; export default foo',
        'const foo = 123; export default foo',
        'const foo = function(){}; export default foo',

        // Exports function but no object return inside function.
        'export default function (context) { }',
        'export default function (context) { return; }',
        'export default function (context) { return 123; }',
        'export default function (context) { return FOO; }',

        // Function-style rule but missing context parameter.
        'export default function () { return {}; }',
        'export default function (foo, bar) { return {}; }',

        // named export of functions
        // refs: https://github.com/eslint-community/eslint-plugin-eslint-plugin/issues/450
        'export function foo(options) { return {}; }',
        'export async function foo(options) { return {}; }',
        'export const foo = function (options) { return {}; }',
        'export const foo = (options) => { return {}; }',
        'export function foo(options) { return; }',
        'export function foo({opt1, opt2}) { return {}; }',

        // Incorrect TypeScript helper structure:
        'export default foo()({ create() {}, meta: {} });',
        'export default foo().bar({ create() {}, meta: {} });',
        'export default foo.bar.baz({ create() {}, meta: {} });',
        'export default foo(123);',
        'export default foo.bar(123);',
        'export default foo.bar()(123);',
      ].forEach((noRuleCase) => {
        it(`returns null for ${noRuleCase}`, () => {
          const ast = espree.parse(noRuleCase, {
            ecmaVersion: 8,
            range: true,
            sourceType: 'module',
          });
          const scopeManager = eslintScope.analyze(ast);
          assert.isNull(
            utils.getRuleInfo({ ast, scopeManager }),
            'Expected no rule to be found',
          );
        });
      });
    });

    describe('the file does not have a valid rule (TypeScript + TypeScript parser + ESM)', () => {
      [
        // Incorrect TypeScript helper structure:
        'export default foo()<Options, MessageIds>({ create() {}, meta: {} });',
        'export default foo().bar<Options, MessageIds>({ create() {}, meta: {} });',
        'export default foo.bar.baz<Options, MessageIds>({ create() {}, meta: {} });',
        'export default foo<Options, MessageIds>(123);',
        'export default foo.bar<Options, MessageIds>(123);',
        'export default foo.bar()<Options, MessageIds>(123);',
        'const notRule = foo(); export default notRule;',
        'const notRule = function(){}; export default notRule;',
        'const notRule = {}; export default notRule;',
        'const notRule = {}; export = notRule;',
        'const notRule: Rule.RuleModule = {}; export = notRule;',
        'export = {};',
      ].forEach((noRuleCase) => {
        it(`returns null for ${noRuleCase}`, () => {
          const ast = typescriptEslintParser.parse(noRuleCase, {
            ecmaVersion: 8,
            range: true,
            sourceType: 'module',
          });
          const scopeManager = eslintScope.analyze(ast);
          assert.isNull(
            utils.getRuleInfo({ ast, scopeManager }),
            'Expected no rule to be found',
          );
        });
      });
    });

    describe('the file does not have a valid rule (TypeScript + TypeScript parser + CJS)', () => {
      [
        // Correct TypeScript helper structure but we don't support CJS for TypeScript rules:
        'module.exports = createESLintRule<Options, MessageIds>({ create() {}, meta: {} });',
        'module.exports = util.createRule<Options, MessageIds>({ create() {}, meta: {} });',
        'module.exports = ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({ create() {}, meta: {} });',
      ].forEach((noRuleCase) => {
        it(`returns null for ${noRuleCase}`, () => {
          const ast = typescriptEslintParser.parse(noRuleCase, {
            range: true,
            sourceType: 'script',
          });
          const scopeManager = eslintScope.analyze(ast);
          assert.isNull(
            utils.getRuleInfo({ ast, scopeManager }),
            'Expected no rule to be found',
          );
        });
      });
    });

    describe('the file has a valid rule (TypeScript + TypeScript parser + ESM)', () => {
      const CASES = {
        // Util function only
        'export default createESLintRule<Options, MessageIds>({ create() {}, meta: {} });':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'export default createESLintRule<>({ create() {}, meta: {} });': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'export default createESLintRule({ create() {}, meta: {} });': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'const create = context => {}; const meta = {}; export default createESLintRule({ create, meta });':
          {
            create: { type: 'ArrowFunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'const rule = createESLintRule({ create() {}, meta: {} }); export default rule;':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },

        // No helper.
        'export default { create() {}, meta: {} };': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        // No helper, `export =` syntax.
        'export = { create() {}, meta: {} };': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        // No helper, variable.
        'const rule = { create() {}, meta: {} }; export default rule;': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        // No helper, exported variable.
        'export const rule = { create() {}, meta: {} };': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        // no helper, variable with type.
        'const rule: Rule.RuleModule = { create() {}, meta: {} }; export default rule;':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // no helper, exported variable with type.
        'export const rule: Rule.RuleModule = { create() {}, meta: {} };': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        // no helper, exported reference with type.
        'const rule: Rule.RuleModule = { create() {}, meta: {} }; export {rule};':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // no helper, exported aliased reference with type.
        'const foo: Rule.RuleModule = { create() {}, meta: {} }; export {foo as rule};':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // no helper, exported variable with type in multiple declarations
        'export const foo = 5, rule: Rule.RuleModule = { create() {}, meta: {} };':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // No helper, variable, `export =` syntax.
        'const rule = { create() {}, meta: {} }; export = rule;': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        // No helper, variable with type, `export =` syntax.
        'const rule: Rule.RuleModule = { create() {}, meta: {} }; export = rule;':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // Helper, variable, `export =` syntax.
        'const rule = createESLintRule({ create() {}, meta: {} }); export = rule;':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // Helper, variable with type, `export =` syntax.
        'const rule: Rule.RuleModule = createESLintRule({ create() {}, meta: {} }); export = rule;':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        // Helper, `export =` syntax.
        'export = createESLintRule({ create() {}, meta: {} });': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },

        // Util function with "{} as const".
        'export default createESLintRule({ create() {}, meta: {} as const });':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },

        // Util function from util object
        'export default util.createRule<Options, MessageIds>({ create() {}, meta: {} });':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'export default util.createRule({ create() {}, meta: {} });': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },

        // Util function from util object with additional doc URL argument
        'export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({ create() {}, meta: {} });':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'export default ESLintUtils.RuleCreator(docsUrl)({ create() {}, meta: {} });':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
      };

      Object.keys(CASES).forEach((ruleSource) => {
        it(ruleSource, () => {
          const ast = typescriptEslintParser.parse(ruleSource, {
            ecmaVersion: 6,
            range: true,
            sourceType: 'module',
          });
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(
              CASES[ruleSource],
            )}`,
          );
        });
      });
    });

    describe('the file has a valid rule (CJS)', () => {
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
        'module.exports.create = function foo(context) {}; module.exports.meta = {}':
          {
            create: { type: 'FunctionExpression', id: { name: 'foo' } },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'exports.create = function foo() {}; exports.meta = {};': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'module.exports = { create: () => { } }; exports.create = function foo() {}; exports.meta = {};':
          {
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
        'module.exports = { create: (context) => { } }; exports.meta = {};': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: true,
        },
        'module.exports = function foo(context) { return {}; }': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: null,
          isNewStyle: false,
        },
        'module.exports = function foo(slightlyDifferentContextName) { return {}; }':
          {
            create: { type: 'FunctionExpression', id: { name: 'foo' } },
            meta: null,
            isNewStyle: false,
          },
        'module.exports = function foo({ report }) { return {}; }': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: null,
          isNewStyle: false,
        },
        'module.exports = (context) => { return {}; }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
        'module.exports = (context) => { if (foo) { return {}; } }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
        'exports.meta = {}; module.exports = (context) => { return {}; }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
        'module.exports = (context) => { return {}; }; module.exports.meta = {};':
          {
            create: { type: 'ArrowFunctionExpression' },
            meta: null,
            isNewStyle: false,
          },
        'const create = function(context) { return {}; }; const meta = {}; module.exports = { create, meta };':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'const rule = { create() {}, meta: {} }; module.exports = rule;': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'const rule = function(context) {return{};}; module.exports = rule;': {
          create: { type: 'FunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
      };

      Object.keys(CASES).forEach((ruleSource) => {
        it(ruleSource, () => {
          const ast = espree.parse(ruleSource, {
            ecmaVersion: 6,
            range: true,
            sourceType: 'script',
          });
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(
              CASES[ruleSource],
            )}`,
          );
        });
      });
    });

    describe('the file has a valid rule (ESM)', () => {
      const CASES = {
        // ESM (object style)
        'export default { create() {} }': {
          create: { type: 'FunctionExpression' },
          meta: null,
          isNewStyle: true,
        },
        'export default { create() {}, meta: {} }': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'const create = function(context) { return {}; }; const meta = {}; export default { create, meta }':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'function create(context) { return {}; }; const meta = {}; export default { create, meta }':
          {
            create: { type: 'FunctionDeclaration' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'const rule = { create() {}, meta: {} }; export default rule;': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'const create = function() {}; const meta = {}; const rule = { create, meta }; export default rule;':
          {
            create: { type: 'FunctionExpression' },
            meta: { type: 'ObjectExpression' },
            isNewStyle: true,
          },
        'export const rule = { create() {}, meta: {} };': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },
        'const rule = { create() {}, meta: {} }; export {rule};': {
          create: { type: 'FunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        },

        // ESM (function style)
        'export default function (context) { return {}; }': {
          create: { type: 'FunctionDeclaration' },
          meta: null,
          isNewStyle: false,
        },
        'export default function (context) { if (foo) { return {}; } }': {
          create: { type: 'FunctionDeclaration' },
          meta: null,
          isNewStyle: false,
        },
        'export default (context) => { return {}; }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
        'const rule = function(context) {return {};}; export default rule;': {
          create: { type: 'FunctionExpression' },
          meta: null,
          isNewStyle: false,
        },
      };

      Object.keys(CASES).forEach((ruleSource) => {
        it(ruleSource, () => {
          const ast = espree.parse(ruleSource, {
            ecmaVersion: 6,
            range: true,
            sourceType: 'module',
          });
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(
              CASES[ruleSource],
            )}`,
          );
        });
      });
    });

    describe('the file has a valid rule (different scope options)', () => {
      for (const scopeOptions of [
        {
          ignoreEval: true,
          ecmaVersion: 6,
          sourceType: 'script',
          nodejsScope: true,
        },
        { ignoreEval: true, ecmaVersion: 6, sourceType: 'script' },
        { ignoreEval: true, ecmaVersion: 6, sourceType: 'module' },
      ]) {
        const ast = espree.parse(
          `
          const create = (context) => {};
          const meta = {};
          module.exports = { create, meta };
        `,
          { ecmaVersion: 6, range: true },
        );
        const expected = {
          create: { type: 'ArrowFunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        };
        it(`ScopeOptions: ${JSON.stringify(scopeOptions)}`, () => {
          const scopeManager = eslintScope.analyze(ast, scopeOptions);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            lodash.isMatch(ruleInfo, expected),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(expected)}`,
          );
        });
      }
    });

    describe('the file has newer syntax', () => {
      const CASES = [
        {
          source:
            'module.exports = function(context) { class Foo { @someDecorator() someProp }; return {}; };',
          options: { sourceType: 'script' },
          expected: {
            create: { type: 'FunctionExpression' },
            meta: null,
            isNewStyle: false,
          },
        },
        {
          source:
            'export default function(context) { class Foo { @someDecorator() someProp }; return {}; };',
          options: { sourceType: 'module' },
          expected: {
            create: { type: 'FunctionDeclaration' },
            meta: null,
            isNewStyle: false,
          },
        },
      ];
      for (const testCase of CASES) {
        describe(testCase.source, () => {
          it('does not throw with node type PropertyDefinition which is not handled by estraverse (estraverse is used for detecting the object return statement in a function-style rule).', () => {
            const ast = typescriptEslintParser.parse(
              testCase.source,
              testCase.options,
            );
            const scopeManager = eslintScope.analyze(ast);
            const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
            assert(
              lodash.isMatch(ruleInfo, testCase.expected),
              `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(
                testCase.expected,
              )}`,
            );
          });
        });
      }
    });
  });

  describe('getContextIdentifiers', () => {
    const CASES = {
      'module.exports = context => { context; context; context; return {}; }'(
        ast,
      ) {
        return [
          ast.body[0].expression.right.body.body[0].expression,
          ast.body[0].expression.right.body.body[1].expression,
          ast.body[0].expression.right.body.body[2].expression,
        ];
      },
      'module.exports = { meta: {}, create(context, foo = context) {} }'(ast) {
        return [
          ast.body[0].expression.right.properties[1].value.params[1].right,
        ];
      },
      'module.exports = { meta: {}, create(notContext) { notContext; notContext; notContext; } }'(
        ast,
      ) {
        return [
          ast.body[0].expression.right.properties[1].value.body.body[0]
            .expression,
          ast.body[0].expression.right.properties[1].value.body.body[1]
            .expression,
          ast.body[0].expression.right.properties[1].value.body.body[2]
            .expression,
        ];
      },
      'const create = function(context) { context }; module.exports = { meta: {}, create };'(
        ast,
      ) {
        return [ast.body[0].declarations[0].init.body.body[0].expression];
      },
    };

    Object.keys(CASES).forEach((ruleSource) => {
      it(ruleSource, () => {
        const ast = espree.parse(ruleSource, { ecmaVersion: 6, range: true });
        const scopeManager = eslintScope.analyze(ast, {
          ignoreEval: true,
          ecmaVersion: 6,
          sourceType: 'script',
          nodejsScope: true,
        });
        const identifiers = utils.getContextIdentifiers(scopeManager, ast);

        assert(
          identifiers instanceof Set,
          'getContextIdentifiers should return a Set',
        );
        assert.strictEqual(
          identifiers.size,
          CASES[ruleSource](ast).length,
          'has the correct number of results',
        );
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
      '({ [key]: 1 })': null,
      'const key = "foo"; ({ [key]: 1 });': {
        getNode(ast) {
          return ast.body[1].expression.properties[0];
        },
        result: 'foo',
        resultWithoutScope: null,
      },
    };
    Object.keys(CASES).forEach((objectSource) => {
      it(objectSource, () => {
        const ast = espree.parse(objectSource, { ecmaVersion: 6, range: true });
        const scopeManager = eslintScope.analyze(ast, {
          ignoreEval: true,
          ecmaVersion: 6,
          sourceType: 'script',
          nodejsScope: true,
        });

        const caseInfo = CASES[objectSource];
        if (typeof caseInfo === 'object' && caseInfo !== null) {
          // Object-style test case used when we need to specify additional information for this test case.
          assert.strictEqual(
            utils.getKeyName(caseInfo.getNode(ast), scopeManager.globalScope),
            caseInfo.result,
          );

          if (
            Object.prototype.hasOwnProperty.call(caseInfo, 'resultWithoutScope')
          ) {
            // Ensure the behavior is correct when `scope` is omitted from the parameters.
            assert.strictEqual(
              utils.getKeyName(caseInfo.getNode(ast)),
              caseInfo.resultWithoutScope,
            );
          }
        } else {
          assert.strictEqual(
            utils.getKeyName(
              ast.body[0].expression.properties[0],
              scopeManager.globalScope,
            ),
            caseInfo,
          );
        }
      });
    });

    const CASES_ES9 = {
      '({ ...foo })': null,
    };
    Object.keys(CASES_ES9).forEach((objectSource) => {
      it(objectSource, () => {
        const ast = espree.parse(objectSource, { ecmaVersion: 9, range: true });

        assert.strictEqual(
          utils.getKeyName(ast.body[0].expression.properties[0]),
          CASES_ES9[objectSource],
        );
      });
    });
  });

  describe('getTestInfo', () => {
    describe('the file does not have valid tests', () => {
      [
        '',
        'module.exports = context => { context.report(foo); return {}; };',
        'new (require("eslint").NotRuleTester).run(foo, bar, { valid: [] })',
        'new NotRuleTester().run(foo, bar, { valid: [] })',
        'new RuleTester()',
        'const foo = new RuleTester; bar.run(foo, bar, { valid: [] })',
        'new RuleTester().run()',
        'new RuleTester().run(foo)',
        'new RuleTester().run(foo, bar)',
        'new RuleTester().run(foo, bar, notAnObject)',
      ].forEach((noTestsCase) => {
        it(`returns no tests for ${noTestsCase}`, () => {
          const ast = espree.parse(noTestsCase, {
            ecmaVersion: 8,
            range: true,
          });
          const scopeManager = eslintScope.analyze(ast, {
            ignoreEval: true,
            ecmaVersion: 6,
            sourceType: 'script',
            nodejsScope: true,
          });
          const context = {
            sourceCode: {
              getDeclaredVariables:
                scopeManager.getDeclaredVariables.bind(scopeManager),
            },
          }; // mock object
          assert.deepEqual(
            utils.getTestInfo(context, ast),
            [],
            'Expected no tests to be found',
          );
        });
      });
    });

    describe('the file has valid tests', () => {
      const CASES = {
        'new RuleTester().run(bar, baz, { valid: [foo], invalid: [bar, baz] })':
          { valid: 1, invalid: 2 },
        'var foo = new RuleTester(); foo.run(bar, baz, { valid: [foo], invalid: [bar] })':
          { valid: 1, invalid: 1 },
        'var foo = new (require("eslint")).RuleTester; foo.run(bar, baz, { valid: [], invalid: [] })':
          { valid: 0, invalid: 0 },
        'var foo = new bar.RuleTester; foo.run(bar, baz, { valid: [], invalid: [bar, baz] })':
          { valid: 0, invalid: 2 },
        'var foo = new bar.RuleTester; foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] })':
          { valid: 0, invalid: 2 },
        [`
          var foo = new bar.RuleTester;
          describe('my tests', function () {
            foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] })
          });
        `]: { valid: 0, invalid: 2 },
        [`
          var foo = new bar.RuleTester;
          describe('my tests', () => {
            foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] })
          });
        `]: { valid: 0, invalid: 2 },
        [`
          var foo = new bar.RuleTester;
          describe('my tests', () => {
            describe('my tests', () => {
              describe('my tests', () => {
                describe('my tests', () => {
                  foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] })
                });
              });
            });
          });
        `]: { valid: 0, invalid: 2 },
        [`
          var foo = new bar.RuleTester();
          describe('my tests', () =>
            foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] }));
        `]: { valid: 0, invalid: 2 },
        [`
          var foo = new bar.RuleTester();
          if (eslintVersion >= 8)
            foo.run(bar, baz, { valid: [,], invalid: [bar, , baz] });
        `]: { valid: 0, invalid: 2 },
      };

      Object.keys(CASES).forEach((testSource) => {
        it(testSource, () => {
          const ast = espree.parse(testSource, { ecmaVersion: 6, range: true });
          const scopeManager = eslintScope.analyze(ast, {
            ignoreEval: true,
            ecmaVersion: 6,
            sourceType: 'script',
            nodejsScope: true,
          });
          const context = {
            sourceCode: {
              getDeclaredVariables:
                scopeManager.getDeclaredVariables.bind(scopeManager),
            },
          }; // mock object
          const testInfo = utils.getTestInfo(context, ast);

          assert.strictEqual(
            testInfo.length,
            1,
            'Expected to find one test run',
          );

          assert.strictEqual(
            testInfo[0].valid.length,
            CASES[testSource].valid,
            `Expected ${CASES[testSource].valid} valid cases but got ${testInfo[0].valid.length}`,
          );

          assert.strictEqual(
            testInfo[0].invalid.length,
            CASES[testSource].invalid,
            `Expected ${CASES[testSource].invalid} invalid cases but got ${testInfo[0].invalid.length}`,
          );
        });
      });
    });

    describe('the file has multiple test runs', () => {
      const CASES = {
        [`
          new RuleTester().run(foo, bar, { valid: [foo], invalid: [] });
          new RuleTester().run(foo, bar, { valid: [], invalid: [foo, bar] });
        `]: [
          { valid: 1, invalid: 0 },
          { valid: 0, invalid: 2 },
        ],

        [`
          describe('one', function() {
            new RuleTester().run(foo, bar, { valid: [foo], invalid: [] });
          });

          describe('two', () => {
            new RuleTester().run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 1, invalid: 0 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester;
          var bar = new RuleTester;
          foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester;

          describe('some tests', () => {
            var bar = new RuleTester;
            foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;
          foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;

          describe('one set of tests', () => {
            foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          });

          describe('another set of tests', () => {
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;

          if (eslintVersion >= 8) {
            describe('one set of tests', () => {
              foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
            });
          }

          describe('another set of tests', () => {
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;

          describe('one set of tests', () => {
            if (eslintVersion >= 8) {
              foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
            }
          });

          describe('another set of tests', () => {
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;

          function testUtilsAgainst(value) {
            foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          };

          testUtilsAgainst(1);
          testUtilsAgainst(2);
          testUtilsAgainst(3);

          describe('another set of tests', () => {
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;

          const testUtilsAgainst = function(value) {
            foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          };

          testUtilsAgainst(1);
          testUtilsAgainst(2);
          testUtilsAgainst(3);

          describe('another set of tests', () => {
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],

        [`
          var foo = new RuleTester, bar = new RuleTester;

          const testUtilsAgainst = (value) => {
            foo.run(foo, bar, { valid: [foo, bar, baz], invalid: [foo] });
          };

          testUtilsAgainst(1);
          testUtilsAgainst(2);
          testUtilsAgainst(3);

          describe('another set of tests', () => {
            bar.run(foo, bar, { valid: [], invalid: [foo, bar] });
          });
        `]: [
          { valid: 3, invalid: 1 },
          { valid: 0, invalid: 2 },
        ],
      };

      Object.keys(CASES).forEach((testSource) => {
        it(testSource, () => {
          const ast = espree.parse(testSource, { ecmaVersion: 6, range: true });
          const scopeManager = eslintScope.analyze(ast, {
            ignoreEval: true,
            ecmaVersion: 6,
            sourceType: 'script',
            nodejsScope: true,
          });
          const context = {
            sourceCode: {
              getDeclaredVariables:
                scopeManager.getDeclaredVariables.bind(scopeManager),
            },
          }; // mock object
          const testInfo = utils.getTestInfo(context, ast);

          assert.strictEqual(
            testInfo.length,
            CASES[testSource].length,
            `Expected to find ${CASES[testSource].length} test runs but got ${testInfo.length}`,
          );

          CASES[testSource].forEach((testRun, index) => {
            assert.strictEqual(
              testRun.valid,
              testInfo[index].valid.length,
              `On run ${index + 1}, expected ${
                testRun.valid
              } valid cases but got ${testInfo[index].valid.length}`,
            );
            assert.strictEqual(
              testRun.invalid,
              testInfo[index].invalid.length,
              `On run ${index + 1}, expected ${
                testRun.invalid
              } valid cases but got ${testInfo[index].invalid.length}`,
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
      [
        ['foo', '"bar"', 'baz', 'qux', 'boop'],
        (args) => ({
          node: args[0],
          message: args[1],
          data: args[2],
          fix: args[3],
        }),
      ],
      [
        ['foo', '`bar`', 'baz', 'qux', 'boop'],
        (args) => ({
          node: args[0],
          message: args[1],
          data: args[2],
          fix: args[3],
        }),
      ],
      [
        ['foo', '{ bar: 1 }', 'baz', 'qux', 'boop'],
        (args) => ({
          node: args[0],
          loc: args[1],
          message: args[2],
          data: args[3],
          fix: args[4],
        }),
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
        const node = espree.parse(`context.report(${args.join(', ')})`, {
          ecmaVersion: 6,
          loc: false,
          range: false,
        }).body[0].expression;
        const parsedArgs = node.arguments;
        const context = {
          sourceCode: {
            getScope() {
              return {};
            },
          },
        }; // mock object
        const reportInfo = utils.getReportInfo(node, context);

        assert.deepEqual(reportInfo, CASES.get(args)(parsedArgs));
      });
    }
  });

  describe('getSourceCodeIdentifiers', () => {
    const CASES = {
      'module.exports = context => { const sourceCode = context.getSourceCode(); sourceCode; foo; return {}; }': 2,
      'module.exports = context => { const x = 1, sc = context.getSourceCode(); sc; sc; sc; sourceCode; return {}; }': 4,
      'module.exports = context => { const sourceCode = context.getNotSourceCode(); return {}; }': 0,
    };

    Object.keys(CASES).forEach((testSource) => {
      it(testSource, () => {
        const ast = espree.parse(testSource, { ecmaVersion: 6, range: true });
        const scopeManager = eslintScope.analyze(ast, {
          ignoreEval: true,
          ecmaVersion: 6,
          sourceType: 'script',
          nodejsScope: true,
        });

        estraverse.traverse(ast, {
          enter(node, parent) {
            node.parent = parent;
          },
        });

        assert.strictEqual(
          utils.getSourceCodeIdentifiers(scopeManager, ast).size,
          CASES[testSource],
        );
      });
    });
  });

  describe('collectReportViolationAndSuggestionData', () => {
    const CASES = [
      {
        // One suggestion.
        code: `
          context.report({
            node: {},
            message: "message1",
            messageId: "messageId1",
            data: { foo: 'hello' },
            fix(fixer) {},
            suggest: [{
              desc: "message2",
              messageId: "messageId2",
              data: { bar: 'world' },
              fix(fixer) {},
            }]
          });
        `,
        shouldMatch: [
          {
            message: { type: 'Literal', value: 'message1' },
            messageId: { type: 'Literal', value: 'messageId1' },
            data: {
              type: 'ObjectExpression',
              properties: [{ key: { name: 'foo' } }],
            },
            fix: { type: 'FunctionExpression' },
          },
          {
            message: { type: 'Literal', value: 'message2' },
            messageId: { type: 'Literal', value: 'messageId2' },
            data: {
              type: 'ObjectExpression',
              properties: [{ key: { name: 'bar' } }],
            },
            fix: { type: 'FunctionExpression' },
          },
        ],
      },
      {
        // Suggestions using an array variable.
        code: `
          context.report({
            node: {},
            message: "message1",
            messageId: "messageId1",
            data: { foo: 'hello' },
            fix(fixer) {},
            suggest: SUGGESTIONS
          });
        `,
        shouldMatch: [
          {
            message: { type: 'Literal', value: 'message1' },
            messageId: { type: 'Literal', value: 'messageId1' },
            data: {
              type: 'ObjectExpression',
              properties: [{ key: { name: 'foo' } }],
            },
            fix: { type: 'FunctionExpression' },
          },
        ],
      },
      {
        // Suggestions using array item variables.
        code: `
          context.report({
            node: {},
            message: "message1",
            messageId: "messageId1",
            data: { foo: 'hello' },
            fix(fixer) {},
            suggest: [ SUGGEST_1, SUGGEST_2 ]
          });
        `,
        shouldMatch: [
          {
            message: { type: 'Literal', value: 'message1' },
            messageId: { type: 'Literal', value: 'messageId1' },
            data: {
              type: 'ObjectExpression',
              properties: [{ key: { name: 'foo' } }],
            },
            fix: { type: 'FunctionExpression' },
          },
        ],
      },
      {
        // Suggestions using a ternary/conditional expression.
        code: `
          context.report({
            node: {},
            messageId: "messageId1",
            suggest: foo ? [{messageId:'messageId2'}] : [{messageId: 'messageId3'}]
          });
        `,
        shouldMatch: [
          { messageId: { type: 'Literal', value: 'messageId1' } },
          { messageId: { type: 'Literal', value: 'messageId2' } },
          { messageId: { type: 'Literal', value: 'messageId3' } },
        ],
      },
      {
        // No suggestions.
        code: `
          context.report({
            node: {},
            message: "message1",
            messageId: "messageId1",
            data: { foo: 'hello' },
            fix(fixer) {},
          });
        `,
        shouldMatch: [
          {
            message: { type: 'Literal', value: 'message1' },
            messageId: { type: 'Literal', value: 'messageId1' },
            data: {
              type: 'ObjectExpression',
              properties: [{ key: { name: 'foo' } }],
            },
            fix: { type: 'FunctionExpression' },
          },
        ],
      },
    ];

    it('behaves correctly', () => {
      for (const testCase of CASES) {
        const ast = espree.parse(testCase.code, {
          ecmaVersion: 6,
          range: true,
        });
        const context = {
          sourceCode: {
            getScope() {
              return {};
            },
          },
        }; // mock object
        const reportNode = ast.body[0].expression;
        const reportInfo = utils.getReportInfo(reportNode, context);
        const data = utils.collectReportViolationAndSuggestionData(reportInfo);
        assert(
          lodash.isMatch(data, testCase.shouldMatch),
          `Expected \n${inspect(data)}\nto match\n${inspect(
            testCase.shouldMatch,
          )}`,
        );
      }
    });
  });

  describe('isAutoFixerFunction / isSuggestionFixerFunction', () => {
    const CASES = {
      // isAutoFixerFunction
      'context.report({ fix(fixer) {} });'(ast) {
        return {
          expected: true,
          node: ast.body[0].expression.arguments[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isAutoFixerFunction,
        };
      },
      'context.notReport({ fix(fixer) {} });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isAutoFixerFunction,
        };
      },
      'context.report({ notFix(fixer) {} });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isAutoFixerFunction,
        };
      },
      'notContext.report({ notFix(fixer) {} });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value,
          context: undefined,
          fn: utils.isAutoFixerFunction,
        };
      },

      // isSuggestionFixerFunction
      'context.report({ suggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: true,
          node: ast.body[0].expression.arguments[0].properties[0].value
            .elements[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'context.notReport({ suggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value
            .elements[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'context.report({ notSuggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value
            .elements[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'context.report({ suggest: [{ notFix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value
            .elements[0].properties[0].value,
          context: ast.body[0].expression.callee.object,
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'notContext.report({ suggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: ast.body[0].expression.arguments[0].properties[0].value,
          context: undefined,
          fn: utils.isSuggestionFixerFunction,
        };
      },
    };

    Object.keys(CASES).forEach((ruleSource) => {
      it(ruleSource, () => {
        const ast = espree.parse(ruleSource, { ecmaVersion: 6, range: true });

        // Add parent to each node.
        estraverse.traverse(ast, {
          enter(node, parent) {
            node.parent = parent;
          },
        });

        const testCase = CASES[ruleSource](ast);
        const contextIdentifiers = new Set([testCase.context]);
        const result = testCase.fn(testCase.node, contextIdentifiers);
        assert.strictEqual(result, testCase.expected);
      });
    });
  });

  describe('evaluateObjectProperties', function () {
    it('behaves correctly with simple object expression', function () {
      const ast = espree.parse('const obj = { a: 123, b: foo() };', {
        ecmaVersion: 9,
        range: true,
      });
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        ast.body[0].declarations[0].init,
        scopeManager,
      );
      assert.deepEqual(result, ast.body[0].declarations[0].init.properties);
    });

    it('behaves correctly with spreads of objects', function () {
      const ast = espree.parse(
        `
        const extra1 = { a: 123 };
        const extra2 = { b: 456 };
        const obj = { ...extra1, c: 789, ...extra2 };
        `,
        {
          ecmaVersion: 9,
          range: true,
        },
      );
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        ast.body[2].declarations[0].init,
        scopeManager,
      );
      assert.deepEqual(result, [
        ...ast.body[0].declarations[0].init.properties, // First spread properties
        ...ast.body[2].declarations[0].init.properties.filter(
          (property) => property.type !== 'SpreadElement',
        ), // Non-spread properties
        ...ast.body[1].declarations[0].init.properties, // Second spread properties
      ]);
    });

    it('behaves correctly with non-variable spreads', function () {
      const ast = espree.parse(`function foo() {} const obj = { ...foo() };`, {
        ecmaVersion: 9,
        range: true,
      });
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        ast.body[1].declarations[0].init,
        scopeManager,
      );
      assert.deepEqual(result, []);
    });

    it('behaves correctly with spread with variable that cannot be found', function () {
      const ast = espree.parse(`const obj = { ...foo };`, {
        ecmaVersion: 9,
        range: true,
      });
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        ast.body[0].declarations[0].init,
        scopeManager,
      );
      assert.deepEqual(result, []);
    });

    it('behaves correctly when passed wrong node type', function () {
      const ast = espree.parse(`foo();`, {
        ecmaVersion: 9,
        range: true,
      });
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(ast.body[0], scopeManager);
      assert.deepEqual(result, []);
    });
  });

  describe('getMessagesNode', function () {
    [
      {
        code: 'module.exports = { meta: { messages: {} }, create(context) {} };',
        getResult(ast) {
          return ast.body[0].expression.right.properties[0].value.properties[0]
            .value;
        },
      },
      {
        // variable
        code: `
          const messages = { foo: 'hello world' };
          module.exports = { meta: { messages }, create(context) {} };
        `,
        getResult(ast) {
          return ast.body[0].declarations[0].init;
        },
      },
      {
        // spread
        code: `
          const extra = { messages: { foo: 'hello world' } };
          module.exports = { meta: { ...extra }, create(context) {} };
        `,
        getResult(ast) {
          return ast.body[0].declarations[0].init.properties[0].value;
        },
      },
      {
        code: `module.exports = { meta: FOO, create(context) {} };`,
        getResult() {}, // returns undefined
      },
      {
        code: `module.exports = { create(context) {} };`,
        getResult() {}, // returns undefined
      },
    ].forEach((testCase) => {
      describe(testCase.code, () => {
        it('returns the right node', () => {
          const ast = espree.parse(testCase.code, {
            ecmaVersion: 9,
            range: true,
          });
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert.strictEqual(
            utils.getMessagesNode(ruleInfo, scopeManager),
            testCase.getResult(ast),
          );
        });
      });
    });
  });

  describe('getMessageIdNodes', function () {
    [
      {
        code: 'module.exports = { meta: { messages: { foo: "hello world" } }, create(context) {} };',
        getResult(ast) {
          return ast.body[0].expression.right.properties[0].value.properties[0]
            .value.properties;
        },
      },
      {
        // variable
        code: `
          const messages = { foo: 'hello world' };
          module.exports = { meta: { messages }, create(context) {} };
        `,
        getResult(ast) {
          return ast.body[0].declarations[0].init.properties;
        },
      },
      {
        // spread
        code: `
          const extra2 = { foo: 'hello world' };
          const extra = { messages: { ...extra2 } };
          module.exports = { meta: { ...extra }, create(context) {} };
        `,
        getResult(ast) {
          return ast.body[0].declarations[0].init.properties;
        },
      },
    ].forEach((testCase) => {
      describe(testCase.code, () => {
        it('returns the right node', () => {
          const ast = espree.parse(testCase.code, {
            ecmaVersion: 9,
            range: true,
          });
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert.deepEqual(
            utils.getMessageIdNodes(ruleInfo, scopeManager),
            testCase.getResult(ast),
          );
        });
      });
    });
  });

  describe('getMessageIdNodeById', function () {
    [
      {
        code: 'module.exports = { meta: { messages: { foo: "hello world" } }, create(context) {} };',
        run(ruleInfo, scopeManager) {
          return utils.getMessageIdNodeById(
            'foo',
            ruleInfo,
            scopeManager,
            scopeManager.globalScope,
          );
        },
        getResult(ast) {
          return ast.body[0].expression.right.properties[0].value.properties[0]
            .value.properties[0];
        },
      },
      {
        code: 'module.exports = { meta: { messages: { foo: "hello world" } }, create(context) {} };',
        run(ruleInfo, scopeManager) {
          return utils.getMessageIdNodeById(
            'bar',
            ruleInfo,
            scopeManager,
            scopeManager.globalScope,
          );
        },
        getResult() {}, // returns undefined
      },
    ].forEach((testCase) => {
      describe(testCase.code, () => {
        it('returns the right node', () => {
          const ast = espree.parse(testCase.code, {
            ecmaVersion: 9,
            range: true,
          });
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert.strictEqual(
            testCase.run(ruleInfo, scopeManager),
            testCase.getResult(ast),
          );
        });
      });
    });
  });

  describe('findPossibleVariableValues', function () {
    it('returns the right nodes', () => {
      const code =
        'let x = 123; x = 456; x = foo(); if (foo) { x = 789; } x(); console.log(x); x += "shouldIgnore"; x + "shouldIgnore";';
      const ast = espree.parse(code, {
        ecmaVersion: 9,
        range: true,
      });

      // Add parent to each node.
      estraverse.traverse(ast, {
        enter(node, parent) {
          node.parent = parent;
        },
      });

      const scopeManager = eslintScope.analyze(ast);
      assert.deepEqual(
        utils.findPossibleVariableValues(
          ast.body[0].declarations[0].id,
          scopeManager,
        ),
        [
          ast.body[0].declarations[0].init,
          ast.body[1].expression.right,
          ast.body[2].expression.right,
          ast.body[3].consequent.body[0].expression.right,
        ],
      );
    });
  });

  describe('isVariableFromParameter', function () {
    it('returns true for function parameter', () => {
      const code =
        'function myFunc(x) { if (foo) { x = "abc"; } console.log(x) }; myFunc("def");';
      const ast = espree.parse(code, {
        ecmaVersion: 9,
        range: true,
      });

      const scopeManager = eslintScope.analyze(ast);
      assert.ok(
        utils.isVariableFromParameter(
          ast.body[0].body.body[1].expression.arguments[0],
          scopeManager,
        ),
      );
    });

    it('returns false for const variable', () => {
      const code = 'const x = "abc"; console.log(x);';
      const ast = espree.parse(code, {
        ecmaVersion: 9,
        range: true,
      });

      const scopeManager = eslintScope.analyze(ast);
      assert.notOk(
        utils.isVariableFromParameter(
          ast.body[1].expression.arguments[0],
          scopeManager,
        ),
      );
    });
  });
});
