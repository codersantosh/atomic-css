const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const minimal = path.join(root, 'css', 'atomic.css');
const max = path.join(root, 'css-max', 'atomic-max.css');

function collectRules(file) {
    const css = fs.readFileSync(file, 'utf8');
    const rootNode = postcss.parse(css);
    const rules = new Set();
    rootNode.walkRules((rule) => {
        const context = [];
        let parent = rule.parent;
        while (parent && parent.type === 'atrule') {
            context.unshift(`@${parent.name} ${parent.params}`);
            parent = parent.parent;
        }
        const prefix = context.join(' ');
        // Selector lists may serialize in different orders; compare per-selector.
        rule.selector.split(',').forEach((selector) => {
            rules.add(prefix ? `${prefix} { ${selector.trim()} }` : selector.trim());
        });
    });
    return rules;
}

const minimalRules = collectRules(minimal);
const maxRules = collectRules(max);

const missing = [...minimalRules].filter((s) => !maxRules.has(s)).sort();

if (missing.length) {
    console.error(`FAIL: atomic.css is not a subset of atomic-max.css (${missing.length} selector(s) missing):`);
    missing.forEach((s) => console.error('  ' + s));
    process.exit(1);
}

console.log(`PASS: all ${minimalRules.size} atomic.css selectors are present in atomic-max.css (${maxRules.size} total).`);
