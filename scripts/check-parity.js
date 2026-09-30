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

// Specificity invariant. The consumer base layer is written as plain element
// selectors (`h1`, `nav li`) rather than `:where(...)`. That is only sound while
// the framework itself stays out of the element layer: a shipped `h1 { … }` would
// outrank a consumer's `:where(h1)` on a theme that predates the change, and the
// base layer's guarantee stops holding.
//
// So the check is that the framework ships NO element rules, apart from the one
// documented exception (setup.md: `html { scroll-behavior }` cannot be beaten by
// a `:where()` base layer). ARCHITECTURE.md § Layers and ordering states the
// invariant; this is the check.
const SCROLL_BEHAVIOUR = 'html';
function specificity(selector) {
    const bare = selector.replace(/:where\([^)]*\)/g, '');
    const ids = (bare.match(/#[\w-]+/g) || []).length;
    const classes = (bare.match(/\.[\w-]+|\[[^\]]*\]|:{1,2}[a-z-]+(?:\([^)]*\))?/g) || []).length;
    return [ids, classes];
}

// Selectors that are deliberately not a plain class, and are documented in
// classes.md § Five selectors that are not a plain class. A sixth would reach
// past a consumer's own stylesheet in a way nothing had warned them about, so it
// has to fail the build rather than the docs.
const DOCUMENTED_COMPOUNDS = new Set([
    '.at-row *',
    '.at-no-gtr > .at-col',
    '.at-no-gtr > [class*=at-col-]',
    '.at-blk-shp > :not(.at-shp):not(.at-z-idx)',
    '.at-ls li::marker',
    '.at-svg-wrp svg',
]);

const specificityProblems = [];
for (const file of [minimal, max, template]) {
    const rel = path.relative(root, file);
    postcss.parse(fs.readFileSync(file, 'utf8')).walkRules((rule) => {
        for (const selector of rule.selector.split(',')) {
            const sel = selector.trim();
            const [ids, classes] = specificity(sel);
            if (classes >= 1) continue;                 // a class-bearing compound
            if (ids === 0 && sel === SCROLL_BEHAVIOUR) continue;
            // A descendant/child combinator after a class is still class-bearing
            // in effect; only flag selectors with no class at all, or the
            // documented ones with an unexpected shape.
            if (DOCUMENTED_COMPOUNDS.has(sel)) continue;
            const hasClassInChain = /\.[\w-]+/.test(sel);
            if (hasClassInChain) continue;             // e.g. `.at-svg text`
            specificityProblems.push(`${rel}: \`${sel}\` is an undocumented selector with no class`);
        }
    });
}

if (specificityProblems.length) {
    specificityProblems.forEach((p) => console.error(`  ${p}`));
    console.error(
        `FAIL: the framework must ship no element rules beyond \`${SCROLL_BEHAVIOUR}\`, or a `
        + 'consumer base layer written as bare element selectors loses its guarantee (ARCHITECTURE.md).'
    );
    process.exit(1);
}

console.log(
    `ok  no element rules in any bundle except \`${SCROLL_BEHAVIOUR}\` — every selector carries a `
    + 'class, so the consumer base layer needs no :where()'
);

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
