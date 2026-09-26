const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const minimal = path.join(root, 'css', 'atomic.css');
const max = path.join(root, 'css-max', 'atomic-max.css');
const template = path.join(root, 'css-template', 'atomic-template.css');

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

// Layer order is fixed by ARCHITECTURE.md § Compiled layer order, and it is now
// behaviourally load-bearing: `.at-stky` sets `position: sticky` while
// `.at-col-*` sets `position: relative`, and with no `!important` anywhere the
// sticky declaration must come later in source order to win. Nothing else
// checks ordering — the parity comparison above is set membership by design —
// so the /*…*/ section markers are verified here.
const LAYERS = ['/*Grid*/', '/*Utilities*/', '/*Properties*/'];
const orderProblems = [];

// The template is included because ARCHITECTURE.md promises it preserves the
// order so a consumer transform can anchor on the same markers it sees in the
// bundles. Only order is checked, not parity: the template is the marker-augmented
// form of the minimal bundle by construction, and check-important.js already
// confirms the bundles and the template agree on importance.
for (const file of [minimal, max, template]) {
    const source = fs.readFileSync(file, 'utf8');
    const positions = LAYERS.map((marker) => source.indexOf(marker));
    const rel = path.relative(root, file);
    if (positions.some((p) => p < 0)) {
        orderProblems.push(`${rel} is missing a layer marker (${LAYERS.join(' ')})`);
        continue;
    }
    if (!(positions[0] < positions[1] && positions[1] < positions[2])) {
        orderProblems.push(`${rel} layers are out of order: ${LAYERS.join(' -> ')}`);
    }
}

if (orderProblems.length) {
    orderProblems.forEach((p) => console.error(`  ${p}`));
    console.error('FAIL: compiled layer order must be Grid -> Utilities -> Properties (ARCHITECTURE.md).');
    process.exit(1);
}

console.log(
    `PASS: all ${minimalRules.size} atomic.css selectors are present in atomic-max.css `
    + `(${maxRules.size} total); layer order Grid -> Utilities -> Properties holds in `
    + 'atomic.css, atomic-max.css and the template.'
);
