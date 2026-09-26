/**
 * check-important.js - the shipped bundles must carry no `!important`.
 *
 * ARCHITECTURE.md § Shared Rules: shipped CSS is importance-free. Utilities are
 * ordinary (0,1,0) declarations, so a consumer's own CSS can override them by
 * specificity or order, which is what "Global First, Local Second" requires. A
 * consumer who does need importance builds it from `css-template`, where the
 * `%%IMPORTANT%%` marker is the only sanctioned mechanism.
 *
 * Before this existed, nothing covered the property: check-parity compares
 * selector sets, check-names covers the token legend, check-vars covers the
 * variable contract, and stylelint (which now also enables
 * declaration-no-important) only sees source, not the compiled output. This
 * script is the check on the artifact that actually ships.
 *
 * The demo is deliberately NOT scanned. It is the reference consumer, and
 * ARCHITECTURE.md Part II § Overrides sanctions a small number of `!important`
 * uses for overriding external components such as WordPress.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');

// The 8 shipped bundle files, plus the template. The template is included even
// though it is a build input rather than a link target: it must also be free of
// literal `!important`, since the marker is how importance is expressed there.
const FILES = [
    'css/atomic.css',
    'css/atomic.min.css',
    'css/atomic-rtl.css',
    'css/atomic.min-rtl.css',
    'css-max/atomic-max.css',
    'css-max/atomic-max.min.css',
    'css-max/atomic-max-rtl.css',
    'css-max/atomic-max.min-rtl.css',
    'css-template/atomic-template.css',
];

const violations = [];

for (const file of FILES) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) {
        violations.push(`${file} is missing`);
        continue;
    }
    const source = fs.readFileSync(abs, 'utf8');
    let tree;
    try {
        tree = postcss.parse(source, { from: abs });
    } catch (err) {
        violations.push(`${file} could not be parsed: ${err.message}`);
        continue;
    }
    tree.walkDecls((decl) => {
        if (decl.important) {
            violations.push(`${file}:${decl.source.start.line} ${decl.prop} carries !important`);
        }
    });
}

if (violations.length) {
    violations.forEach((v) => console.error(`  ${v}`));
    console.error(
        `FAIL: ${violations.length} !important declaration(s) in the shipped bundles. `
        + 'Shipped CSS is importance-free; build importance from css-template instead.'
    );
    process.exit(1);
}

console.log(
    `PASS: no !important in ${FILES.length} shipped bundle files `
    + '(8 bundles + template); importance is available only via the template marker.'
);
