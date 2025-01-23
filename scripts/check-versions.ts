import { readdirSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

import { versions } from '../src/index.js';

const { releases } = versions;

const dirs = readdirSync(resolvePath(import.meta.dirname, '../dist/versions'));
dirs.sort();
const sortedReleases = releases.slice().sort();

if (
  sortedReleases.join(':') !== dirs.filter((rel) => rel !== 'next').join(':')
) {
  console.info(`versions.json and releases directory are out of sync`);
  console.info('versions.json');
  console.table(releases);
  console.info('directories');
  console.table(dirs);
  process.exit(1);
}
