import { inspect } from 'node:util';

import typescriptEslintParser from '@typescript-eslint/parser';
import * as eslintScope from 'eslint-scope';
import * as espree from 'espree';
import * as estraverse from 'estraverse';
import lodash from 'lodash';
import { assert, describe, it } from 'vitest';

import * as utils from '../../lib/utils.js';
import type {
  ArrayExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentPattern,
  BlockStatement,
  CallExpression,
  ExpressionStatement,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  IfStatement,
  Literal,
  MemberExpression,
  ObjectExpression,
  Program,
  Property,
  SpreadElement,
  VariableDeclaration,
} from 'estree';
import type { Rule, Scope } from 'eslint';
import type { RuleInfo } from '../../lib/types.js';

type MockRuleInfo = {
  create: {
    id?: { name: string };
    type: string;
  };
  meta?: {
    type: string;
  } | undefined;
  isNewStyle: boolean;
};

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
          const ast = espree.parse(noRuleCase, {
            ecmaVersion: 8,
            range: true,
          }) as unknown as Program;
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
          }) as unknown as Program;
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
          }) as unknown as Program;
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
          }) as unknown as Program;
          const scopeManager = eslintScope.analyze(ast);
          assert.isNull(
            utils.getRuleInfo({ ast, scopeManager }),
            'Expected no rule to be found',
          );
        });
      });
    });

    describe('the file has a valid rule (TypeScript + TypeScript parser + ESM)', () => {
      const CASES: Record<string, MockRuleInfo> = {
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
          }) as unknown as Program;
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            ruleInfo && lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(
              CASES[ruleSource],
            )}`,
          );
        });
      });
    });

    describe('the file has a valid rule (CJS)', () => {
      const CASES: Record<string, MockRuleInfo> = {
        'module.exports = { create: function foo() {} };': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } }, // (This property will actually contain the AST node.)
          isNewStyle: true,
        },
        'module.exports = { create: () => { } };': {
          create: { type: 'ArrowFunctionExpression' },
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
            isNewStyle: true,
          },
        'exports.meta = {}; module.exports = { create: () => { } };': {
          create: { type: 'ArrowFunctionExpression' },
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
          isNewStyle: true,
        },
        'module.exports = function foo(context) { return {}; }': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: undefined,
          isNewStyle: false,
        },
        'module.exports = function foo(slightlyDifferentContextName) { return {}; }':
          {
            create: { type: 'FunctionExpression', id: { name: 'foo' } },
            meta: undefined,
            isNewStyle: false,
          },
        'module.exports = function foo({ report }) { return {}; }': {
          create: { type: 'FunctionExpression', id: { name: 'foo' } },
          meta: undefined,
          isNewStyle: false,
        },
        'module.exports = (context) => { return {}; }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: undefined,
          isNewStyle: false,
        },
        'module.exports = (context) => { if (foo) { return {}; } }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: undefined,
          isNewStyle: false,
        },
        'exports.meta = {}; module.exports = (context) => { return {}; }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: undefined,
          isNewStyle: false,
        },
        'module.exports = (context) => { return {}; }; module.exports.meta = {};':
          {
            create: { type: 'ArrowFunctionExpression' },
            meta: undefined,
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
          meta: undefined,
          isNewStyle: false,
        },
      };

      Object.keys(CASES).forEach((ruleSource) => {
        it(ruleSource, () => {
          const ast = espree.parse(ruleSource, {
            ecmaVersion: 6,
            range: true,
            sourceType: 'script',
          }) as unknown as Program;
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            ruleInfo && lodash.isMatch(ruleInfo, CASES[ruleSource]),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(
              CASES[ruleSource],
            )}`,
          );
        });
      });
    });

    describe('the file has a valid rule (ESM)', () => {
      const CASES: Record<string, MockRuleInfo> = {
        // ESM (object style)
        'export default { create() {} }': {
          create: { type: 'FunctionExpression' },
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
          isNewStyle: false,
        },
        'export default function (context) { if (foo) { return {}; } }': {
          create: { type: 'FunctionDeclaration' },
          meta: undefined,
          isNewStyle: false,
        },
        'export default (context) => { return {}; }': {
          create: { type: 'ArrowFunctionExpression' },
          meta: undefined,
          isNewStyle: false,
        },
        'const rule = function(context) {return {};}; export default rule;': {
          create: { type: 'FunctionExpression' },
          meta: undefined,
          isNewStyle: false,
        },
      };

      Object.keys(CASES).forEach((ruleSource) => {
        it(ruleSource, () => {
          const ast = espree.parse(ruleSource, {
            ecmaVersion: 6,
            range: true,
            sourceType: 'module',
          }) as unknown as Program;
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            ruleInfo && lodash.isMatch(ruleInfo, CASES[ruleSource]),
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
      ] as eslintScope.AnalyzeOptions[]) {
        const ast = espree.parse(
          `
          const create = (context) => {};
          const meta = {};
          module.exports = { create, meta };
        `,
          { ecmaVersion: 6, range: true },
        ) as unknown as Program;
        const expected = {
          create: { type: 'ArrowFunctionExpression' },
          meta: { type: 'ObjectExpression' },
          isNewStyle: true,
        };
        it(`ScopeOptions: ${JSON.stringify(scopeOptions)}`, () => {
          const scopeManager = eslintScope.analyze(ast, scopeOptions);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert(
            ruleInfo && lodash.isMatch(ruleInfo, expected),
            `Expected \n${inspect(ruleInfo)}\nto match\n${inspect(expected)}`,
          );
        });
      }
    });

    describe('the file has newer syntax', () => {
      const CASES: {
        source: string;
        options: { sourceType: 'script' | 'module' };
        expected: MockRuleInfo;
      }[] = [
        {
          source:
            'module.exports = function(context) { class Foo { @someDecorator() someProp }; return {}; };',
          options: { sourceType: 'script' },
          expected: {
            create: { type: 'FunctionExpression' },
            meta: undefined,
            isNewStyle: false,
          },
        },
        {
          source:
            'export default function(context) { class Foo { @someDecorator() someProp }; return {}; };',
          options: { sourceType: 'module' },
          expected: {
            create: { type: 'FunctionDeclaration' },
            meta: undefined,
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
            ) as unknown as Program;
            const scopeManager = eslintScope.analyze(ast);
            const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
            assert(
              ruleInfo && lodash.isMatch(ruleInfo, testCase.expected),
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
    type ContextIdentifierMapFn = (ast: Program) => Identifier[];
    const CASES: Record<string, ContextIdentifierMapFn> = {
      'module.exports = context => { context; context; context; return {}; }'(
        ast,
      ) {
        const expression = (ast.body[0] as ExpressionStatement)
          .expression as AssignmentExpression;
        const blockStatement = (expression.right as ArrowFunctionExpression)
          .body as BlockStatement;
        return [
          (blockStatement.body[0] as ExpressionStatement)
            .expression as Identifier,
          (blockStatement.body[1] as ExpressionStatement)
            .expression as Identifier,
          (blockStatement.body[2] as ExpressionStatement)
            .expression as Identifier,
        ];
      },
      'module.exports = { meta: {}, create(context, foo = context) {} }'(ast) {
        const expression = (ast.body[0] as ExpressionStatement)
          .expression as AssignmentExpression;
        const functionExpression = (
          (expression.right as ObjectExpression).properties[1] as Property
        ).value as FunctionExpression;
        return [
          (functionExpression.params[1] as AssignmentPattern)
            .right as Identifier,
        ];
      },
      'module.exports = { meta: {}, create(notContext) { notContext; notContext; notContext; } }'(
        ast,
      ) {
        const expression = (ast.body[0] as ExpressionStatement)
          .expression as AssignmentExpression;
        const functionExpression = (
          (expression.right as ObjectExpression).properties[1] as Property
        ).value as FunctionExpression;
        return [
          (functionExpression.body.body[0] as ExpressionStatement)
            .expression as Identifier,
          (functionExpression.body.body[1] as ExpressionStatement)
            .expression as Identifier,
          (functionExpression.body.body[2] as ExpressionStatement)
            .expression as Identifier,
        ];
      },
      'const create = function(context) { context }; module.exports = { meta: {}, create };'(
        ast,
      ) {
        const declaration = ast.body[0] as VariableDeclaration;
        const functionExpression = declaration.declarations[0]
          .init as FunctionExpression;
        return [
          (functionExpression?.body.body[0] as ExpressionStatement)
            .expression as Identifier,
        ];
      },
    };

    Object.keys(CASES).forEach((ruleSource) => {
      it(ruleSource, () => {
        const ast = espree.parse(ruleSource, {
          ecmaVersion: 6,
          range: true,
        }) as unknown as Program;
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
    const CASES: Record<
      string,
      | string
      | null
      | {
          getNode: (ast: Program) => Property | SpreadElement;
          result: string;
          resultWithoutScope?: string | null;
        }
    > = {
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
          const expression = (ast.body[1] as ExpressionStatement)
            .expression as ObjectExpression;
          return expression.properties[0];
        },
        result: 'foo',
        resultWithoutScope: null,
      },
    };
    Object.keys(CASES).forEach((objectSource) => {
      it(objectSource, () => {
        const ast = espree.parse(objectSource, {
          ecmaVersion: 6,
          range: true,
        }) as unknown as Program;
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
          const expression = (ast.body[0] as ExpressionStatement)
            .expression as ObjectExpression;
          assert.strictEqual(
            utils.getKeyName(
              expression.properties[0],
              scopeManager.globalScope,
            ),
            caseInfo,
          );
        }
      });
    });

    const CASES_ES9: Record<string, string | null> = {
      '({ ...foo })': null,
    };
    Object.keys(CASES_ES9).forEach((objectSource) => {
      it(objectSource, () => {
        const ast = espree.parse(objectSource, {
          ecmaVersion: 9,
          range: true,
        }) as unknown as Program;

        const expression = (ast.body[0] as ExpressionStatement)
          .expression as ObjectExpression;
        assert.strictEqual(
          utils.getKeyName(expression.properties[0]),
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
          }) as unknown as Program;
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
          } as unknown as Rule.RuleContext; // mock object
          assert.deepEqual(
            utils.getTestInfo(context, ast),
            [],
            'Expected no tests to be found',
          );
        });
      });
    });

    describe('the file has valid tests', () => {
      const CASES: Record<string, { valid: number; invalid: number }> = {
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
          const ast = espree.parse(testSource, {
            ecmaVersion: 6,
            range: true,
          }) as unknown as Program;
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
          } as unknown as Rule.RuleContext; // mock object
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
      const CASES: Record<string, { valid: number; invalid: number }[]> = {
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
          const ast = espree.parse(testSource, {
            ecmaVersion: 6,
            range: true,
          }) as unknown as Program;
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
          } as unknown as Rule.RuleContext; // mock object
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
    type GetReportInfoFn = {
      (args: readonly (Identifier | ObjectExpression)[]): {
        node: Identifier | ObjectExpression;
        message: Identifier | ObjectExpression;
        data: Identifier | ObjectExpression;
        fix: Identifier | ObjectExpression;
        loc?: Identifier | ObjectExpression;
      };
      (): null;
      (): {
        node: { type: string; name: string; start: number; end: number };
        message: {
          type: string;
          name: string;
          start: number;
          end: number;
        };
      };
    };

    // @ts-expect-error - These types need some more work
    const CASES = new Map<string[], GetReportInfoFn>([
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
        const program = espree.parse(`context.report(${args.join(', ')})`, {
          ecmaVersion: 6,
          loc: false,
          range: false,
        }) as unknown as Program;
        const node = (program.body[0] as ExpressionStatement)
          .expression as CallExpression;
        const parsedArgs = node.arguments as (Identifier | ObjectExpression)[];
        const context = {
          sourceCode: {
            getScope() {
              return {};
            },
          },
        } as unknown as Rule.RuleContext; // mock object
        const reportInfo = utils.getReportInfo(node, context);

        assert.deepEqual(reportInfo, CASES.get(args)?.(parsedArgs));
      });
    }
  });

  describe('getSourceCodeIdentifiers', () => {
    const CASES: Record<string, number> = {
      'module.exports = context => { const sourceCode = context.getSourceCode(); sourceCode; foo; return {}; }': 2,
      'module.exports = context => { const x = 1, sc = context.getSourceCode(); sc; sc; sc; sourceCode; return {}; }': 4,
      'module.exports = context => { const sourceCode = context.getNotSourceCode(); return {}; }': 0,
    };

    Object.keys(CASES).forEach((testSource) => {
      it(testSource, () => {
        const ast = espree.parse(testSource, {
          ecmaVersion: 6,
          range: true,
        }) as unknown as Program;
        const scopeManager = eslintScope.analyze(ast, {
          ignoreEval: true,
          ecmaVersion: 6,
          sourceType: 'script',
          nodejsScope: true,
        });

        estraverse.traverse(ast, {
          enter(node, parent) {
            if (parent) {
              node.parent = parent;
            }
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
    type Data = {
      message?: { type: string; value: string };
      messageId?: { type: string; value: string };
      data?: { type: string; properties?: { key: { name: string } }[] };
      fix?: { type: string };
    };
    type TestCase = {
      code: string;
      shouldMatch: Data[];
    };
    const CASES: TestCase[] = [
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
        }) as unknown as Program;
        const context = {
          sourceCode: {
            getScope() {
              return {};
            },
          },
        } as unknown as Rule.RuleContext; // mock object
        const reportNode = (ast.body[0] as ExpressionStatement)
          .expression as CallExpression;
        const reportInfo = utils.getReportInfo(reportNode, context);
        const data =
          reportInfo &&
          utils.collectReportViolationAndSuggestionData(reportInfo);
        assert(
          data && lodash.isMatch(data, testCase.shouldMatch),
          `Expected \n${inspect(data)}\nto match\n${inspect(
            testCase.shouldMatch,
          )}`,
        );
      }
    });
  });

  describe('isAutoFixerFunction / isSuggestionFixerFunction', () => {
    type TestCase = {
      expected: boolean;
      node: ArrayExpression | FunctionExpression;
      context: Identifier | undefined;
      fn:
        | typeof utils.isAutoFixerFunction
        | typeof utils.isSuggestionFixerFunction;
    };

    const getReportCallExpression = (ast: Program): CallExpression =>
      (ast.body[0] as ExpressionStatement).expression as CallExpression;
    const getReportParamObjectExpression = (ast: Program): ObjectExpression =>
      getReportCallExpression(ast).arguments[0] as ObjectExpression;
    const getReportParamObjectProperty = (ast: Program): Property =>
      getReportParamObjectExpression(ast).properties[0] as Property;
    const getReportCalleeIdentifier = (ast: Program): Identifier =>
      (getReportCallExpression(ast).callee as MemberExpression)
        .object as Identifier;

    const CASES: Record<string, (ast: Program) => TestCase> = {
      // isAutoFixerFunction
      'context.report({ fix(fixer) {} });'(ast) {
        return {
          expected: true,
          node: getReportParamObjectProperty(ast).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isAutoFixerFunction,
        };
      },
      'context.notReport({ fix(fixer) {} });'(ast) {
        return {
          expected: false,
          node: getReportParamObjectProperty(ast).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isAutoFixerFunction,
        };
      },
      'context.report({ notFix(fixer) {} });'(ast) {
        return {
          expected: false,
          node: getReportParamObjectProperty(ast).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isAutoFixerFunction,
        };
      },
      'notContext.report({ notFix(fixer) {} });'(ast) {
        return {
          expected: false,
          node: getReportParamObjectProperty(ast).value as FunctionExpression,
          context: undefined,
          fn: utils.isAutoFixerFunction,
        };
      },

      // isSuggestionFixerFunction
      'context.report({ suggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: true,
          node: (
            (
              (getReportParamObjectProperty(ast).value as ArrayExpression)
                .elements[0] as ObjectExpression
            ).properties[0] as Property
          ).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'context.notReport({ suggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: (
            (
              (getReportParamObjectProperty(ast).value as ArrayExpression)
                .elements[0] as ObjectExpression
            ).properties[0] as Property
          ).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'context.report({ notSuggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: (
            (
              (getReportParamObjectProperty(ast).value as ArrayExpression)
                .elements[0] as ObjectExpression
            ).properties[0] as Property
          ).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'context.report({ suggest: [{ notFix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: (
            (
              (getReportParamObjectProperty(ast).value as ArrayExpression)
                .elements[0] as ObjectExpression
            ).properties[0] as Property
          ).value as FunctionExpression,
          context: getReportCalleeIdentifier(ast),
          fn: utils.isSuggestionFixerFunction,
        };
      },
      'notContext.report({ suggest: [{ fix(fixer) {} }] });'(ast) {
        return {
          expected: false,
          node: getReportParamObjectProperty(ast).value as ArrayExpression,
          context: undefined,
          fn: utils.isSuggestionFixerFunction,
        };
      },
    };

    Object.keys(CASES).forEach((ruleSource) => {
      it(ruleSource, () => {
        const ast = espree.parse(ruleSource, {
          ecmaVersion: 6,
          range: true,
        }) as unknown as Program;
        const context = {
          sourceCode: {
            getScope() {
              return {};
            },
          },
        } as unknown as Rule.RuleContext; // mock object

        // Add parent to each node.
        estraverse.traverse(ast, {
          enter(node, parent) {
            if (parent) {
              node.parent = parent;
            }
          },
        });

        const testCase = CASES[ruleSource](ast);
        const contextIdentifiers = new Set(
          [testCase.context].filter((node) => !!node),
        );
        const result = testCase.fn(testCase.node, contextIdentifiers, context);
        assert.strictEqual(result, testCase.expected);
      });
    });
  });

  describe('evaluateObjectProperties', function () {
    it('behaves correctly with simple object expression', function () {
      const getObjectExpression = (ast: Program): ObjectExpression =>
        (ast.body[0] as VariableDeclaration).declarations[0]
          .init as ObjectExpression;
      const ast = espree.parse('const obj = { a: 123, b: foo() };', {
        ecmaVersion: 9,
        range: true,
      }) as unknown as Program;
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        getObjectExpression(ast),
        scopeManager,
      );
      assert.deepEqual(result, getObjectExpression(ast).properties);
    });

    it('behaves correctly with spreads of objects', function () {
      const getObjectExpression = (
        ast: Program,
        bodyElement: number,
      ): ObjectExpression =>
        (ast.body[bodyElement] as VariableDeclaration).declarations[0]
          .init as ObjectExpression;

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
      ) as unknown as Program;
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        getObjectExpression(ast, 2),
        scopeManager,
      );
      assert.deepEqual(result, [
        ...getObjectExpression(ast, 0).properties, // First spread properties
        ...getObjectExpression(ast, 2).properties.filter(
          (property) => property.type !== 'SpreadElement',
        ), // Non-spread properties
        ...getObjectExpression(ast, 1).properties, // Second spread properties
      ]);
    });

    it('behaves correctly with non-variable spreads', function () {
      const getObjectExpression = (ast: Program): ObjectExpression =>
        (ast.body[1] as VariableDeclaration).declarations[0]
          .init as ObjectExpression;

      const ast = espree.parse(`function foo() {} const obj = { ...foo() };`, {
        ecmaVersion: 9,
        range: true,
      }) as unknown as Program;
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        getObjectExpression(ast),
        scopeManager,
      );
      assert.deepEqual(result, []);
    });

    it('behaves correctly with spread with variable that cannot be found', function () {
      const ast = espree.parse(`const obj = { ...foo };`, {
        ecmaVersion: 9,
        range: true,
      }) as unknown as Program;
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(
        (ast.body[0] as VariableDeclaration).declarations[0]
          .init as ObjectExpression,
        scopeManager,
      );
      assert.deepEqual(result, []);
    });

    it('behaves correctly when passed wrong node type', function () {
      const ast = espree.parse(`foo();`, {
        ecmaVersion: 9,
        range: true,
      }) as unknown as Program;
      const scopeManager = eslintScope.analyze(ast);
      const result = utils.evaluateObjectProperties(ast.body[0], scopeManager);
      assert.deepEqual(result, []);
    });
  });

  describe('getMessagesNode', function () {
    type TestCase = {
      code: string;
      getResult: ((ast: Program) => ObjectExpression) | (() => void);
    };
    const CASES: TestCase[] = [
      {
        code: 'module.exports = { meta: { messages: {} }, create(context) {} };',
        getResult(ast) {
          return (
            (
              (
                (
                  (
                    (ast.body[0] as ExpressionStatement)
                      .expression as AssignmentExpression
                  ).right as ObjectExpression
                ).properties[0] as Property
              ).value as ObjectExpression
            ).properties[0] as Property
          ).value as ObjectExpression;
        },
      },
      {
        // variable
        code: `
          const messages = { foo: 'hello world' };
          module.exports = { meta: { messages }, create(context) {} };
        `,
        getResult(ast) {
          return (ast.body[0] as VariableDeclaration).declarations[0]
            .init as ObjectExpression;
        },
      },
      {
        // spread
        code: `
          const extra = { messages: { foo: 'hello world' } };
          module.exports = { meta: { ...extra }, create(context) {} };
        `,
        getResult(ast) {
          return (
            (
              (ast.body[0] as VariableDeclaration).declarations[0]
                .init as ObjectExpression
            ).properties[0] as Property
          ).value as ObjectExpression;
        },
      },
      {
        code: `module.exports = { meta: FOO, create(context) {} };`,
        getResult() {
          return undefined;
        }, // returns undefined
      },
      {
        code: `module.exports = { create(context) {} };`,
        getResult() {}, // returns undefined
      },
    ];
    CASES.forEach((testCase) => {
      describe(testCase.code, () => {
        it('returns the right node', () => {
          const ast = espree.parse(testCase.code, {
            ecmaVersion: 9,
            range: true,
          }) as unknown as Program;
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
    type TestCase = {
      code: string;
      getResult: (ast: Program) => Property[];
    };
    const CASES: TestCase[] = [
      {
        code: 'module.exports = { meta: { messages: { foo: "hello world" } }, create(context) {} };',
        getResult(ast) {
          return (
            (
              (
                (
                  (
                    (
                      (ast.body[0] as ExpressionStatement)
                        .expression as AssignmentExpression
                    ).right as ObjectExpression
                  ).properties[0] as Property
                ).value as ObjectExpression
              ).properties[0] as Property
            ).value as ObjectExpression
          ).properties as Property[];
        },
      },
      {
        // variable
        code: `
          const messages = { foo: 'hello world' };
          module.exports = { meta: { messages }, create(context) {} };
        `,
        getResult(ast) {
          return (
            (ast.body[0] as VariableDeclaration).declarations[0]
              .init as ObjectExpression
          ).properties as Property[];
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
          return (
            (ast.body[0] as VariableDeclaration).declarations[0]
              .init as ObjectExpression
          ).properties as Property[];
        },
      },
    ];
    CASES.forEach((testCase) => {
      describe(testCase.code, () => {
        it('returns the right node', () => {
          const ast = espree.parse(testCase.code, {
            ecmaVersion: 9,
            range: true,
          }) as unknown as Program;
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert.deepEqual(
            ruleInfo && utils.getMessageIdNodes(ruleInfo, scopeManager),
            testCase.getResult(ast),
          );
        });
      });
    });
  });

  describe('getMessageIdNodeById', function () {
    type TestCase = {
      code: string;
      run: (
        ruleInfo: RuleInfo,
        scopeManager: Scope.ScopeManager,
      ) => Property | undefined;
      getResult: ((ast: Program) => Property) | (() => void);
    };
    const CASES: TestCase[] = [
      {
        code: 'module.exports = { meta: { messages: { foo: "hello world" } }, create(context) {} };',
        run(ruleInfo, scopeManager) {
          return utils.getMessageIdNodeById(
            'foo',
            ruleInfo,
            scopeManager,
            scopeManager.globalScope!,
          );
        },
        getResult(ast) {
          return (
            (
              (
                (
                  (
                    (
                      (ast.body[0] as ExpressionStatement)
                        .expression as AssignmentExpression
                    ).right as ObjectExpression
                  ).properties[0] as Property
                ).value as ObjectExpression
              ).properties[0] as Property
            ).value as ObjectExpression
          ).properties[0] as Property;
        },
      },
      {
        code: 'module.exports = { meta: { messages: { foo: "hello world" } }, create(context) {} };',
        run(ruleInfo, scopeManager) {
          return utils.getMessageIdNodeById(
            'bar',
            ruleInfo,
            scopeManager,
            scopeManager.globalScope!,
          );
        },
        getResult() {}, // returns undefined
      },
    ];

    CASES.forEach((testCase) => {
      describe(testCase.code, () => {
        it('returns the right node', () => {
          const ast = espree.parse(testCase.code, {
            ecmaVersion: 9,
            range: true,
          }) as unknown as Program;
          const scopeManager = eslintScope.analyze(ast);
          const ruleInfo = utils.getRuleInfo({ ast, scopeManager });
          assert.strictEqual(
            ruleInfo && testCase.run(ruleInfo, scopeManager),
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
      }) as unknown as Program;

      // Add parent to each node.
      estraverse.traverse(ast, {
        enter(node, parent) {
          if (parent) {
            node.parent = parent;
          }
        },
      });

      const scopeManager = eslintScope.analyze(ast);
      assert.deepEqual(
        utils.findPossibleVariableValues(
          (ast.body[0] as VariableDeclaration).declarations[0].id as Identifier,
          scopeManager,
        ),
        [
          (ast.body[0] as VariableDeclaration).declarations[0].init as Literal,
          (
            (ast.body[1] as ExpressionStatement)
              .expression as AssignmentExpression
          ).right,
          (
            (ast.body[2] as ExpressionStatement)
              .expression as AssignmentExpression
          ).right,
          (
            (
              ((ast.body[3] as IfStatement).consequent as BlockStatement)
                .body[0] as ExpressionStatement
            ).expression as AssignmentExpression
          ).right,
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
      }) as unknown as Program;

      const scopeManager = eslintScope.analyze(ast);
      assert.ok(
        utils.isVariableFromParameter(
          (
            (
              (ast.body[0] as FunctionDeclaration).body
                .body[1] as ExpressionStatement
            ).expression as CallExpression
          ).arguments[0] as Identifier,
          scopeManager,
        ),
      );
    });

    it('returns false for const variable', () => {
      const code = 'const x = "abc"; console.log(x);';
      const ast = espree.parse(code, {
        ecmaVersion: 9,
        range: true,
      }) as unknown as Program;

      const scopeManager = eslintScope.analyze(ast);
      assert.notOk(
        utils.isVariableFromParameter(
          ((ast.body[1] as ExpressionStatement).expression as CallExpression)
            .arguments[0] as Identifier,
          scopeManager,
        ),
      );
    });
  });
});
