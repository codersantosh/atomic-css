/*
 * check:vars — enforces the variable contract:
 *   1. The three root declarations exist exactly and are the only framework
 *      root declarations (normal + max + template bundles).
 *   2. The container and gutter use sites carry the exact direct fallbacks.
 *   3. Gap fallback chains remain context-specific.
 *   4. The reference variable set reconciles with the bundle/demo reads.
 *   5. No alias-style `--at--*` tokens appear.
 */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');

const SHIPPED = {
    '--at-ctnr': '1140px',
    '--at-ctnr-min': '1100px',
    '--at-gtr': '15px',
};

const BUNDLES = ['css/atomic.css', 'css-max/atomic-max.css', 'css-template/atomic-template.css'];
const REF_SCSS = 'demo/colormode-globalstyle/scss/variable.scss';
const REF_CSS = 'demo/colormode-globalstyle/colormode-globalstyle.css';
const DEMO_CSS = ['demo/colormode-globalstyle/dynamic.css', REF_CSS];

const squash = (v) => v.replace(/%%IMPORTANT%%/g, '').replace(/\s+/g, '').trim();
const strip = (v) => v.replace(/%%IMPORTANT%%/g, '').trim();

function parse(file) {
    return postcss.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function rootDecls(file) {
    const out = new Map();
    parse(file).walkRules((rule) => {
        if (rule.selector.trim() !== ':root') return;
        rule.walkDecls((d) => out.set(d.prop, strip(d.value)));
    });
    return out;
}

function declarations(file) {
    const out = [];
    parse(file).walkDecls((d) => {
        out.push({ prop: d.prop, value: squash(d.value), selector: d.parent.selector });
    });
    return out;
}

function valuesFor(decls, selector, prop) {
    return decls.filter((d) => d.selector.trim() === selector && d.prop === prop).map((d) => d.value);
}

function reads(files) {
    const out = new Set();
    for (const f of files) {
        for (const d of declarations(f)) {
            const re = /var\(\s*--at-([\w-]+)/g;
            let m;
            while ((m = re.exec(d.value))) out.add(m[1]);
        }
    }
    return out;
}

function scssDeclared(file) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const out = new Set();
    const re = /#\{\$varPrefix\}-([\w-]+)\s*:/g;
    let m;
    while ((m = re.exec(text))) out.add(m[1]);
    return out;
}

const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
const fmt = (s) => [...s].sort().map((x) => `--at-${x}`).join(', ');
const diffLeft = (a, b) => [...a].filter((x) => !b.has(x));

let failed = false;
const fail = (msg) => {
    failed = true;
    console.error(`FAIL: ${msg}`);
};

// 1. Exact framework root declarations.
for (const f of BUNDLES) {
    const decls = rootDecls(f);
    const found = [...decls.keys()];
    const expected = Object.keys(SHIPPED);
    if (found.length !== expected.length || !sameSet(new Set(found), new Set(expected))) {
        fail(`${f}: :root must declare exactly [${expected.join(', ')}], found [${found.join(', ')}]`);
        continue;
    }
    for (const [prop, value] of Object.entries(SHIPPED)) {
        if (decls.get(prop) !== value) fail(`${f}: ${prop} is "${decls.get(prop)}", expected "${value}"`);
    }
    console.log(`ok  ${f}: :root = ${expected.join(', ')} (exact defaults)`);
}

// 2. Exact direct fallbacks at the container/gutter use sites.
for (const f of BUNDLES) {
    const decls = declarations(f);
    let ok = true;
    const ctnr = valuesFor(decls, '.at-ctnr', 'max-width');
    if (!ctnr.length || !ctnr.every((v) => v === 'var(--at-ctnr,1140px)')) {
        fail(`${f}: .at-ctnr max-width must be var(--at-ctnr, 1140px)`);
        ok = false;
    }
    const ctnrMin = valuesFor(decls, '.at-ctnr-min', 'max-width');
    if (!ctnrMin.length || !ctnrMin.every((v) => v === 'var(--at-ctnr-min,1100px)')) {
        fail(`${f}: .at-ctnr-min max-width must be var(--at-ctnr-min, 1100px)`);
        ok = false;
    }
    const allGtr = decls.reduce((n, d) => n + (d.value.match(/var\(--at-gtr\b/g) || []).length, 0);
    const fbGtr = decls.reduce((n, d) => n + (d.value.match(/var\(--at-gtr,\s*15px\)/g) || []).length, 0);
    if (!allGtr || allGtr !== fbGtr) {
        fail(`${f}: ${allGtr - fbGtr} of ${allGtr} var(--at-gtr) reads miss the 15px fallback`);
        ok = false;
    }
    if (ok) console.log(`ok  ${f}: container max-widths + all ${allGtr} gutter reads carry exact fallbacks`);
}

// 3. Context-specific gap fallback chains.
for (const f of BUNDLES) {
    const decls = declarations(f);
    const expect = [
        ['.at-gap', 'gap', 'var(--at-gap,initial)'],
        ['.at-row-gap', 'row-gap', 'var(--at-row-gap,var(--at-gap))'],
        ['.at-col-gap', 'column-gap', 'var(--at-col-gap,var(--at-gap))'],
        ['.at-vrt', 'gap', 'var(--at-vrt-gap,var(--at-gap,15px))'],
    ];
    let ok = true;
    for (const [sel, prop, value] of expect) {
        const vals = valuesFor(decls, sel, prop);
        if (!vals.length || !vals.every((v) => v === value)) {
            fail(`${f}: ${sel} ${prop} must be ${value}`);
            ok = false;
        }
    }
    const colOffset = decls.some((d) => d.value.includes('var(--at-col-gap,var(--at-gap,0px))'));
    if (!colOffset) {
        fail(`${f}: no grid column offset with var(--at-col-gap, var(--at-gap, 0px))`);
        ok = false;
    }
    if (ok) console.log(`ok  ${f}: contextual gap chains (0 for grid/.at-gap, 15px for .at-vrt)`);
}

// 4. Reference-set reconciliation.
{
    const declaredScss = scssDeclared(REF_SCSS);
    const declaredCss = new Set([...rootDecls(REF_CSS).keys()].map((p) => p.replace(/^--at-/, '')));
    if (!sameSet(declaredScss, declaredCss)) {
        fail(`${REF_SCSS} and ${REF_CSS} :root disagree (SCSS-only: ${fmt(diffLeft(declaredScss, declaredCss))}; CSS-only: ${fmt(diffLeft(declaredCss, declaredScss))})`);
    }
    const bundleReads = reads(['css/atomic.css', 'css-max/atomic-max.css']);
    const missing = new Set([...bundleReads].filter((x) => !declaredScss.has(x)));
    if (missing.size) fail(`bundle-read tokens missing from the reference set: ${fmt(missing)}`);
    const union = new Set([...bundleReads, ...reads(DEMO_CSS)]);
    const orphans = new Set([...declaredScss].filter((x) => !union.has(x)));
    if (orphans.size) fail(`orphan reference tokens (read by neither bundles nor demo): ${fmt(orphans)}`);
    if (!missing.size && !orphans.size) {
        console.log(`ok  reference set: ${declaredScss.size} tokens, ${bundleReads.size} bundle reads all declared, 0 orphans`);
    }
}

// 5. No alias-style --at--* tokens.
for (const f of BUNDLES) {
    const text = fs.readFileSync(path.join(root, f), 'utf8');
    const matches = [...new Set(text.match(/--at--[\w-]+/g) || [])];
    if (matches.length) fail(`${f}: alias-style token(s): ${matches.join(', ')}`);
    else console.log(`ok  ${f}: no alias-style --at--* tokens`);
}

if (failed) process.exit(1);
console.log('PASS: root globals exact, direct fallbacks present, gap chains contextual, reference set reconciled, no aliases.');
