const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const legend = JSON.parse(fs.readFileSync(path.join(root, 'short-names.json'), 'utf8'));

// Tokens that are structural, not part of the naming legend.
const IGNORE = new Set([
    'xs', 'sm', 'md', 'lg', 'xl', 'xxl',
]);

const template = path.join(root, 'css-template', 'atomic-template.css');

const files = [
    path.join(root, 'css', 'atomic.css'),
    path.join(root, 'css-max', 'atomic-max.css'),
    template,
    // The demo is the reference consumer: its compiled CSS is scanned too,
    // per ARCHITECTURE.md Part II ("class tokens are drawn from short-names.json").
    path.join(root, 'demo', 'colormode-globalstyle', 'colormode-globalstyle.css'),
    path.join(root, 'demo', 'colormode-globalstyle', 'dynamic.css'),
];

const used = new Set();
const violations = [];

for (const file of files) {
    const isTemplate = file === template;
    const css = fs.readFileSync(file, 'utf8');
    const rootNode = postcss.parse(css);
    rootNode.walkRules((rule) => {
        // Placeholders replace values only; a marker in a selector is a defect.
        if (isTemplate && rule.selector.includes('%%')) {
            violations.push(`${path.relative(root, file)}: placeholder in selector "${rule.selector}"`);
        }
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
        // Placeholders replace values only; a marker in a name is a defect.
        if (isTemplate) {
            if (decl.prop.includes('%%')) {
                violations.push(`${path.relative(root, file)}: placeholder in property "${decl.prop}"`);
            }
            const varNames = decl.value.match(/var\(\s*--[\w-]*/g) || [];
            varNames.forEach((v) => {
                if (v.includes('%%')) {
                    violations.push(`${path.relative(root, file)}: placeholder in var() name "${v}" (${decl.prop})`);
                }
            });
        }
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

if (violations.length) {
    console.error(`FAIL: ${violations.length} placeholder(s) found in names/selectors:`);
    violations.slice(0, 20).forEach((v) => console.error('  - ' + v));
    process.exit(1);
}

const missing = [...used].filter((t) => !(t in legend)).sort();
const unused = Object.keys(legend).filter((k) => !used.has(k)).sort();

if (missing.length) {
    console.error(`FAIL: ${missing.length} token(s) used in compiled CSS are missing from short-names.json:`);
    missing.forEach((t) => console.error('  - ' + t));
    process.exit(1);
}

console.log(`PASS: all ${used.size} tokens used in compiled CSS are documented in short-names.json.`);
console.log(`Note: ${unused.length} legend entries are not used by the scanned CSS (reference-only).`);
