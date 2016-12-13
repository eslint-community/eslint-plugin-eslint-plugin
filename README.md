# eslint-plugin-eslint-plugin

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
        "eslint-plugin/new-report-api": "error"
    }
}
```

## Supported Rules

* None yet
