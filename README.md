# eslint-plugin-eslint-plugin [![Build Status](https://travis-ci.org/not-an-aardvark/eslint-plugin-eslint-plugin.svg?branch=master)](https://travis-ci.org/not-an-aardvark/eslint-plugin-eslint-plugin)

An ESLint plugin for linting ESLint plugins

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-eslint-plugin`:

```
$ npm install eslint-plugin-eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-eslint-plugin` globally.

## Usage

Add `eslint-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "eslint-plugin"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "eslint-plugin/no-deprecated-report-api": "error"
    }
}
```

## Supported Rules

✔️ indicates that a rule is recommended for all users.
🛠 indicates that a rule is fixable.

Name | ✔️ | 🛠 | Description
----- | ----- | ----- | -----
[consistent-output](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/consistent-output.md) | | | Enforces consistent use of output assertions in rule tests
[fixer-return](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/fixer-return.md) | ✔️ | | Enforces always return from a fixer function
[no-deprecated-report-api](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-deprecated-report-api.md) | ✔️ | 🛠 | Prohibits the deprecated `context.report(node, message)` API
[no-identical-tests](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-identical-tests.md) | ✔️  | 🛠 | Disallows identical tests
[no-missing-placeholders](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-missing-placeholders.md) | ✔️ | | Disallows missing placeholders in rule report messages
[no-unused-placeholders](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-unused-placeholders.md) | ✔️ | | Disallows unused placeholders in rule report messages
[no-useless-token-range](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-useless-token-range.md) | ✔️ | 🛠 | Disallows unnecessary calls to sourceCode.getFirstToken and sourceCode.getLastToken
[prefer-output-null](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/prefer-output-null.md) | | | Disallows invalid RuleTester test cases with the output the same as the code.
[prefer-placeholders](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/prefer-placeholders.md) | | | Disallows template literals as report messages
[report-message-format](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/report-message-format.md) | | | Enforces a consistent format for report messages
[require-meta-fixable](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/require-meta-fixable.md) | ✔️ | | Requires a `meta.fixable` property for fixable rules
[test-case-property-ordering](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/test-case-property-ordering.md) | | | Requires the properties of a test case to be placed in a consistent order.
[test-case-shorthand-strings](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/test-case-shorthand-strings.md) | | 🛠 | Enforces consistent usage of shorthand strings for test cases with no options

## Supported Presets

Presets are enabled by adding a line to the `extends` list in your config file. For example, to enable the `recommended` preset, use:

```json
{
    "extends": [
        "plugin:eslint-plugin/recommended"
    ]
}
```

* `recommended` enables all recommended rules from this plugin.
* `rules-recommended` enables all recommended rules that are aimed at linting ESLint rule files.
* `tests-recommended` enables all recommended rules that are aimed at linting ESLint test files.

* `all` enables all rules in this plugin.
* `rules` enables all rules that are aimed at linting ESLint rule files.
* `tests` enables all rules that are aimed at linting ESLint test files.

The list of recommended rules will only change in a major release of this plugin. However, new non-recommended rules might be added in a minor release of this plugin. Therefore, the using the `all`, `rules`, and `tests` presets is **not recommended for production use**, because the addition of new rules in a minor release could break your build.
