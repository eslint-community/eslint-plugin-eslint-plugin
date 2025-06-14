import { assert } from 'chai';
import plugin from '../../lib/index.js';

const RULE_NAMES = Object.keys(plugin.rules);

describe('exported plugin', () => {
  describe('has a meta.docs.url property on each rule', () => {
    RULE_NAMES.forEach((ruleName) => {
      it(ruleName, () => {
        assert.match(
          plugin.rules[ruleName].meta.docs.url,
          /^https:\/\/github.com\/eslint-community\/eslint-plugin-eslint-plugin\/tree\/HEAD\/docs\/rules\/[\w-]+\.md$/,
        );
      });
    });
  });
});
