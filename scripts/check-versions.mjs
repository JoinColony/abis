import { readdirSync, readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

const versions = readFileSync(resolvePath(import.meta.dirname, '../dist/versions.json'), 'utf8');

const { releases } = JSON.parse(versions);

const dirs = readdirSync(resolvePath(import.meta.dirname, '../dist/versions'));
dirs.sort();
releases.sort();

if (releases.join(':') !== dirs.filter((rel) => rel !== 'next').join(':')) {
    console.info(`versions.json and releases directory are out of sync`);
    console.info('versions.json');
    console.table(releases);
    console.info('directories');
    console.table(dirs);
    process.exit(1);
}
