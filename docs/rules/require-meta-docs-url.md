# require rules to implement a meta.docs.url property (require-meta-docs-url)

`meta.docs.url` property is the official location to store a URL to their documentation in the rule metadata.
Some integration tools will show the URL to users to understand rules.

## Rule Details

This rule aims to require ESLint rules to have a `meta.docs.url` property.

This rule has an option.

```json
{
  "eslint-plugin/require-meta-docs-url": ["error", {
    "pattern": "https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/{{name}}.md"
  }]
}
```

- `pattern` (`string`) ... A pattern to enforce rule's document URL. It replaces `{{name}}` placeholder by each rule name. The rule name is the basename of each rule file. Default is undefined.

If you set the `pattern` option, this rule adds `meta.docs.url` property automatically when you executed `eslint --fix` command.

The following patterns are considered warnings:

```js

/* eslint eslint-plugin/require-meta-docs-url: "error" */

module.exports = {
  meta: {},
  create(context) {
  }
};

```

```js

/* eslint eslint-plugin/require-meta-docs-url: "error" */

module.exports = {
  meta: {
    docs: {
      url: undefined
    }
  },
  create(context) {
  }
};

```

```js

/* eslint eslint-plugin/require-meta-docs-url: ["error", {"pattern": "path/to/{{name}}.md"}] */

module.exports = {
  meta: {
    docs: {
      url: "wrong URL"
    }
  },
  create(context) {
  }
};

```

The following patterns are not warnings:

```js

/* eslint eslint-plugin/require-meta-docs-url: "error" */

module.exports = {
  meta: {
    docs: {
      url: "a URL"
    }
  },
  create(context) {
  }
};

```

```js

/* eslint eslint-plugin/require-meta-docs-url: ["error", {"pattern": "path/to/{{name}}.md"}] */

module.exports = {
  meta: {
    docs: {
      url: "path/to/rule-name.md"
    }
  },
  create(context) {
  }
};

```

## When Not To Use It

If you do not plan to provide rule's documentation in website, you can turn off this rule.
