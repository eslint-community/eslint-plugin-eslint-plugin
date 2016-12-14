/**
 * @fileoverview disallow use of the deprecated context.report() API
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-deprecated-report-api');
const RuleTester = require('eslint').RuleTester;
const ERROR = [{ message: 'Use the new-style context.report() API.', type: 'CallExpression' }];

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
      output: `
        module.exports = {
          create(context) {
            context.report(theNode, theMessage, theData, theFix);
          }
        };
      `,
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
      code: `
        module.exports = {
          create(notContext) {
            notContext.report(theNode, theMessage, theData, theFix);
          }
        };
      `,
      output: `
        module.exports = {
          create(notContext) {
            notContext.report(theNode, theMessage, theData, theFix);
          }
        };
      `,
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
      code: `
        module.exports = {
          create(context) {
            context.report(theNode, theLocation, theMessage, theData, theFix, somethingElse, somethingElse, somethingElse);
          }
        };
      `,
      output: `
        module.exports = {
          create(context) {
            context.report(theNode, theLocation, theMessage, theData, theFix, somethingElse, somethingElse, somethingElse);
          }
        };
      `,
      errors: [ERROR],
    },
  ],
});
