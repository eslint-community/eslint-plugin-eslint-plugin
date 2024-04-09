# Require rules to implement a `meta.docs.url` property (`eslint-plugin/require-meta-docs-url`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

A rule can store the URL to its documentation page in `meta.docs.url`. This enables integration tools / IDEs / editors to conveniently provide the link to developers so that they can better understand the rule.

## Rule Details

This rule aims to require ESLint rules to have a `meta.docs.url` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-url: "error" */

module.exports = {
  meta: {},
  create(context) {},
};
```

```js
/* eslint eslint-plugin/require-meta-docs-url: "error" */

module.exports = {
  meta: {
    docs: {
      url: undefined,
    },
  },
  create(context) {},
};
```

```js
/* eslint eslint-plugin/require-meta-docs-url: ["error", {"pattern": "path/to/{{name}}.md"}] */

module.exports = {
  meta: {
    docs: {
      url: 'wrong URL',
    },
  },
  create(context) {},
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-url: "error" */

module.exports = {
  meta: {
    docs: {
      url: 'a URL',
    },
  },
  create(context) {},
};
```

```js
/* eslint eslint-plugin/require-meta-docs-url: ["error", {"pattern": "path/to/{{name}}.md"}] */

module.exports = {
  meta: {
    docs: {
      url: 'path/to/rule-name.md',
    },
  },
  create(context) {},
};
```

## Options

<!-- begin auto-generated rule options list -->

| Name      | Description                                                                                                                                                                    | Type   |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| `pattern` | A pattern to enforce rule's document URL. It replaces `{{name}}` placeholder by each rule name. The rule name is the basename of each rule file. Omitting this allows any URL. | String |

<!-- end auto-generated rule options list -->

```json
{
  "eslint-plugin/require-meta-docs-url": [
    "error",
    {
      "pattern": "https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/master/docs/rules/{{name}}.md"
    }
  ]
}
```

If you set the `pattern` option, this rule adds `meta.docs.url` property automatically when you execute `eslint --fix` command.

## Version specific URL

If you want to enforce version-specific URLs, it's feasible easily with `.eslintrc.js` and `npm version <type>` script.
For example:

**.eslintrc.js**:

```js
// const version = require("./package.json").version;

module.exports = {
  plugins: ['eslint-plugin'],
  rules: {
    'eslint-plugin/require-meta-docs-url': [
      'error',
      {
        pattern: `path/to/v${version}/docs/rules/{{name}}.md`,
      },
    ],
  },
};
```

**package.json**:

```json
{
  "version": "1.0.0",
  "scripts": {
    "pretest": "eslint .",
    "test": "... leaving out ...",
    "preversion": "npm test",
    "version": "eslint . --fix && git add ."
  }
}
```

Then `npm version <type>` command will update every rule to the new version's URL.

> npm runs `preversion` script on the current version, runs `version` script on the new version, and commits and makes a tag.
>
> Further reading: <https://docs.npmjs.com/cli/version>

## When Not To Use It

If you do not plan to provide rule's documentation in website, you can turn off this rule.
