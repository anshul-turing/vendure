// @ts-check
const fs = require('fs');
const path = require('path');
// This script finds all app sources and then generates a "public-api.ts" file exporting their
// contents. This is then used as the public API entrypoint for the Angular CLI's library
// builder process.

console.log('Generating public apis...');
const SOURCES_DIR = path.join(__dirname, '/../src/lib');
const APP_SOURCE_FILE_PATTERN = /\.tsx?$/;
const EXCLUDED_PATTERNS = [/(public_api|spec|mock)\.ts$/];

const MODULES = [
    'catalog',
    'core',
    'customer',
    'dashboard',
    'login',
    'marketing',
    'order',
    'settings',
    'system',
    'react',
];

for (const moduleDir of MODULES) {
    const modulePath = path.join(SOURCES_DIR, moduleDir, 'src');

    const files = [];
    forMatchingFiles(modulePath, APP_SOURCE_FILE_PATTERN, filename => {
        const excluded = EXCLUDED_PATTERNS.reduce((result, re) => result || re.test(filename), false);
        if (!excluded) {
            const relativeFilename =
                '.' +
                filename
                    .replace(modulePath, '')
                    .replace(/\\/g, '/')
                    .replace(/\.tsx?$/, '');
            files.push(relativeFilename);
        }
    });
    const header = `// This file was generated by the build-public-api.ts script\n`;
    const fileContents = header + files.map(f => `export * from '${f}';`).join('\n') + '\n';
    const publicApiFile = path.join(modulePath, 'public_api.ts');
    fs.writeFileSync(publicApiFile, fileContents, 'utf8');
    console.log(`Created ${publicApiFile}`);
}

/**
 *
 * @param startPath {string}
 * @param filter {RegExp}
 * @param callback {(filename: string) => void}
 */
function forMatchingFiles(startPath, filter, callback) {
    if (!fs.existsSync(startPath)) {
        console.log('Starting path does not exist ', startPath);
        return;
    }

    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            forMatchingFiles(filename, filter, callback); // recurse
        } else if (filter.test(filename)) {
            callback(filename);
        }
    }
}
