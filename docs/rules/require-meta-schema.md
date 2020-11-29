# require rules to implement a meta.schema property (require-meta-schema)

Defining a schema for each rule allows eslint to validate that configuration options are passed correctly. Even when there are no options for a rule, a schema should still be defined (as an empty array) so that eslint can validate that no data is passed to the rule.

## Rule Details

This rule requires ESLint rules to have a valid `meta.schema` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-schema: error */
module.exports = {
    meta: {},
    create: function(context) { /* ... */}
};

module.exports = {
    meta: { schema: null },
    create: function(context) { /* ... */}
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-schema: error */
module.exports = {
    meta: { schema: [] }, // ensures no options are passed to the rule
    create: function(context) { /* ... */}
};

module.exports = {
    meta: {
        schema: [
            {
                type: 'object',
                properties: {
                    exceptRange: {
                        type: 'boolean'
                    }
                },
                additionalProperties: false
            }
        ]
    },
    create: function(context) { /* ... */}
};
```

## Further Reading

* [working-with-rules#options-schemas](https://eslint.org/docs/developer-guide/working-with-rules#options-schemas)
