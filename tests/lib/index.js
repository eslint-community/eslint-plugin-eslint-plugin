'use strict';

const assert = require('chai').assert;
const plugin = require('../..');

const RULE_NAMES = Object.keys(plugin.rules);

describe('exported plugin', () => {
  describe('adds a meta.docs.url property to each rule', () => {
    RULE_NAMES.forEach(ruleName => {
      it(ruleName, () => {
        assert.match(
          plugin.rules[ruleName].meta.docs.url,
          /^https:\/\/github.com\/not-an-aardvark\/eslint-plugin-eslint-plugin\/tree\/v\d+\.\d+\.\d+\/docs\/rules\/[\w-]+\.md$/
        );
      });
    });
  });
});
