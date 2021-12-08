'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;

describe('table in README.md', () => {
  it('is up-to-date', () => {
    const actualReadme = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'README.md'),
      'utf8'
    );
    const expectedReadme = require('../../build/generate-readme-table');

    assert(
      actualReadme === expectedReadme,
      'The table in README.md is out of date. Please use `npm run generate-readme-table` to update it.'
    );
  });
});
