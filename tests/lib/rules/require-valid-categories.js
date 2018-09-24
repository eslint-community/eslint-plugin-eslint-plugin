'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-valid-categories');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });

ruleTester.run('require-valid-categories', rule, {
  valid: [
    {
      code: `
module.exports = {
  meta: {
    docs: {
      category: "Possible Errors"
    }
  },
  create(context) {
    return {}
  }
}
`,
      options: ['Possible Errors'],
    },
  ],
  invalid: [
    {
      code: `
module.exports = {
  meta: {
    docs: {
      category: "Stylistic Issues"
    }
  },
  create(context) {
    return {}
  }
}
`,
      options: ['Possible Errors'],
      errors: [
        { message: 'Not a valid category.' },
      ],
    },
  ],
});
