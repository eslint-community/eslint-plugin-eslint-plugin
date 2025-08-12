/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  // eslint-disable-next-line eslint-plugin/require-meta-schema
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce a test',
      recommended: false,
      url: 'https://test.org',
    },
    fixable: undefined, // or "code" or "whitespace"
    messages: {
      missingOutput: 'This is a test',
    },
  },

  create(context) {
    return {
      Program(ast) {
        const sourceCode = context.sourceCode;
        if (false) {
          context.report({
            node: ast,
            messageId: 'missingOutput',
          });
        }
      },
    };
  },
};

export default rule;
