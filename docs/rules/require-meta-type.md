# require rules to implement a meta.type property (require-meta-type)

ESLint v5.9.0 introduces a new `--fix-type` option for the command line interface. This option allows users to filter the type of fixes applied when using `--fix`.

Fixes in custom rules will not be applied when using `--fix-type` unless they include a meta.type field.

## Rule Details

This rule aims to require ESLint rules to have a valid `meta.type` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-type: error */
module.exports = {
    meta: {},
    create: function(context) {
        // ...
    }
};

module.exports = {
    meta: {type: 'invalid'},
    create: function(context) {
        // ...
    }
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-type: error */
module.exports = {
    meta: {type: 'problem'},
    create: function(context) {
        // ...
    }
};
```

## Further Reading

* [command-line-interface#--fix-type](https://eslint.org/docs/user-guide/command-line-interface#--fix-type)
* [working-with-rules#rule-basics](https://eslint.org/docs/developer-guide/working-with-rules#rule-basics)
* [ESLint v5.9.0 released](https://eslint.org/blog/2018/11/eslint-v5.9.0-released#the-fix-type-option)
