/**
 * @fileoverview Disallow rule options schema constructs that ESLint ignores.
 * @author morgan-coded
 */
import { Linter, RuleTester } from 'eslint';
import { expect, it } from 'vitest';

import incompleteRule from '../../../lib/rules/no-incomplete-meta-schema.ts';
import rule from '../../../lib/rules/no-useless-meta-schema.ts';

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

const ignoredKeywordCases = [
  "$dynamicRef:'#value'",
  "$recursiveRef:'#'",
  'contentSchema:{}',
  "dependentRequired:{value:['other']}",
  'dependentSchemas:{value:{}}',
  'maxContains:1',
  'minContains:1',
  'prefixItems:[]',
  'unevaluatedItems:false',
  'unevaluatedProperties:false',
].map((contents) => {
  const schema = `{${contents}}`;
  return {
    code: `module.exports={meta:{schema:[${schema}]},create(context){}};`,
    errors: [
      {
        messageId: 'ignoredKeywords',
        type: 'ObjectExpression',
        column: 31,
        endColumn: 31 + schema.length,
        endLine: 1,
        line: 1,
      },
    ],
    name: `ignoredKeywords reports ${contents.split(':')[0]}`,
  };
});

ruleTester.run('no-useless-meta-schema', rule, {
  valid: [
    {
      code: 'module.exports={meta:{schema:false},create(context){}};',
      name: 'schema false explicitly opts out of validation',
    },
    {
      code: 'module.exports={meta:{schema:[]},create(context){}};',
      name: 'empty array schema accepts no rule options',
    },
    {
      code: "module.exports={meta:{schema:[{type:'string'}]},create(context){}};",
      name: 'array-form positional schema remains supported',
    },
    {
      code: 'module.exports={meta:{schema:[{}]},create(context){}};',
      name: 'array shorthand with an unconstrained positional element still has cardinality semantics',
    },
    {
      code: "module.exports={meta:{schema:[{title:'description only'}]},create(context){}};",
      name: 'annotation-only positional elements are not a useless root schema',
    },
    {
      code: "module.exports={meta:{schema:{type:'array',items:[{}]}},create(context){}};",
      name: 'tuple elements are not classified as useless schemas',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}],additionalItems:false}]},create(context){}};",
      name: 'additionalItems applies to tuple-form items',
    },
    {
      code: "module.exports={meta:{schema:{type:'array',items:{type:'string'}}},create(context){}};",
      name: 'object-form options array with an effective item schema',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/x',definitions:{x:{type:'string'}}}]},create(context){}};",
      name: 'a local ref resolves through its definitions container',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',minItems:1,maxItems:1}]},create(context){}};",
      name: 'equal inclusive bounds are satisfiable',
    },
    {
      code: "module.exports={meta:{schema:[{type:['string','array'],minItems:1}]},create(context){}};",
      name: 'a keyword is compatible with one member of a type union',
    },
    {
      code: 'module.exports={meta:{schema:{}},create(context){}};',
      options: [{ checks: { emptyRoot: false } }],
      name: 'emptyRoot can be disabled',
    },
    {
      code: "module.exports={meta:{schema:{type:'array'}},create(context){}};",
      options: [{ checks: { bareArrayRoot: false } }],
      name: 'bareArrayRoot can be disabled',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',additionalProperties:false}},create(context){}};",
      options: [{ checks: { nonArrayRootType: false } }],
      name: 'nonArrayRootType can be disabled',
    },
    {
      code: 'module.exports={meta:{schema:{additionalProperties:false}},create(context){}};',
      options: [{ checks: { nonConstrainingRoot: false } }],
      name: 'nonConstrainingRoot can be disabled',
    },
    {
      code: 'module.exports={meta:{schema},create(context){}};',
      name: 'unresolved schema identifier fails open',
    },
    {
      code: "module.exports={meta:{schema:{type:'array',...schemaExtensions}},create(context){}};",
      name: 'unresolved schema spread fails open',
    },
    {
      code: 'const value=1;',
      name: 'a module without a rule definition produces no report',
    },
    {
      code: 'module.exports={meta:{schema:true},create(context){}};',
      name: 'a boolean schema produces no correctness report',
    },
    {
      code: 'module.exports={meta:{schema:[true]},create(context){}};',
      name: 'a boolean positional schema produces no correctness report',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#'}]},create(context){}};",
      name: 'a self reference resolves',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/list/0',definitions:{list:[{type:'string'}]}}]},create(context){}};",
      name: 'a local reference resolves through an array index',
    },
    {
      code: "module.exports={meta:{schema:{type:['array','string'],items:{type:'string'}}},create(context){}};",
      name: 'a multi-type object-form root can include arrays',
    },
  ],
  invalid: [
    ...ignoredKeywordCases,
    {
      code: 'module.exports={meta:{schema:{}},create(context){}};',
      errors: [
        {
          messageId: 'emptyRoot',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 32,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'emptyRoot reports the RFC empty object workaround',
    },
    {
      code: "module.exports={meta:{schema:{type:'array'}},create(context){}};",
      errors: [
        {
          messageId: 'bareArrayRoot',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 44,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'bareArrayRoot reports the RFC bare array workaround',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',additionalProperties:false}},create(context){}};",
      errors: [
        {
          messageId: 'nonArrayRootType',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 72,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'nonArrayRootType reports an object-only root schema',
    },
    {
      code: 'module.exports={meta:{schema:{additionalProperties:false}},create(context){}};',
      errors: [
        {
          messageId: 'nonConstrainingRoot',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 58,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'nonConstrainingRoot reports array-irrelevant root keywords',
    },
    {
      code: 'module.exports={meta:{schema:[{required:true}]},create(context){}};',
      errors: [
        {
          messageId: 'ignoredKeywords',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 46,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignoredKeywords reports draft-03 required true',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/x',type:'string',definitions:{x:{type:'string'}}}]},create(context){}};",
      errors: [
        {
          messageId: 'ignoredRefSiblings',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 101,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignoredRefSiblings reports a constraint beside a ref',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/missing'}]},create(context){}};",
      errors: [
        {
          messageId: 'unresolvedRefs',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 61,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'unresolvedRefs reports a missing local target',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{type:'string'},additionalItems:false}]},create(context){}};",
      errors: [
        {
          messageId: 'ignoredAdditionalItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 89,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignoredAdditionalItems reports additionalItems with schema-form items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',additionalItems:false}]},create(context){}};",
      errors: [
        {
          messageId: 'ignoredAdditionalItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 67,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignoredAdditionalItems reports additionalItems without items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'string',minItems:1}]},create(context){}};",
      errors: [
        {
          messageId: 'incompatibleTypeKeywords',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 57,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'incompatibleTypeKeywords reports an array bound on a string',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',minItems:2,maxItems:1}]},create(context){}};",
      errors: [
        {
          messageId: 'impossibleBounds',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 67,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'impossibleBounds reports a minimum above its maximum',
    },
    {
      code: "module.exports={meta:{schema:[{type:'number',minimum:1,maximum:1,exclusiveMinimum:true}]},create(context){}};",
      errors: [
        {
          messageId: 'impossibleBounds',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 88,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'impossibleBounds reports equal bounds when one side is exclusive',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/missing',type:'array'}]},create(context){}};",
      errors: [
        {
          messageId: 'ignoredRefSiblings',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 74,
          endLine: 1,
          line: 1,
        },
        {
          messageId: 'unresolvedRefs',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 74,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'an unresolved ref with a constraint sibling reports both objective defects',
    },
    {
      code: 'const option={required:true};module.exports={meta:{schema:[option]},create(context){}};',
      errors: [
        {
          messageId: 'ignoredKeywords',
          type: 'ObjectExpression',
          column: 14,
          endColumn: 29,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'statically resolved positional schemas are traversed',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'https://example.com/schema'}]},create(context){}};",
      errors: [
        {
          messageId: 'unresolvedRefs',
          column: 31,
          endColumn: 66,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'an external reference is unresolved by the local resolver',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/list/nope',definitions:{list:[{type:'string'}]}}]},create(context){}};",
      errors: [
        {
          messageId: 'unresolvedRefs',
          column: 31,
          endColumn: 100,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a nonnumeric array pointer segment is unresolved',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/list/1',definitions:{list:[{type:'string'}]}}]},create(context){}};",
      errors: [
        {
          messageId: 'unresolvedRefs',
          column: 31,
          endColumn: 97,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'an out-of-range array pointer is unresolved',
    },
    {
      code: "module.exports={meta:{schema:[{type:'string',required:true}]},create(context){}};",
      errors: [
        {
          messageId: 'ignoredKeywords',
          column: 31,
          endColumn: 60,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'draft-03 required true is not also incompatible with a string type',
    },
    {
      code: "module.exports={meta:{schema:[{type:'number',exclusiveMinimum:2,maximum:1}]},create(context){}};",
      errors: [
        {
          messageId: 'impossibleBounds',
          column: 31,
          endColumn: 75,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a numeric exclusive lower bound can exceed an inclusive upper bound',
    },
    {
      code: "module.exports={meta:{schema:[{type:'number',minimum:2,exclusiveMaximum:1}]},create(context){}};",
      errors: [
        {
          messageId: 'impossibleBounds',
          column: 31,
          endColumn: 75,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'an inclusive lower bound can exceed a numeric exclusive upper bound',
    },
    {
      code: "module.exports={meta:{schema:[{type:'number',minimum:1,maximum:1,exclusiveMaximum:true}]},create(context){}};",
      errors: [
        {
          messageId: 'impossibleBounds',
          column: 31,
          endColumn: 88,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'equal bounds are impossible when the upper side is exclusive',
    },
    {
      code: 'const child={prefixItems:[]};module.exports={meta:{schema:[{allOf:[child,child]}]},create(context){}};',
      errors: [
        {
          messageId: 'ignoredKeywords',
          column: 13,
          endColumn: 29,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a shared child schema is visited once',
    },
    {
      code: "module.exports={meta:{schema:{type:['object']}},create(context){}};",
      errors: [
        {
          messageId: 'nonArrayRootType',
          column: 30,
          endColumn: 47,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a single non-array type in an array-valued root is rejected',
    },
  ],
});

it('does not duplicate an ignored keyword with completeness noise', () => {
  const messages = new Linter({ configType: 'flat' }).verify(
    "module.exports={meta:{schema:[{type:'array',prefixItems:[{type:'string'}]}]},create(context){}};",
    [
      {
        languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
        plugins: {
          'eslint-plugin': {
            rules: {
              'no-incomplete-meta-schema': incompleteRule,
              'no-useless-meta-schema': rule,
            },
          },
        },
        rules: {
          'eslint-plugin/no-incomplete-meta-schema': 'error',
          'eslint-plugin/no-useless-meta-schema': 'error',
        },
      },
    ],
  );

  expect(messages.map(({ messageId }) => messageId)).toEqual([
    'ignoredKeywords',
  ]);
});

it('leaves an explicit wrong root type to the correctness rule', () => {
  const messages = new Linter({ configType: 'flat' }).verify(
    "module.exports={meta:{schema:{type:'object',items:[{type:'string'}]}},create(context){}};",
    [
      {
        languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
        plugins: {
          'eslint-plugin': {
            rules: {
              'no-incomplete-meta-schema': incompleteRule,
              'no-useless-meta-schema': rule,
            },
          },
        },
        rules: {
          'eslint-plugin/no-incomplete-meta-schema': 'error',
          'eslint-plugin/no-useless-meta-schema': 'error',
        },
      },
    ],
  );

  expect(messages.map(({ messageId }) => messageId)).toEqual([
    'nonArrayRootType',
  ]);
});

it('does not duplicate useless root defects with completeness noise', () => {
  for (const [source, expectedMessageId] of [
    ['{}', 'emptyRoot'],
    ["{type:'array'}", 'bareArrayRoot'],
    ['{additionalProperties:false}', 'nonConstrainingRoot'],
  ]) {
    const messages = new Linter({ configType: 'flat' }).verify(
      `module.exports={meta:{schema:${source}},create(context){}};`,
      [
        {
          languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
          plugins: {
            'eslint-plugin': {
              rules: {
                'no-incomplete-meta-schema': incompleteRule,
                'no-useless-meta-schema': rule,
              },
            },
          },
          rules: {
            'eslint-plugin/no-incomplete-meta-schema': 'error',
            'eslint-plugin/no-useless-meta-schema': 'error',
          },
        },
      ],
    );

    expect(messages.map(({ messageId }) => messageId)).toEqual([
      expectedMessageId,
    ]);
  }
});
