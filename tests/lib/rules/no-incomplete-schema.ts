/**
 * @fileoverview Disallow incomplete rule options schemas.
 * @author morgan-coded
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-incomplete-schema.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('no-incomplete-schema', rule, {
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
      code: "module.exports={meta:{schema:{type:['array','null'],items:{type:'string'}}},create(context){}};",
      name: 'object-form type union that includes array',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',additionalProperties:{type:'boolean'}}]},create(context){}};",
      name: 'dictionary object with schema-valued additionalProperties',
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
      code: "module.exports={meta:{schema:[{type:'array',items:{$ref:'#/definitions/value'},definitions:{value:{enum:['always','never']}}}]},create(context){}};",
      name: 'array item type supplied by a ref',
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
      code: "module.exports={meta:{schema:[{type:'array',items:{not:{pattern:':exit$'}}}]},create(context){}};",
      name: 'array item type supplied by not constraint',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',allOf:[{items:{type:'string'}}]}]},create(context){}};",
      name: 'array item constraint supplied by allOf',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',anyOf:[{items:{type:'string'}},{items:{type:'boolean'}}]}]},create(context){}};",
      name: 'array item constraint supplied by every anyOf branch',
    },
    {
      code: "module.exports={meta:{schema:{definitions:{value:{enum:['always','never']}},items:[{$ref:'#/definitions/value'},{type:'object',properties:{generators:{$ref:'#/definitions/value'}},additionalProperties:false}]}},create(context){}};",
      name: 'core func-names ref and root items shape',
    },
    {
      code: "module.exports={meta:{schema:{type:'array',oneOf:[{items:[{const:'always'},{type:'object',properties:{enforceForIfStatements:{type:'boolean'}},additionalProperties:false}],minItems:0,maxItems:2},{items:[{const:'never'}],minItems:1,maxItems:1}]}},create(context){}};",
      name: 'core logical assignment composed capped tuples',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{type:'string'},prefixItems:[{type:'object'}]}]},create(context){}};",
      name: 'ignored prefixItems subschemas are not traversed',
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
      code: "module.exports={meta:{schema:[{type:'array',items:{type:'string',not:{pattern:':exit$'}}}]},create(context){}};",
      name: 'core indent string item with not pattern',
    },
    {
      code: 'module.exports={meta:{schema},create(context){}};',
      name: 'unresolved schema identifier fails open',
    },
    {
      code: 'module.exports={meta:{schema:getSchema()},create(context){}};',
      name: 'schema call expression fails open',
    },
    {
      code: 'module.exports={meta:{schema:condition?{}:[]},create(context){}};',
      name: 'conditional schema value fails open',
    },
    {
      code: "import schema from './schema.js'; export default {meta:{schema},create(context){}};",
      languageOptions: { sourceType: 'module' },
      name: 'imported schema fails open',
    },
    {
      code: "const baseRule=require('./base-rule');module.exports={meta:{...baseRule.meta,schema:{}},create(context){}};",
      name: 'unresolved meta spread fails open',
    },
    {
      code: "module.exports={meta:{schema:{type:'array',...schemaExtensions}},create(context){}};",
      name: 'unresolved schema spread fails open',
    },
    {
      code: "const key='type';module.exports={meta:{schema:{[key]:'array'}},create(context){}};",
      name: 'computed schema key fails open',
    },
    {
      code: 'module.exports={meta:{schema:{}},create(context){}};',
      options: [{ checks: { rootEmptySchema: false } }],
      name: 'rootEmptySchema can be disabled',
    },
    {
      code: "module.exports={meta:{schema:{type:'array'}},create(context){}};",
      options: [
        {
          checks: {
            arrayItems: false,
            rootBareArraySchema: false,
          },
        },
      ],
      name: 'rootBareArraySchema and the independent arrayItems check can be disabled',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',additionalProperties:false}},create(context){}};",
      options: [{ checks: { rootWrongOptionsType: false } }],
      name: 'rootWrongOptionsType can be disabled',
    },
    {
      code: 'module.exports={meta:{schema:{additionalProperties:false}},create(context){}};',
      options: [{ checks: { rootObjectKeywordNoop: false } }],
      name: 'rootObjectKeywordNoop can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',properties:{value:{type:'string'}}}]},create(context){}};",
      options: [{ checks: { objectAdditionalPropertiesExplicit: false } }],
      name: 'objectAdditionalPropertiesExplicit can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}]}]},create(context){}};",
      options: [{ checks: { tupleAdditionalItems: false } }],
      name: 'tupleAdditionalItems can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array'}]},create(context){}};",
      options: [{ checks: { arrayItems: false } }],
      name: 'arrayItems can be disabled',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{pattern:'^x'}}]},create(context){}};",
      options: [{ checks: { arrayItemType: false } }],
      name: 'arrayItemType can be disabled',
    },
    {
      code: 'module.exports={create(context){}};',
      name: 'non-rule metadata is ignored',
    },
  ],
  invalid: [
    {
      code: 'module.exports={meta:{schema:{}},create(context){}};',
      errors: [
        {
          messageId: 'emptySchema',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 32,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'rootEmptySchema reports the RFC empty object workaround',
    },
    {
      code: "module.exports={meta:{schema:{type:'array'}},create(context){}};",
      errors: [
        {
          messageId: 'bareArraySchema',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 44,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'rootBareArraySchema reports the RFC bare array workaround',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',additionalProperties:false}},create(context){}};",
      errors: [
        {
          messageId: 'wrongOptionsType',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 72,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'rootWrongOptionsType reports an object-only root schema',
    },
    {
      code: 'module.exports={meta:{schema:{additionalProperties:false}},create(context){}};',
      errors: [
        {
          messageId: 'ineffectiveRootSchema',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 58,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'rootObjectKeywordNoop reports array-irrelevant root keywords',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',properties:{value:{type:'string'}}}]},create(context){}};",
      errors: [
        {
          messageId: 'missingAdditionalProperties',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 81,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'objectAdditionalPropertiesExplicit reports an implicit policy',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:[{type:'string'}]}]},create(context){}};",
      errors: [
        {
          messageId: 'unboundedTuple',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 69,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'tupleAdditionalItems reports an unbounded tuple',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',elements:{type:'string'}}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 70,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'arrayItems reports the ignored elements keyword',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',properties:{nested:{type:'array'}},additionalProperties:false}},create(context){}};",
      options: [{ checks: { rootWrongOptionsType: false } }],
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 64,
          endColumn: 78,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'disabled root checks preserve nested traversal',
    },
    {
      code: "module.exports={meta:{schema:{type:'array'}},create(context){}};",
      options: [{ checks: { rootBareArraySchema: false } }],
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 44,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'disabled root checks preserve checks on the root schema itself',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',prefixItems:[{type:'string'}]}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 75,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignored prefixItems does not constrain array items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:true}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
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
      code: "const option={type:'object',properties:{value:{type:'string'}}};module.exports={meta:{schema:[option]},create(context){}};",
      errors: [
        {
          messageId: 'missingAdditionalProperties',
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
      code: 'module.exports={meta:{schema:[{}]},create(context){}};',
      errors: [
        {
          messageId: 'emptySchema',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 33,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'empty positional schemas are reported',
    },
    {
      code: "module.exports={meta:{schema:[{title:'description only'}]},create(context){}};",
      errors: [
        {
          messageId: 'ineffectiveRootSchema',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 57,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'annotation-only positional schemas are reported',
    },
    {
      code: "module.exports={meta:{schema:{type:['array']}},create(context){}};",
      errors: [
        {
          messageId: 'bareArraySchema',
          type: 'ObjectExpression',
          column: 30,
          endColumn: 46,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'single-element array type reports bareArraySchema',
    },
    {
      code: "module.exports={meta:{schema:[{},{type:'array',items:true},{type:'object',properties:{nested:{type:'array'}}}]},create(context){}};",
      errors: [
        {
          messageId: 'emptySchema',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 33,
          endLine: 1,
          line: 1,
        },
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 34,
          endColumn: 59,
          endLine: 1,
          line: 1,
        },
        {
          messageId: 'missingAdditionalProperties',
          type: 'ObjectExpression',
          column: 60,
          endColumn: 110,
          endLine: 1,
          line: 1,
        },
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 94,
          endColumn: 108,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'multiple defects in one schema are reported together',
    },
    {
      code: "module.exports={meta:{schema:{type:'object',items:[{}],additionalProperties:false}},create(context){}};",
      options: [{ checks: { rootWrongOptionsType: false } }],
      errors: [
        {
          messageId: 'emptySchema',
          type: 'ObjectExpression',
          column: 52,
          endColumn: 54,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'disabled root traversal reaches no-op tuple elements',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',allOf:[{prefixItems:[{type:'string'}]}]}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 85,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'allOf branches containing only ignored keywords do not constrain items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',anyOf:[{items:{type:'string'}},{items:true}]}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 90,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'anyOf with an items true branch does not constrain every branch',
    },
    {
      code: "module.exports={meta:{schema:[{type:'object',properties:{value:{type:'object',not:{type:'array'}}},additionalProperties:false}]},create(context){}};",
      errors: [
        {
          messageId: 'missingAdditionalProperties',
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
          messageId: 'missingItems',
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
      code: "const option={title:'description only'};module.exports={meta:{schema:[option]},create(context){}};",
      errors: [
        {
          messageId: 'ineffectiveRootSchema',
          type: 'ObjectExpression',
          column: 14,
          endColumn: 40,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'statically resolved no-op positional schemas are reported',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',$dynamicRef:'#value'}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 66,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignored dynamicRef does not constrain array items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',$recursiveRef:'#'}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItems',
          type: 'ObjectExpression',
          column: 31,
          endColumn: 63,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'ignored recursiveRef does not constrain array items',
    },
    {
      code: "module.exports={meta:{schema:[{type:'array',items:{pattern:'^x'}}]},create(context){}};",
      errors: [
        {
          messageId: 'missingItemType',
          type: 'ObjectExpression',
          column: 51,
          endColumn: 65,
          endLine: 1,
          line: 1,
        },
      ],
      name: 'arrayItemType reports a pattern-only item schema',
    },
  ],
});
