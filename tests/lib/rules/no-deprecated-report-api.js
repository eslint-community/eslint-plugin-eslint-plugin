/**
 * @fileoverview Disallow the version of `context.report()` with multiple arguments
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-deprecated-report-api');
const RuleTester = require('eslint').RuleTester;
const ERROR = { message: 'Use the new-style context.report() API.', type: 'Identifier' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('no-deprecated-report-api', rule, {

  valid: [
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: "Foo."
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          foo.report(bar, baz);
        }
      };
    `,
    `
      module.exports = function(context) {
        context.report({node, message: "Foo"});
      };
    `,
    `
      module.exports = (context) => {
        context.report({node, message: "Foo"});
      };
    `,
    `
      module.exports = {
        create(notContext) {
          notContext.report({node, message: "foo"});
        }
      };
    `,
    `
      module.exports = {
        create([context]) {
          context.report(node, message);
        }
      };
    `,
    // With object as variable.
    `
      const OBJ = {node, message};
      module.exports = {
        create(context) {
          context.report(OBJ);
        }
      };
    `,
    // With object as variable but cannot determine its value statically.
    `
      const OBJ = getObj();
      module.exports = {
        create(context) {
          context.report(OBJ);
        }
      };
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, "This {{thing}} is bad", { thing: foo ? "node" : "token" }, fix);
          }
        };
      `,
      output: `
        module.exports = {
          create(context) {
            context.report({node: node, message: "This {{thing}} is bad", data: { thing: foo ? "node" : "token" }, fix: fix});
          }
        };
      `,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, { line: foo, column: bar }, theMessage, theData, theFix);
          }
        };
      `,
      output: `
        module.exports = {
          create(context) {
            context.report({node: theNode, loc: { line: foo, column: bar }, message: theMessage, data: theData, fix: theFix});
          }
        };
      `,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, "theMessage", theData, theFix);
          }
        };
      `,
      output: `
        module.exports = {
          create(context) {
            context.report({node: theNode, message: "theMessage", data: theData, fix: theFix});
          }
        };
      `,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, theMessage, theData, theFix);
          }
        };
      `,
      output: null,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, 'foo', theData);
          }
        };
      `,
      output: `
        module.exports = {
          create(context) {
            context.report({node: theNode, message: 'foo', data: theData});
          }
        };
      `,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, 'foo');
          }
        };
      `,
      output: `
        module.exports = {
          create(context) {
            context.report({node: theNode, message: 'foo'});
          }
        };
      `,
      errors: [ERROR],
    },
    {
      // With message string in variable.
      code: `
        const MESSAGE = 'foo';
        module.exports = {
          create(context) {
            context.report(theNode, MESSAGE);
          }
        };
      `,
      output: `
        const MESSAGE = 'foo';
        module.exports = {
          create(context) {
            context.report({node: theNode, message: MESSAGE});
          }
        };
      `,
      errors: [ERROR],
    },
    {
      // With message in variable but no autofix since we can't statically determine its type.
      code: `
        const MESSAGE = getMessage();
        module.exports = {
          create(context) {
            context.report(theNode, MESSAGE);
          }
        };
      `,
      output: null,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(notContext) {
            notContext.report(theNode, theMessage, theData, theFix);
          }
        };
      `,
      output: null,
      errors: [ERROR],
    },
    {
      code: `
        module.exports.create = context => {
          context.report(theNode, \`blah\`, theData, theFix);
        };
      `,
      output: `
        module.exports.create = context => {
          context.report({node: theNode, message: \`blah\`, data: theData, fix: theFix});
        };
      `,
      errors: [ERROR],
    },
    {
      code: `
        module.exports.create = context => {
          context.report(theNode, 5, foo, bar);
        };
      `,
      output: `
        module.exports.create = context => {
          context.report({node: theNode, loc: 5, message: foo, data: bar});
        };
      `,
      errors: [ERROR],
    },
    {
      // Location in variable as number.
      code: `
        const LOC = 5;
        module.exports.create = context => {
          context.report(theNode, LOC, foo, bar);
        };
      `,
      output: `
        const LOC = 5;
        module.exports.create = context => {
          context.report({node: theNode, loc: LOC, message: foo, data: bar});
        };
      `,
      errors: [ERROR],
    },
    {
      // Location in variable as object.
      code: `
        const LOC = { line: 1, column: 2 };
        module.exports.create = context => {
          context.report(theNode, LOC, foo, bar);
        };
      `,
      output: `
        const LOC = { line: 1, column: 2 };
        module.exports.create = context => {
          context.report({node: theNode, loc: LOC, message: foo, data: bar});
        };
      `,
      errors: [ERROR],
    },
    {
      // Location in variable but no autofix since we can't statically determine its type.
      code: `
        const LOC = getLoc();
        module.exports.create = context => {
          context.report(theNode, LOC, foo, bar);
        };
      `,
      output: null,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, theLocation, theMessage, theData, theFix, somethingElse, somethingElse, somethingElse);
          }
        };
      `,
      output: null,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(...error);
          }
        };
      `,
      output: null,
      errors: [ERROR],
    },
  ],
});
