const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const legend = JSON.parse(fs.readFileSync(path.join(root, 'short-names.json'), 'utf8'));

// Tokens that are structural, not part of the naming legend.
const IGNORE = new Set([
    'xs', 'sm', 'md', 'lg', 'xl', 'xxl',
]);

const files = [
    path.join(root, 'css', 'atomic.css'),
    path.join(root, 'css-max', 'atomic-max.css'),
];

const used = new Set();

for (const file of files) {
    const css = fs.readFileSync(file, 'utf8');
    const rootNode = postcss.parse(css);
    rootNode.walkRules((rule) => {
        const matches = rule.selector.match(/\.at(?:-col|-cust)?-?([\w-]+)/g) || [];
        matches.forEach((m) => {
            const name = m.replace(/^\.at-?/, '');
            name.split('-').forEach((token) => {
                if (token && !IGNORE.has(token) && !/^\d+$/.test(token)) {
                    used.add(token);
                }
            });
        });
    });
    rootNode.walkDecls((decl) => {
        if (decl.prop.startsWith('--at-')) {
            decl.prop.slice(5).split('-').forEach((token) => {
                if (token && !IGNORE.has(token)) {
                    used.add(token);
                }
            });
        }
        const vars = decl.value.match(/var\(--at-([\w-]+)/g) || [];
        vars.forEach((v) => {
            v.replace(/^var\(--at-/, '').split('-').forEach((token) => {
                if (token && !IGNORE.has(token)) {
                    used.add(token);
                }
            });
        });
    });
}

const missing = [...used].filter((t) => !(t in legend)).sort();
const unused = Object.keys(legend).filter((k) => !used.has(k)).sort();

if (missing.length) {
    console.error(`FAIL: ${missing.length} token(s) used in compiled CSS are missing from short-names.json:`);
    missing.forEach((t) => console.error('  - ' + t));
    process.exit(1);
}

console.log(`PASS: all ${used.size} tokens used in compiled CSS are documented in short-names.json.`);
console.log(`Note: ${unused.length} legend entries are not used by the current bundles (reference-only).`);
