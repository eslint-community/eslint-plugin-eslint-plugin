/**
 * @fileoverview Require explicit policy choices in rule options schemas.
 * @author morgan-coded
 */
import { RuleTester } from 'eslint';

import rule from '../../../lib/rules/no-incomplete-meta-schema.ts';

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('no-incomplete-meta-schema', rule, {
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
      code: "module.exports={meta:{schema:{type:'array',items:{type:'string'}}},create(context){}};",
      name: 'object-form options array with typed items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',additionalProperties:true}]},create(context){}};",
      name: 'deliberately open object with explicit additionalProperties true',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}],additionalItems:false}]},create(context){}};",
      name: 'tuple bounded by additionalItems false',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}],maxItems:1}]},create(context){}};",
      name: 'tuple bounded by equivalent maxItems cap',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}],additionalItems:{type:'number'}}]},create(context){}};",
      name: 'tuple bounded by schema-valued additionalItems',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:false}]},create(context){}};",
      name: 'items false rejects every item',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{}}]},create(context){}};",
      name: 'items empty object explicitly opts into unconstrained items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',prefixItems:[{type:'string'}]}]},create(context){}};",
      name: 'an ignored keyword is left to the correctness rule without completeness noise',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',elements:{type:'string'}}]},create(context){}};",
      name: 'ignored elements is left to the correctness rule without completeness noise',
    },
    {
      code: "module.exports={meta:{schema:[{extends:[{type:'array'}]}]},create(context){}};",
      name: 'array-form inert extends is left to the correctness rule',
    },
    {
      code: "module.exports={meta:{schema:[{extends:{type:'array'}}]},create(context){}};",
      name: 'scalar-form inert extends is left to the correctness rule',
    },
    {
      code: "module.exports={meta:{schema:[{$ref:'#/definitions/missing',type:'array'}]},create(context){}};",
      name: 'an unresolved ref and its ignored siblings are left to the correctness rule',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',items:[{type:'string'}]}},create(context){}};",
      name: 'an explicit wrong object-form root type is left to the correctness rule',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}],additionalItems:true}]},create(context){}};",
      name: 'additionalItems true explicitly opts into an open tuple',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{enum:['always','never']}}]},create(context){}};",
      name: 'array item type supplied by an enum',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{oneOf:[{type:'string'},{type:'boolean'}]}}]},create(context){}};",
      name: 'array item type supplied by composition',
    },
    {
      code: "module.exports={meta:{schema:[{not:{type:'array'}}]},create(context){}};",
      name: 'negative schemas are not checked as positive constraints',
    },
    {
      code: "module.exports={meta:{schema:[{if:{type:'string'},then:{type:'array'}}]},create(context){}};",
      name: 'conditional branches are not checked as positive constraints',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',properties:{value:{type:'string'}}}]},create(context){}};",
      options: [{ checks: { explicitAdditionalProperties: false } }],
      name: 'explicitAdditionalProperties can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}]}]},create(context){}};",
      options: [{ checks: { boundedTuples: false } }],
      name: 'boundedTuples can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array'}]},create(context){}};",
      options: [{ checks: { explicitItems: false } }],
      name: 'explicitItems can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{pattern:'^x'}}]},create(context){}};",
      options: [{ checks: { typedItems: false } }],
      name: 'typedItems can be disabled',
    },
    {
      code: 'module.exports={meta:{schema},create(context){}};',
      name: 'unresolved schema identifier fails open',
    },
    {
      code: 'const value=1;',
      name: 'a module without a rule definition produces no report',
    },
    {
      code: 'module.exports={meta:{schema:true},create(context){}};',
      name: 'a boolean schema produces no completeness report',
    },
    {
      code: 'module.exports={meta:{schema:[true]},create(context){}};',
      name: 'a boolean positional schema produces no completeness report',
    },
    {
      code: "const key='type';module.exports={meta:{schema:[{[key]:'array'}]},create(context){}};",
      name: 'computed schema keys fail open',
    },
    {
      code: 'module.exports={meta:{schema:getSchema()},create(context){}};',
      name: 'a call-expression schema fails open',
    },
    {
      code: 'module.exports={meta:{schema:flag?[]:[]},create(context){}};',
      name: 'a conditional-expression schema fails open',
    },
    {
      code: 'module.exports={meta:{schema:maybeSchema||[]},create(context){}};',
      name: 'a logical-expression schema fails open',
    },
    {
      code: 'let schema;module.exports={meta:{schema},create(context){}};',
      name: 'an uninitialized schema identifier fails open',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:getSchema()}]},create(context){}};",
      name: 'a nested call-expression schema fails open',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:flag?{}:{}}]},create(context){}};",
      name: 'a nested conditional-expression schema fails open',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:maybeSchema||{}}]},create(context){}};",
      name: 'a nested logical-expression schema fails open',
    },
    {
      code: 'module.exports={meta:{schema:[undefined]},create(context){}};',
      name: 'a statically known global without a declarator fails open',
    },
    {
      code: "module.exports={meta:{schema:{type:['object'],items:[{type:'string'}]}},create(context){}};",
      name: 'an array-valued wrong root type is left to the correctness rule',
    },
    {
      code: "module.exports={meta:{schema:{type:['array','string'],items:{type:'string'}}},create(context){}};",
      name: 'a multi-type object-form root can include arrays',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',allOf:[{items:{type:'string'}}]}]},create(context){}};",
      name: 'allOf can supply an item constraint',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',oneOf:[{items:false},{items:{}}]}]},create(context){}};",
      name: 'every oneOf branch can supply an item constraint',
    },
    {
      code: "const branch={items:{}};module.exports={meta:{schema:[{type:'array',allOf:[branch]}]},create(context){}};",
      name: 'a hoisted allOf branch can supply an item constraint',
    },
    {
      code: "const branches=[{items:{}}];module.exports={meta:{schema:[{type:'array',allOf:branches}]},create(context){}};",
      name: 'a hoisted allOf array can supply an item constraint',
    },
    {
      code: "const branches=[{items:false},{items:{}}];module.exports={meta:{schema:[{type:'array',anyOf:branches}]},create(context){}};",
      name: 'every branch in a hoisted anyOf array can supply an item constraint',
    },
    {
      code: "const first={items:false};const second={items:{}};module.exports={meta:{schema:[{type:'array',oneOf:[first,second]}]},create(context){}};",
      name: 'hoisted oneOf branches can supply item constraints',
    },
    {
      code: "const branch=getBranch();module.exports={meta:{schema:[{type:'array',allOf:[branch]}]},create(context){}};",
      name: 'an unresolvable hoisted branch keeps the existing fail-open behavior',
    },
    {
      code: "const tuple=[{type:'string'}];module.exports={meta:{schema:[{type:'array',items:tuple,additionalItems:false}]},create(context){}};",
      name: 'a hoisted tuple array with typed items and a bound is compliant',
    },
    {
      code: "const tuple=getTuple();module.exports={meta:{schema:[{type:'array',items:tuple}]},create(context){}};",
      name: 'an unresolvable hoisted items value keeps the existing fail-open behavior',
    },
  ],
  invalid: [
    {
      code: "module.exports={meta:{schema:[{type:'object',properties:{value:{type:'string'}}}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitAdditionalProperties',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 81,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'explicitAdditionalProperties reports an implicit policy',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}]}]},create(context){}};",
      errors: [
        {
          messageId: 'boundedTuples',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 69,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'boundedTuples reports an open tuple',
    },
    {
      code: "const tuple=[{pattern:'x'}];module.exports={meta:{schema:[{type:'array',items:tuple}]},create(context){}};",
      errors: [
        {
          messageId: 'typedItems',
          type: 'ObjectExpression',
          column: 14,
          endColumn: 27,
          endLine: 1,
          line: 1,
        },
        {
          messageId: 'boundedTuples',
          type: 'ObjectExpression',
          column: 59,
          endColumn: 85,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a hoisted tuple array is resolved for the tuple checks',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',if:{minItems:1}}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 61,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a bare if does not provide an item policy',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',not:{maxItems:0}}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 62,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a bare not does not provide an item policy',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:true}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 56,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'items true does not constrain array items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{pattern:'^x'}}]},create(context){}};",
      errors: [
        {
          messageId: 'typedItems',
          type: 'ObjectExpression',
          column: 51,
          endColumn: 65,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'typedItems reports a pattern-only item schema',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{itemz:{type:'string'}}}]},create(context){}};",
      errors: [
        {
          messageId: 'typedItems',
          type: 'ObjectExpression',
          column: 51,
          endColumn: 74,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'typedItems does not trust an unknown keyword as a type constraint',
    },
    {
      code: "module.exports={meta:{schema:{definitions:{value:{enum:['always','never']}},items:[{$ref:'#/definitions/value'},{type:'object',properties:{generators:{$ref:'#/definitions/value'}},additionalProperties:false}]}},create(context){}};",
      errors: [
        {
          messageId: 'boundedTuples',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 210,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'object-form root is checked as the rule-options array without an explicit type',
    },
    {
      code: "const option={type:'object',properties:{value:{type:'string'}}};module.exports={meta:{schema:[option]},create(context){}};",
      errors: [
        {
          messageId: 'explicitAdditionalProperties',
          type: 'ObjectExpression',
          column: 14,
          endColumn: 64,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'statically resolved positional schemas are traversed',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',properties:{value:{type:'object',not:{type:'array'}}},additionalProperties:false}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitAdditionalProperties',
          type: 'ObjectExpression',
          column: 64,
          endColumn: 98,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'positive parents remain checked while nested not schemas are skipped',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',additionalProperties:{type:'array'}}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          type: 'ObjectExpression',
          column: 67,
          endColumn: 81,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'positive additionalProperties schemas remain checked',
    },
    {
      code: "module.exports={meta:{schema:[{dependencies:{value:{type:'array'},names:['other']}}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          column: 52,
          endColumn: 66,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'schema dependencies are traversed while property dependencies are not',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',allOf:[true]}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          column: 31,
          endColumn: 58,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a literal allOf branch does not provide an item constraint',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',anyOf:[]}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          column: 31,
          endColumn: 54,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'an empty anyOf does not provide an item constraint',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',anyOf:[true,{items:false}]}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          column: 31,
          endColumn: 72,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'every anyOf branch must provide an item constraint',
    },
    {
      code: "const child={type:'array'};module.exports={meta:{schema:[{allOf:[child,child]}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          column: 13,
          endColumn: 27,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a shared child schema is visited once',
    },
    {
      code: "const branch={type:'string'};module.exports={meta:{schema:[{type:'array',allOf:[branch]}]},create(context){}};",
      errors: [
        {
          messageId: 'explicitItems',
          type: 'ObjectExpression',
          column: 60,
          endColumn: 89,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'a hoisted allOf branch without an item constraint still reports',
    },
  ],
});
