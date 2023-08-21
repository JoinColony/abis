import { readdirSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

const { releases } = require('../dist/versions.json');
const dirs = readdirSync(resolvePath(__dirname, '../dist/versions'));
dirs.sort();
releases.sort();

if (releases.join(':') !== dirs.filter((rel: string) => rel !== 'next').join(':')) {
    console.info(`versions.json and releases directory are out of sync`);
    console.info('versions.json');
    console.table(releases);
    console.info('directories');
    console.table(dirs);
    process.exit(1);
}
