'use strict';

const { RuleTester } = require('@typescript-eslint/rule-tester');
const path = require('path');
const rule = require('../../../lib/rules/no-property-in-node');

RuleTester.afterAll = after;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: path.join(__dirname, 'fixtures'),
  },
});

ruleTester.run('no-property-in-node', rule, {
  invalid: [
    {
      code: `
        import { TSESTree } from '@typescript-eslint/utils';
        declare const node: TSESTree.Node;
        'a' in node;
      `,
      errors: [
        {
          column: 9,
          line: 4,
          endColumn: 20,
          endLine: 4,
          messageId: 'in',
        },
      ],
    },
    {
      code: `
        import { TSESTree } from '@typescript-eslint/utils';
        type Other = { key: true };
        declare const node: TSESTree.Node | Other;
        'a' in node;
      `,
      errors: [
        {
          column: 9,
          line: 5,
          endColumn: 20,
          endLine: 5,
          messageId: 'in',
        },
      ],
    },
    {
      code: `
        import * as ESTree from "estree";
        declare const node: ESTree.Node;
        'a' in node;
      `,
      errors: [
        {
          column: 9,
          line: 4,
          endColumn: 20,
          endLine: 4,
          messageId: 'in',
        },
      ],
    },
    {
      code: `
        import * as eslint from 'eslint';
        const listener: eslint.Rule.RuleListener = {
          ArrayExpression(node) {
            'a' in node;
          },
        };
      `,
      errors: [
        {
          column: 13,
          line: 5,
          endColumn: 24,
          endLine: 5,
          messageId: 'in',
        },
      ],
    },
  ],
  valid: [
    `'a' in window;`,
    `
      declare const node: Node;
      'a' in node;
    `,
    `
      type Node = { unrelated: true; };
      declare const node: Node;
      'a' in node;
    `,
    `
      interface Node {
        unrelated: true;
      };
      declare const node: Node;
      'a' in node;
    `,
    `
      declare const node: UnresolvedType;
      'a' in node;
    `,
  ],
});
