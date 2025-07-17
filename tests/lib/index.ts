import { describe, expect, it } from 'vitest';

import plugin from '../../lib/index.js';

describe('exported plugin', () => {
  describe('has a meta.docs.url property on each rule', () => {
    it.each(Object.entries(plugin.rules))('$0', (_, rule) =>
      expect(rule.meta?.docs?.url).toMatch(
        /^https:\/\/github.com\/eslint-community\/eslint-plugin-eslint-plugin\/tree\/HEAD\/docs\/rules\/[\w-]+\.md$/,
      ),
    );
  });
});
