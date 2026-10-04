#!/usr/bin/env node
/**
 * generate-docs.js - agent-facing class/variable reference.
 *
 * Output: skills/atomic-css/generated/CLASS-REFERENCE.json
 * Truth: css/atomic.css, css-max/atomic-max.css, css-template/atomic-template.css
 *        and short-names.json. Nothing in the output is hand-maintained.
 *
 * Run:   node scripts/generate-docs.js
 * Check: node scripts/generate-docs.js --check   (exit 1 if committed output is stale)
 *
 * Parser is postcss, matching scripts/check-names.js and scripts/check-parity.js.
 * Every name and every number in the output is derived from the compiled CSS,
 * so a class added to scss/ cannot be missing from the reference.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');
const VERSION = require(path.join(root, 'package.json')).version;

const SOURCES = {
    minimal: 'css/atomic.css',
    max: 'css-max/atomic-max.css',
    template: 'css-template/atomic-template.css',
    legend: 'short-names.json',
};

// One output, the JSON. It shipped beside a generated Markdown dump, which was a
// second rendering of the same data in the same folder: every class row, variable
// row and legend entry appeared in both, and a reader could not tell which was
// current. `references/classes.md` is the readable layer over this file.
const OUT = 'skills/atomic-css/generated/CLASS-REFERENCE.json';

// Hand-written prose the generated reference must agree with. The agent-facing
// contract is the skill (skills/atomic-css/), which is scanned separately below
// — it names classes and variables too, so it gets the same existence check.
const PROSE = ['README.md'];

// Hand-written agent-facing files, read from disk. They are shipped, so their
// references have to resolve in the tarball too, and every `.at-*` / `--at-*`
// name they mention must exist in a bundle.
const AGENT_DOCS = ['skills/atomic-css/SKILL.md',
    'skills/atomic-css/references/classes.md',
    'skills/atomic-css/references/setup.md',
    'skills/atomic-css/references/patterns.md',
    'skills/atomic-css/references/production.md',
    // The folder that holds the generated reference states the boundary in prose,
    // so it is held to the same rules as the guidance it sits beside.
    'skills/atomic-css/generated/README.md'];

// Compiled consumer stylesheets the skill teaches from. Not markdown, so only the
// CSS-shape rules apply — but the scale-step rule does, because the reference
// consumer is where a hard-coded measurement would actually land. The *compiled*
// files are scanned rather than the SCSS, because the SCSS builds these names by
// nesting (`&-spc { &-lg { … } }`), so a source scan cannot see the class at all.
const CONSUMER_STYLESHEETS = ['demo/colormode-globalstyle/dynamic.css'];

// Every SCSS source, framework and demo: the prefix must be literal everywhere.
function scssSources() {
    const out = [];
    for (const dir of ['scss', 'demo']) {
        const walk = (d) => {
            let entries;
            try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
            for (const e of entries) {
                const abs = path.join(d, e.name);
                if (e.isDirectory()) walk(abs);
                else if (e.name.endsWith('.scss')) out.push(abs);
            }
        };
        if (fs.existsSync(path.join(root, dir))) walk(path.join(root, dir));
    }
    return out.sort();
}

// Names that legitimately appear in prose but are in no bundle. Each is a
// reviewed exception, not a gap: add a line here when the framework docs a
// consumer-owned name.
const CONSUMER_OWNED = new Set([
    // ARCHITECTURE.md § Identity classes — the variant registry the framework
    // documents but does not implement.
    'at-btn', 'at-btn-primary', 'at-btn-secondary', 'at-btn-success', 'at-btn-danger',
    'at-btn-warning', 'at-btn-info', 'at-btn-light', 'at-btn-dark', 'at-btn-lnk',
    'at-btn-outln', 'at-btn-outln-primary', 'at-btn-icon',
    // Consumer-side marker class: defined by whoever uses it, never shipped.
    'at-txt',
    // Placeholder identity classes in the agent skill's Do/Don't table: shown
    // as a name the consumer *owns*, not as framework names.
    'at-card',
    // Consumer spacing scale (patterns.md § Five decisions: "a number in a class
    // name is a step on a scale you own"). Steps, not measurements: the value
    // lives in a digit-free token, --at-spc-sm / --at-spc-lg.
    'at-spc-sm', 'at-spc-lg',
]);

// Names the agent skill deliberately shows as WRONG — fabricated examples that
// teach the reader what not to write, plus one real typo it points out. None is
// a claim that the class exists, so the existence check must not fire on them.
const DEMONSTRABLY_FAKE = new Set([
    // "Don't invent these" — a name no bundle ships, by design.
    'at-mt-4', 'at-flex-md-row', 'at-xs-col-6',
    // The typo the skill uses to illustrate a silent WARN: the real name is
    // --at-z-idx.
    'at-z-id',
    // The zero aliases the skill explicitly tells consumers NOT to write
    // (`.at-p-0` is a second name for a value `.at-p` already computes).
    'at-p-0', 'at-m-0',
]);

// Names that appear only in the removal note (README § Breaking changes) and in
// the marker-class explanation. They must NOT reappear in a bundle.
const REMOVED_NAMES = new Set(['at-img', 'at-vid', 'at-aud', 'at-map']);

// Consumer-owned channels the skill documents but no bundle reads: the spacing
// scale behind `.at-spc-*`. Same rationale as CONSUMER_OWNED — a name the
// consumer defines, not one the framework ships.
const CONSUMER_VARS = new Set([
    '--at-spc-sm', '--at-spc-lg',
    // patterns.md § Semantic HTML first: the skip link's private token. It is a
    // second-writer channel (the :focus arm re-points it), so the example needs
    // a token name that no bundle reads — the same rationale as the spacing
    // scale above, and no legend entry, because no bundle ships it.
    '--at-skip-inset',
]);

const ALLOWED_IN_PROSE = new Set([...CONSUMER_OWNED, ...REMOVED_NAMES, ...DEMONSTRABLY_FAKE]);

const INFIXES = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

// ARCHITECTURE.md § Structural classes: a fixed set, "nothing else may be
// added without a rule change". Copied from that list verbatim.
const STRUCTURAL = new Set([
    'at-dropcap', 'at-svg-wrp',
    'at-ovl', 'at-ovl-cl', 'at-ovl-grd',
    'at-blk-shp', 'at-shp', 'at-shp-t', 'at-shp-b',
    'at-bg-vid', 'at-vid-bg',
    'at-has-abs-wrp', 'at-abs-el',
    'at-stky',
    'at-vrt', 'at-vrt-hdr', 'at-vrt-conts',
]);

// Legacy flexbox artifacts. Autoprefixer emits these for the 2009 spec ("last
// 5 versions" still covers some legacy WebKit); they are never written
// unprefixed, so they carry no information for a consumer. Suppressed here
// along with the prefixed twin of any property that also appears unprefixed.
const LEGACY_PREFIXED = new Set([
    'box-align', 'box-direction', 'box-flex', 'box-ordinal-group', 'box-orient', 'box-pack',
    'flex-align', 'flex-item-align', 'flex-line-pack', 'flex-negative', 'flex-order',
    'flex-pack', 'flex-positive', 'flex-preferred-size',
]);

const DISPLAY_VALUES = 'd-non|inl|inl-blk|blk|tbl|tbl-row|tbl-cel|flx|inl-flx';

// Ordered, exhaustive. No catch-all: a class that matches nothing is a failure,
// so the partition cannot silently rot as classes are added.
const KIND_RULES = [
    ['structural', new RegExp(`^(?:${[...STRUCTURAL].join('|')})$`)],
    ['display', new RegExp(`^at-(?:(?:${INFIXES.join('|')})-)?(?:${DISPLAY_VALUES})$`)],
    ['flex', /^at-(?:flx|jfy|al)-/],
    ['grid', /^at-(?:ctnr|ctnr-min|ctnr-fld|row|row-gap|col-gap|gap|no-gtr|col|col-)/],
    ['order-offset-print', /^at-(?:ord|ofst|prt)-/],
    ['property', /^at-(?!col|ctnr|row|gap|flx|jfy|al)[a-z]/],
];

const KIND_LABELS = {
    grid: 'Grid',
    flex: 'Flex utilities',
    display: 'Display utilities',
    'order-offset-print': 'Order / offset / print',
    structural: 'Structural classes',
    property: 'Property utilities',
};

const KIND_ORDER = ['grid', 'flex', 'display', 'order-offset-print', 'structural', 'property'];

const KIND_NOTES = {
    structural:
        'The framework owns this geometry so compositions work with no consumer stylesheet. '
        + 'A structural class sets plain CSS for its own geometry and reads a variable only for '
        + 'values a consumer is expected to configure.',
    'order-offset-print':
        'Present only in `css-max/atomic-max.css`; linking the minimal bundle makes them inert. '
        + 'They apply inside `@media print` like any other rule, so an author print stylesheet of '
        + 'equal specificity that comes later will override them.',
    flex:
        'These are plain declarations, so consumer base rules can override them by specificity or '
        + 'order. A consumer that needs them to win should build from `css-template`.',
    display:
        'These are plain declarations, so consumer base rules can override them by specificity or '
        + 'order. `.at-tbl` is listed here for its `display`, but it also applies `caption-side` and '
        + '`table-layout` from the Properties layer.',
    grid:
        'Grid geometry. The row and column classes compute their own `flex`; only the container '
        + 'widths and gaps read a variable from you.',
    property:
        'One class applies a property, reading the matching variable. `initial` is the fallback, '
        + 'so the class is inert until you set the variable.',
};

/** Split a var() argument list at its first top-level comma (nesting-aware). */
function splitVarArgs(inner) {
    let depth = 0;
    for (let i = 0; i < inner.length; i += 1) {
        const c = inner[i];
        if (c === '(') depth += 1;
        else if (c === ')') depth -= 1;
        else if (c === ',' && depth === 0) return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
    return [inner.trim(), null];
}

/** Every var(--at-*) in a value, with its fallback. Handles nested var()s. */
function readAtVars(value) {
    const out = [];
    const re = /var\(\s*(--at-[\w-]+)/g;
    for (let m = re.exec(value); m !== null; m = re.exec(value)) {
        let depth = 1;
        let j = re.lastIndex;
        while (j < value.length && depth > 0) {
            if (value[j] === '(') depth += 1;
            else if (value[j] === ')') depth -= 1;
            j += 1;
        }
        // m.index points at the "v" of var(; j - 1 is the matching ")".
        const [name, fallback] = splitVarArgs(value.slice(m.index + 4, j - 1));
        out.push({ name, fallback });
    }
    return out;
}

function mediaWidth(node) {
    let p = node.parent;
    while (p) {
        if (p.type === 'atrule' && p.name === 'media') {
            const mm = p.params.match(/min-width:\s*(\d+)px/);
            return mm ? `${mm[1]}px` : p.params;
        }
        p = p.parent;
    }
    return null;
}

/** Collapse a rule's declarations to the standard properties it sets. */
function collapseProps(decls) {
    const plain = new Set();
    const prefixed = new Set();
    for (const d of decls) {
        // Custom-property declarations are seeds, not properties; they get
        // their own column so a reader never confuses the two.
        if (d.prop.startsWith('--')) continue;
        const std = d.prop.replace(/^-(?:webkit|moz|ms|o)-/, '');
        if (LEGACY_PREFIXED.has(std)) continue;
        (d.prop === std ? plain : prefixed).add(std);
    }
    return [...new Set([...plain, ...prefixed])].sort();
}

function emptyRecord() {
    return {
        reads: new Set(),
        seeds: new Set(),
        props: new Set(),
        media: new Set(),
        // Retained per class even though every shipped declaration is now
        // importance-free, because `importance` is part of the published JSON
        // schema. It reads `none` throughout; check-important.js is what
        // enforces the invariant, not this tally.
        impDecls: 0,
        plainDecls: 0,
    };
}

/** Parse one bundle into className -> record. */
function scan(relFile) {
    const map = new Map();
    const rootNode = postcss.parse(fs.readFileSync(path.join(root, relFile), 'utf8'));
    rootNode.walkRules((rule) => {
        const width = mediaWidth(rule);
        const decls = [];
        rule.walkDecls((d) => decls.push(d));
        const props = collapseProps(decls);
        const reads = new Set();
        const seeds = new Set();
        let impDecls = 0;
        let plainDecls = 0;
        for (const d of decls) {
            if (d.prop.startsWith('--at-')) seeds.add(d.prop);
            readAtVars(d.value).forEach((v) => reads.add(v.name));
            if (d.important) impDecls += 1;
            else plainDecls += 1;
        }
        for (const m of rule.selector.matchAll(/\.(at[\w-]*)/g)) {
            const name = m[0].slice(1);
            if (!map.has(name)) map.set(name, emptyRecord());
            const rec = map.get(name);
            props.forEach((p) => rec.props.add(p));
            reads.forEach((v) => rec.reads.add(v));
            seeds.forEach((v) => rec.seeds.add(v));
            if (width) rec.media.add(width);
            rec.impDecls += impDecls;
            rec.plainDecls += plainDecls;
        }
    });
    return map;
}

const byName = (a, b) => a.localeCompare(b, 'en');

/**
 * Order a class's reads so the variable named after the class comes first —
 * `.at-mix-blnd-mode` reads `--at-mix-blnd-mode` first and the legacy name
 * second. The token contract (ARCHITECTURE.md) makes that pairing the point of
 * the class, so it should not have to be hunted for in an alphabetical list.
 */
function sortReads(name, reads) {
    const own = `--at-${name.replace(/^at-?/, '')}`;
    return [...reads].sort((a, b) => {
        if (a === own) return -1;
        if (b === own) return 1;
        return byName(a, b);
    });
}

/**
 * The breakpoint a class is scoped to. The infix is a whole `-`-delimited
 * segment wherever it sits: `at-col-md-6`, `at-flx-md-row`, `at-md-inl`.
 */
function infixOf(name) {
    return name.split('-').slice(1).find((s) => INFIXES.includes(s)) || null;
}

function classify(name) {
    const rule = KIND_RULES.find(([, re]) => re.test(name));
    return rule ? rule[0] : null;
}

function tokensOf(name) {
    return name
        .replace(/^at-?/, '')
        .split('-')
        .filter((t) => t && !INFIXES.includes(t) && !/^\d+$/.test(t));
}

// ---------------------------------------------------------------- parse

const legend = JSON.parse(fs.readFileSync(path.join(root, SOURCES.legend), 'utf8'));
const bundles = {
    minimal: scan(SOURCES.minimal),
    max: scan(SOURCES.max),
    template: scan(SOURCES.template),
};

// infix -> min-width, derived from the compiled CSS rather than assumed.
const widths = new Map();
bundles.minimal.forEach((rec, name) => {
    const infix = infixOf(name);
    if (infix && rec.media.size === 1) widths.set(infix, [...rec.media][0]);
});
const breakpoints = INFIXES.map((infix) => {
    if (infix === 'xs') {
        return {
            infix,
            minWidth: null,
            // Pointer text is added per renderer: the MD reader is sent to the
            // ladder section, the JSON consumer to the `fifths` key.
            applies: 'no min-width — base rules are unprefixed',
        };
    }
    return {
        infix,
        minWidth: widths.get(infix) || null,
        applies: widths.get(infix) ? `@media (min-width: ${widths.get(infix)})` : 'unresolved',
    };
});

// Variable index, built from every read across both shipped bundles. Fallbacks
// are NOT uniform per variable: `--at-gap` alone resolves to four different
// values depending on the rule (`initial` on `.at-gap`, none on `.at-row-gap`,
// `0px` inside a column width, `15px` in `.at-vrt`). So collect every distinct
// fallback together with the classes that use it, instead of the first hit.
const varMeta = new Map();
const varRec = (name) => {
    if (!varMeta.has(name)) {
        varMeta.set(name, { name, fallbacks: new Map(), readBy: new Set() });
    }
    return varMeta.get(name);
};

for (const map of [bundles.minimal, bundles.max]) {
    map.forEach((rec, name) => rec.reads.forEach((v) => varRec(v).readBy.add(name)));
}

// Record every distinct fallback against the classes that use it.
for (const rel of [SOURCES.minimal, SOURCES.max]) {
    postcss.parse(fs.readFileSync(path.join(root, rel), 'utf8')).walkRules((rule) => {
        const classes = [...rule.selector.matchAll(/\.(at[\w-]*)/g)].map((m) => m[0].slice(1));
        if (!classes.length) return;
        rule.walkDecls((d) => {
            readAtVars(d.value).forEach((v) => {
                const key = v.fallback === null ? '' : v.fallback;
                const fallbacks = varRec(v.name).fallbacks;
                if (!fallbacks.has(key)) fallbacks.set(key, new Set());
                classes.forEach((c) => fallbacks.get(key).add(c));
            });
        });
    });
}

// A variable is a legacy *name* exactly when some other variable nests it as
// its fallback: `--at-mix-blend-mode` is the superseded spelling kept alive by
// `--at-mix-blnd-mode`'s fallback, and the reverse is false. Derived from the
// parsed structure rather than token spelling, so `--at-wrd-spc` (active) is
// not mistaken for `--at-wrd-spg` (legacy) even though both are three letters.
const legacyNames = new Set();
const legacyHost = new Map();
const variables = [...varMeta.values()]
    .map((v) => {
        const fallbacks = [...v.fallbacks.entries()]
            .sort((a, b) => byName(a[0] || '~', b[0] || '~'))
            .map(([fallback, users]) => {
                // A nested var() is only a legacy *alias* when the legend says so.
                // The gap family nests too, but that is a contextual chain, not a
                // deprecation, so it must not be reported as `legacy` in the JSON.
                const nested = /^var\(\s*(--at-[\w-]+)/.exec(fallback);
                return {
                    fallback: fallback === '' ? null : fallback,
                    usedBy: [...users].sort(byName),
                    chain: fallback.includes('var('),
                    legacy: nested && isLegacyAlias(nested[1]) ? nested[1] : null,
                };
            });
        // The active entry is the flat fallback the classes actually use; a
        // nested one is only ever a chain back to another variable.
        const primary = fallbacks.find((f) => f.fallback !== null && !f.chain)
            || fallbacks.find((f) => f.fallback !== null)
            || fallbacks[0];
        return {
            name: v.name,
            fallbacks,
            fallback: primary ? primary.fallback : null,
            chain: primary ? primary.chain : false,
            legacy: primary && primary.legacy && isLegacyAlias(primary.legacy) ? primary.legacy : null,
            readBy: [...v.readBy].sort(byName),
        };
    })
    .sort((a, b) => byName(a.name, b.name));

variables.forEach((v) => v.fallbacks.forEach((f) => {
    if (!f.legacy || !isLegacyAlias(f.legacy)) return;
    legacyNames.add(f.legacy);
    legacyHost.set(f.legacy, v.name);
}));
variables.forEach((v) => {
    v.legacyName = legacyNames.has(v.name);
    v.legacyHost = legacyHost.get(v.name) || null;
});

// The 2m3 fifths ladder, derived rather than described: for every class whose
// name ends in `2m3`, record the media context it is compiled in and the
// max-width it applies. This is the only way to state what the family does
// without hand-writing a claim the next build could invalidate.
function fifthsLadder() {
    const rows = new Map();
    const ensure = (name) => {
        if (!rows.has(name)) rows.set(name, { name, geometry: false, widths: new Map() });
        return rows.get(name);
    };
    postcss.parse(fs.readFileSync(path.join(root, SOURCES.minimal), 'utf8')).walkRules((rule) => {
        const targets = rule.selector.split(',')
            .map((s) => s.trim().replace(/^\./, ''))
            .filter((s) => /^at-col-[\w-]*2m3$/.test(s));
        if (!targets.length) return;
        // Two independent facts, deliberately kept apart: membership of the base
        // column geometry (the column box), and any `max-width` the rule imposes.
        // Conflating them misreports a term that has both.
        //
        // Geometry is keyed on `min-height`, not on `width: 100%`: only the
        // column-box rule declares it, and it survives whitespace/formatting
        // drift that an exact string compare would silently miss.
        const context = mediaWidth(rule) || 'base (all widths)';
        let geometry = false;
        let maxWidth = null;
        rule.walkDecls((d) => {
            if (d.prop === 'min-height') geometry = true;
            if (d.prop === 'max-width' && maxWidth === null) maxWidth = d.value;
        });
        targets.forEach((name) => {
            const row = ensure(name);
            if (geometry) row.geometry = true;
            if (maxWidth !== null) row.widths.set(context, maxWidth);
        });
    });
    // `xs` is the unprefixed base term, so it ranks with `base` rather than last.
    const rank = (c) => (c === 'base (all widths)' ? 0 : Number(c.replace(/px$/, '')));
    return [...rows.values()].sort((a, b) => {
        const ra = a.widths.size ? Math.min(...[...a.widths.keys()].map(rank)) : 0;
        const rb = b.widths.size ? Math.min(...[...b.widths.keys()].map(rank)) : 0;
        return ra - rb || byName(a.name, b.name);
    });
}

const fifths = fifthsLadder();

// A nested fallback is only a *legacy alias* when the legend says so — either a
// token of the fallback name is annotated "legacy", or a legend entry names the
// fallback variable outright. Everything else nested is a contextual chain
// (the gap family), not a deprecation, and must not be labelled as one.
function isLegacyAlias(fallbackVar) {
    const tokens = tokensOf(fallbackVar.replace(/^--at-?/, ''));
    if (tokens.some((t) => legend[t] && /legacy/i.test(legend[t]))) return true;
    return Object.values(legend).some((desc) => desc.includes(fallbackVar));
}

// ---------------------------------------------------------------- model

const classes = [...new Set([...bundles.minimal.keys(), ...bundles.max.keys()])]
    .map((name) => {
        const inMin = bundles.minimal.has(name);
        const inMax = bundles.max.has(name);
        const rec = inMin ? bundles.minimal.get(name) : bundles.max.get(name);
        return {
            name,
            kind: classify(name),
            bundle: inMin && inMax ? 'both' : inMax ? 'max only' : 'minimal only',
            breakpoint: infixOf(name),
            properties: [...rec.props].sort(),
            reads: sortReads(name, rec.reads),
            seeds: [...rec.seeds].sort(),
            // Schema-stable tri-state, retained for the published JSON shape
            // rather than for what it can currently report. It reads `none` for
            // all three inputs, including the template: that file carries the
            // literal `%%IMPORTANT%%` placeholder, which postcss reports as
            // `important: false`. CSS with the marker resolved to a real
            // `!important` only ever exists in a consumer's runtime output, and
            // nothing on disk describes it.
            importance: rec.impDecls > 0 && rec.plainDecls > 0
                ? 'some' : (rec.impDecls > 0 ? 'all' : 'none'),
            tokens: tokensOf(name),
        };
    })
    .sort((a, b) => byName(a.name, b.name));

const kindCount = (kind) => classes.filter((c) => c.kind === kind).length;
const isMinimal = (c) => c.bundle !== 'max only';
const readsChannel = (c) => c.reads.length > 0;

const counts = {
    minimalClasses: bundles.minimal.size,
    maxClasses: bundles.max.size,
    templateClasses: bundles.template.size,
    maxOnlyClasses: classes.filter((c) => c.bundle === 'max only').length,
    variables: variables.length,
    legendEntries: Object.keys(legend).length,
    structuralClasses: kindCount('structural'),
    seedClasses: classes.filter((c) => c.seeds.length > 0).length,
    importantClasses: classes.filter((c) => c.importance !== 'none').length,
    gridClasses: kindCount('grid'),
    flexClasses: kindCount('flex'),
    displayClasses: kindCount('display'),
    propertyClasses: kindCount('property'),
    distinctProperties: new Set(classes.flatMap((c) => c.properties)).size,
    channelReaders: classes.filter(readsChannel).length,
    channelSilent: classes.filter((c) => !readsChannel(c)).length,
    minimalChannelReaders: classes.filter((c) => isMinimal(c) && readsChannel(c)).length,
    minimalChannelSilent: classes.filter((c) => isMinimal(c) && !readsChannel(c)).length,
};

const byKind = new Map(KIND_ORDER.map((k) => [k, []]));
classes.forEach((c) => byKind.get(c.kind).push(c));

// ---------------------------------------------------------------- checks

const failures = [];

// A derived section that silently returns nothing is worse than no section: the
// prose around it would keep asserting a table that is not there. Guard both
// total failure and *partial* shrinkage — a renamed or dropped term would
// otherwise shrink the table quietly while the prose still describes it.
const FIFTHS_EXPECTED = [
    'at-col-2m3', 'at-col-sm-2m3', 'at-col-md-2m3',
    'at-col-lg-2m3', 'at-col-xl-2m3', 'at-col-xxl-2m3',
];

// Terms that ship WITHOUT the base column geometry, because
// scss/grid_base/_custom-grid-5ths.scss hand-lists the column box and can fall
// out of step with the breakpoint loop that generates the terms.
//
// This list is EMPTY, which makes the pair of guards below a hard invariant:
// every 2m3 term must have the column box. A term is added here only as a
// deliberate, reviewed exception — and the guard that fires when an entry stops
// being needed names the prose to update in the same change.
const KNOWN_FIFTHS_DEFECTS = [];
if (!fifths.length) {
    failures.push('the 2m3 fifths ladder derivation matched no classes, but the reference documents the ladder');
}
const fifthsNames = new Set(fifths.map((r) => r.name));
FIFTHS_EXPECTED.filter((n) => !fifthsNames.has(n)).forEach((n) => {
    failures.push(`the 2m3 fifths ladder is missing \`.${n}\`; the reference documents ${FIFTHS_EXPECTED.length} terms`);
});
fifths.filter((r) => !FIFTHS_EXPECTED.includes(r.name)).forEach((r) => {
    failures.push(`unexpected 2m3 term \`.${r.name}\` in the ladder; add it to FIFTHS_EXPECTED deliberately`);
});

const geometryLess = fifths.filter((r) => !r.geometry).map((r) => r.name).sort(byName);
KNOWN_FIFTHS_DEFECTS.filter((n) => !geometryLess.includes(n)).forEach((n) => {
    failures.push(`\`.\${n}\` no longer ships without base column geometry — the SCSS box list was fixed, so remove it from KNOWN_FIFTHS_DEFECTS and drop the known-defect notes from README.md`);
});
geometryLess.filter((n) => !KNOWN_FIFTHS_DEFECTS.includes(n)).forEach((n) => {
    failures.push(KNOWN_FIFTHS_DEFECTS.length
        ? `\`.${n}\` ships without base column geometry and is not a tracked defect; fix scss/grid_base/_custom-grid-5ths.scss or add it to KNOWN_FIFTHS_DEFECTS deliberately`
        : `\`.${n}\` ships without base column geometry; every 2m3 term must be in the column-box list in scss/grid_base/_custom-grid-5ths.scss`);
});

// The kind partition must be total.
const unclassified = classes.filter((c) => c.kind === null);
if (unclassified.length) {
    failures.push(`unclassified classes — no KIND_RULES entry matches: ${unclassified.map((c) => c.name).join(', ')}`);
}

// The template mirrors the minimal bundle, never the max one.
const templateDiff = [...bundles.template.keys()]
    .filter((n) => !bundles.minimal.has(n))
    .concat([...bundles.minimal.keys()].filter((n) => !bundles.template.has(n)));
if (templateDiff.length) {
    failures.push(`template selector set differs from the minimal bundle: ${templateDiff.sort(byName).join(', ')}`);
}

// Every breakpoint infix must resolve to a real min-width in the compiled CSS.
INFIXES.filter((i) => i !== 'xs' && !widths.has(i)).forEach((i) => {
    failures.push(`no compiled rule resolves the "${i}" breakpoint infix to a min-width`);
});

// A class whose name carries an infix must be scoped to exactly that min-width.
classes.filter((c) => c.breakpoint && c.breakpoint !== 'xs').forEach((c) => {
    const rec = bundles.minimal.get(c.name) || bundles.max.get(c.name);
    const want = widths.get(c.breakpoint);
    const got = [...rec.media].sort().join(',');
    if (got !== want) {
        failures.push(`.${c.name} carries the "${c.breakpoint}" infix but is compiled at "${got || 'no media'}", expected "${want}"`);
    }
});

// `xs` has no min-width — base rules are unprefixed. The only name carrying an
// `xs` segment is the below-sm full-width column, which must therefore sit
// outside every media block. This keeps a future `.at-xs-*` from slipping in
// unvalidated.
classes.filter((c) => c.breakpoint === 'xs').forEach((c) => {
    const rec = bundles.minimal.get(c.name) || bundles.max.get(c.name);
    if (rec.media.size) {
        failures.push(`.${c.name} carries the "xs" infix but is compiled inside ${[...rec.media].sort().join(', ')}; "xs" has no min-width`);
    }
});

// A code example must not link two shipped bundles: max is a strict superset of
// minimal, so a consumer that links both ships every rule twice. Keyed on
// `href` inside a fenced block, so a prose table listing the bundle files is
// unaffected.
const BUNDLE_ROOTS = ['css/', 'css-max/', 'css-template/'];
for (const file of PROSE) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) continue;
    for (const block of fs.readFileSync(abs, 'utf8').match(/```[\s\S]*?```/g) || []) {
        const hrefs = [...block.matchAll(/href=(["'])([^"']*)\1/g)].map((m) => m[2]);
        const roots = [...new Set(hrefs
            .map((h) => BUNDLE_ROOTS.find((r) => h.includes(r)))
            .filter(Boolean))];
        if (roots.length > 1) {
            failures.push(`${file} has an example linking ${roots.length} bundles (${roots.join(', ')}); link one and name the other as an alternative`);
        }
    }
}
// A property utility earns its name by reading a variable; one that does not is
// a classification error, not a new kind.
byKind.get('property').filter((c) => c.reads.length === 0).forEach((c) => {
    failures.push(`class .${c.name} is classified "property" but reads no --at-* variable`);
});

// Hand-written prose may only name classes that ship, and variables that are
// either read by a bundle or fully covered by the naming legend. The whole file
// is scanned, fenced code blocks included, because that is where a usage guide
// actually names classes.
const knownClasses = new Set(classes.map((c) => c.name));
const knownVars = new Set(variables.map((v) => v.name));
const legendCovers = (varName) => tokensOf(varName.replace(/^--at-?/, '')).every((t) => t in legend);

/** Every complete `.at-*` / `--at-*` name in a chunk of prose. */
function proseNames(text, re) {
    // Link targets and bare URLs are paths, not class claims.
    const scannable = text.replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, '');
    const out = new Set();
    for (let m = re.exec(scannable); m !== null; m = re.exec(scannable)) {
        // A trailing `-` or a following `*` marks a family stem or glob
        // (`.at-flx-*`), not a claim about one class.
        if (m[0].endsWith('-') || scannable[m.index + m[0].length] === '*') continue;
        out.add(m[0].replace(/^\./, ''));
    }
    return out;
}

// A leading `-` or word char means this is a variable (`--at-p`), a data
// attribute (`data-at-theme`) or a slug, not a class.
const CLASS_RE = /(?<![\w-])\.?(at-[\w-]+)/g;
const VAR_RE = /(?<![\w-])(--at-[\w-]+)/g;

// The skill teaches names, so it is held to the same rule as the prose: every
// `.at-*` and `--at-*` it mentions must exist. This is what keeps a shipped
// agent contract from drifting away from the bundles.
for (const file of [...PROSE, ...AGENT_DOCS]) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    for (const name of proseNames(text, CLASS_RE)) {
        if (knownClasses.has(name) || ALLOWED_IN_PROSE.has(name)) continue;
        failures.push(`${file} names \`.${name}\`, which is in no bundle`);
    }
    for (const name of proseNames(text, VAR_RE)) {
        if (!knownVars.has(name) && !legendCovers(name) && !CONSUMER_VARS.has(name)
            && !DEMONSTRABLY_FAKE.has(name.replace(/^--/, ''))) {
            failures.push(`${file} names \`${name}\`, which no bundle reads and short-names.json does not cover`);
        }
    }
}

// ---------------------------------------------------------------- render

// Built once, in one place. An earlier revision inlined this mapping twice in
// the same object literal, where `JSON.stringify` silently kept the last copy —
// correct output, dead code, and invisible to any gate.
const fifthsJson = () => fifths.map((r) => ({
    name: r.name,
    baseColumnGeometry: r.geometry,
    // Per-context values, not a single scalar: two breakpoints could in
    // principle cap at different widths, and a scalar would misreport that.
    maxWidthByContext: Object.fromEntries(r.widths),
}));

function renderJson() {
    // No timestamp. A date field would make `--check` fail on every day after
    // generation, and git already dates the commit that changed the CSS.
    return `${JSON.stringify({
        version: VERSION,
        generator: 'scripts/generate-docs.js',
        sources: SOURCES,
        counts,
        // The xs row points tooling here, so the ladder ships in the data rather
        // than being left implicit.
        fifths: fifthsJson(),
        breakpoints: breakpoints.map((b) => (
            b.infix === 'xs' ? { ...b, applies: `${b.applies} (see the \`fifths\` key)` } : b
        )),
        classes,
        variables,
        legend,
    }, null, 2)}\n`;
}

// ---------------------------------------------------------------- emit

const outputs = [[OUT, renderJson()]];

// Cross-document references in the shipped docs must resolve *inside the
// tarball*: a `file § Section` pointer needs a shipped file with that heading,
// and a relative link needs a shipped target. F2 (pointing at the unshipped
// `scripts/`), H1 (pointing at an ARCHITECTURE.md section that does not exist)
// and J1 (a link to the repo-only `demo/`) were all invisible to every other
// check, and all are observable here, at the output layer.
//
// Scope is deliberate. This covers the agent-facing files an AI consumer is told
// to read. README.md is EXCLUDED: it is human-facing and is read on npm and
// GitHub, where repo-relative paths like `demo/organism/` resolve against the
// repository. Holding a document that is consumed in two different places to
// the stricter of the two would mean hardcoding repository URLs into it.
const SHIPPED = new Set(['README.md', 'LICENSE', 'package.json']);
// Recurse, not just one level: skills/atomic-css/ ships with nested
// references/ and scripts/ directories, and a link into them must not
// false-fail.
const collectShipped = (entry) => {
    const abs = path.join(root, entry);
    if (!fs.existsSync(abs)) return;
    if (fs.statSync(abs).isDirectory()) {
        fs.readdirSync(abs).forEach((f) => collectShipped(path.join(entry, f)));
    } else {
        SHIPPED.add(entry);
    }
};
for (const entry of require(path.join(root, 'package.json')).files || []) collectShipped(entry);

/** GitHub-style heading slug, for validating `#fragment` links. */
const slug = (heading) => heading
    .toLowerCase()
    .replace(/[`*]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const headingsOf = (file) => {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) return null;
    return fs.readFileSync(abs, 'utf8')
        .split('\n')
        .filter((l) => /^#{1,6} /.test(l))
        .map((l) => l.replace(/^#{1,6} /, '').replace(/[`*]/g, '').toLowerCase());
};

const slugsOf = (file) => {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) return null;
    return fs.readFileSync(abs, 'utf8')
        .split('\n')
        .filter((l) => /^#{1,6} /.test(l))
        .map((l) => slug(l.replace(/^#{1,6} /, '')));
};

/** Section-sign pointers. Any file extension, not just .md. */
function checkPointers(owner, content) {
    for (const m of content.matchAll(/`?([\w./-]+\.[a-z]{1,4})`?\s*§+\s*([^.`\n]+)/g)) {
        const [, file, section] = m;
        if (!SHIPPED.has(file)) {
            failures.push(`${owner} points at ${file}, which is not in the npm tarball`);
            continue;
        }
        const headings = headingsOf(file);
        if (!headings) {
            failures.push(`${owner} points at ${file}, which does not exist`);
        } else if (!headings.some((h) => h.includes(section.trim().toLowerCase()))) {
            failures.push(`${owner} points at ${file} § ${section.trim()}, but that file has no such heading`);
        }
    }
}

/**
 * Prose numbers that restate a fact the reference already owns. Each claim site
 * gets its own pattern: a blanket /\d+/ scan would also catch CSS values
 * (`100%`, `1140px`, `font-weight: 700`), HTTP status codes and version
 * numbers, and would be turned off within a week.
 */
const SKILL = 'skills/atomic-css/SKILL.md';
const CLASSES = 'skills/atomic-css/references/classes.md';
const SETUP = 'skills/atomic-css/references/setup.md';
const PATTERNS = 'skills/atomic-css/references/patterns.md';

const COUNT_CLAIMS = [
    [SKILL, /and (\d+) classes that between them/, [() => counts.maxClasses], 'max classes'],
    [SKILL, /\*\*(\d+) distinct CSS properties\*\*/, [() => counts.distinctProperties], 'distinct properties'],
    [SKILL, /\*\*A property\?\*\* (\d+) are already applied/, [() => counts.distinctProperties], 'distinct properties'],
    [SKILL, /(\d+) grid classes cover/, [() => counts.gridClasses], 'grid classes'],
    [SKILL, /the same (\d+) legend entries/, [() => counts.legendEntries], 'legend entries'],
    [SKILL, /`sm (\d+)`, `md (\d+)`, `lg (\d+)`, `xl (\d+)`, `xxl (\d+)`/,
        () => breakpoints.filter((b) => b.minWidth).map((b) => Number(b.minWidth.replace('px', ''))),
        'breakpoint min-widths'],
    // Phrasing-independent: a prose restatement ("all 316 entries") used to slip
    // past a gate that only matched one exact sentence, which is how the two
    // copies of this number drifted apart. Any "N legend entries" / "N entries"
    // claim in the skill docs is now held to the real count.
    //
    // An earlier `"legend" object (N` pattern sat here as well. No sentence in
    // classes.md matched it, so it asserted nothing while reading as coverage —
    // a dead gate is worse than no gate, because it looks like one.
    //
    // Prose restatements of the same number, so a second phrasing cannot drift.
    // Only one capture group per alternative, so every branch yields a value.
    // A single capture, because checkCounts reads capture 1 per expected value.
    // Lookbehind/lookahead let one pattern cover all three phrasings.
    [CLASSES, /(?<![\d])(?:all |would drift, |)(\d+) (?:entries|legend entries)\b/,
        [() => counts.legendEntries], 'legend entries'],
    [SKILL, /\b(?:(\d+) legend entries|all (\d+) entries)\b/,
        [() => counts.legendEntries], 'legend entries'],
    [CLASSES, /^## Grid \((\d+) classes\)/m, [() => counts.gridClasses], 'grid classes'],
    [CLASSES, /^## Flex \((\d+)\) and display \((\d+)\)/m,
        [() => counts.flexClasses, () => counts.displayClasses], 'flex / display classes'],
    [CLASSES, /^(\d+) classes, absent from the minimal bundle/m, [() => counts.maxOnlyClasses], 'max-only classes'],
    [CLASSES, /^## Property utilities \((\d+)\)/m, [() => counts.propertyClasses], 'property utilities'],
    [CLASSES, /^## Structural classes \((\d+)\)/m, [() => counts.structuralClasses], 'structural classes'],
    [CLASSES, /^## Variables \((\d+) read by the bundles\)/m, [() => counts.variables], 'variables'],
    [SETUP, /^\| `css\/atomic\.css`[^|]*\| (\d+) \|/m, [() => counts.minimalClasses], 'minimal bundle classes'],
    [SETUP, /^\| `css-max\/atomic-max\.css`[^|]*\| (\d+) \|/m, [() => counts.maxClasses], 'max bundle classes'],
    [SETUP, /^\| `css-template\/atomic-template\.css`[^|]*\| (\d+) \|/m, [() => counts.templateClasses], 'template classes'],
    [PATTERNS, /full (\d+)-class inventory, (\d+) classes read/,
        [() => counts.maxClasses, () => counts.channelSilent], 'max classes / channel-silent'],
    [PATTERNS, /(\d+) read at least one/, [() => counts.channelReaders], 'channel readers'],
    [PATTERNS, /minimal bundle is (\d+) of those classes: (\d+) with no/,
        [() => counts.minimalClasses, () => counts.minimalChannelSilent], 'minimal classes / channel-silent'],
    [PATTERNS, /the same (\d+) readers/, [() => counts.minimalChannelReaders], 'minimal channel readers'],
    // The breakpoint table in classes.md is one row per infix.
    ...breakpoints.filter((b) => b.minWidth).map((b) => [
        CLASSES,
        new RegExp(`^\\| \`${b.infix}\` \\| (\\d+)px`, 'm'),
        [() => Number(b.minWidth.replace('px', ''))],
        `${b.infix} min-width`,
    ]),
];

/**
 * A raw `gap` / `column-gap` declaration on a rule that also carries `.at-row`.
 *
 * Scoped to rows deliberately. The framework sizes every column as
 * `calc(<fraction> - var(--at-col-gap, var(--at-gap, 0px)) * <k>)`, so a gutter
 * written as a property is added on top of widths that already sum to 100% — the
 * row overflows its container by the total gap, silently. A raw `gap` on an
 * ordinary flex container is fine: nothing there is a calc() reading the same
 * variable, so there is nothing to double-count.
 *
 * The fix is never to drop the property but to move the value into the variable
 * the columns read, and drop the padding with `at-no-gtr` (classes.md § The
 * gutter is counted once).
 */
const ROW_GAP = /\.(at-row)\b[^,{]*\{[^}]*?(?:^|[;{}\s])(?:gap|column-gap|-webkit-column-gap)\s*:/g;

function checkRowGap(owner, content) {
    const mask = codeMask(content);
    for (const m of mask.matchAll(ROW_GAP)) {
        // Same exemption as the seed check: a documented counter-example may show
        // the anti-pattern if it says so. Look back to the previous rule only.
        // Read the marker from the ORIGINAL text: codeMask blanks the comment it
        // lives in, so looking for it in the mask never finds it.
        const before = content.slice(Math.max(0, m.index - 400), m.index);
        if (/WRONG/.test(before.slice(before.lastIndexOf('}') + 1))) continue;
        const prop = /(-webkit-column-gap|column-gap|gap)\s*:/.exec(m[0])[1];
        failures.push(
            `${owner} sets \`${prop}\` on a rule carrying .at-row. Column widths are `
            + 'calc()s that read --at-col-gap, so a property adds gap no column subtracts and '
            + 'the row overflows. Seed `--at-col-gap` instead (with `at-no-gtr`), or let '
            + '.at-gap carry it.');
    }
}

/**
 * A consumer spacing-scale step (`.at-spc-lg`) is allowed to carry a number —
 * it names a step on a scale the consumer owns, the same way `.at-col-6` names
 * its span. What it may NOT do is hard-code the measurement: the value belongs
 * in a variable, so the scale changes in one place. `at-gap-20 { --at-gap: 20px }`
 * is the failure this catches.
 */
const SCALE_CLASS = /\.(at-spc-[\w-]+)/g;

function checkScaleSteps(owner, content) {
    // Only a class *declared* in CSS can carry a literal. The same name in prose
    // or in an inline-code span is a mention, and scanning forward from a mention
    // to the next `}` reads an unrelated rule.
    for (const block of cssFences(content)) {
      for (const m of block.matchAll(SCALE_CLASS)) {
        const name = m[1];
        // The rule body runs to the first `}`; a nested block is not a declaration.
        const end = block.indexOf('}', m.index);
        if (end < 0) continue;
        const body = block.slice(m.index, end);
        for (const d of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
            if (/\b\d+(px|rem|em|%|vh|vw)\b/.test(d[2])) {
                failures.push(
                    `${owner} gives .${name} the literal \`${d[2].trim()}\` — a scale step should read a `
                    + 'token (var(--at-…)) so the scale changes in one place.');
            }
        }
      }
    }
}

const STATE_PSEUDO = /:(hover|focus|focus-visible|focus-within|active)\b/;

/** Selectors whose base supplies the token legitimately, by design. */
const STATE_ARM_EXEMPT = new Set(['.at-ctnr']);

/** Fenced ```css blocks, so prose is never parsed as a selector. */
function cssFences(content) {
    return [...content.matchAll(/```css\n([\s\S]*?)```/g)].map((m) => m[1]);
}

/**
 * The prefix is a literal, never a variable.
 *
 * `at-` and `--at-` are fixed by the shipped bundles. A source that declares a
 * prefix variable has introduced an indirection whose only possible effect is a
 * value that matches no shipped class — and that compiles clean, passes every
 * name check, and renders nothing. The framework removed $appPrefix,
 * $varPrefix, $grid-prefix and $grid-col-prefix for exactly this reason
 * (ARCHITECTURE.md § The prefixes are literals).
 */
// Any Sass variable that names a prefix, plus the short aliases this pattern
// actually shipped under (`$at`, `$vp`, `$app`, `$pfx`). Matching only the four
// historical names let `$atPrefix` through in the negative test.
const PREFIX_VARIABLES = /\$(?:[\w-]*[Pp]refix[\w-]*|at|vp|app|pfx)\b/;

function checkPrefixLiterals(owner, content) {
    const re = new RegExp(PREFIX_VARIABLES, 'g');
    let m;
    while ((m = re.exec(content))) {
        const line = content.slice(0, m.index).split('\n').length;
        failures.push(
            `${owner}:${line} declares or uses \`${m[0]}\` — the \`at-\` / \`--at-\` `
            + 'prefix is fixed by the shipped bundles and must be written literally. '
            + 'A prefix variable can only ever produce classes nothing matches.',
        );
    }
}

function checkStateArmSeeds(owner, content, isStylesheet) {
    const run = (css) => {
        const resting = new Map();
        // Tokens a resting rule *reads* through var(). Kept apart from the
        // declarations above because a read is a different claim: it says the
        // property takes its value from that token, not that the rule supplies it.
        const restingReads = new Map();
        const stateful = [];
        for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
            const [, rawSelector, body] = m;
            if (!rawSelector || rawSelector.trim().startsWith('@')) continue;
            // The capture runs from the previous `}`, so it carries any comment
            // written above the rule. The selector is its last line; whatever is
            // above it is where a WRONG marker lives.
            const lines = rawSelector.split('\n');
            const above = lines.slice(0, -1).join('\n');
            const selectorText = lines[lines.length - 1].trim();
            if (!selectorText) continue;
            const tokens = [...body.matchAll(/(--at-[\w-]+)\s*:/g)].map((t) => t[1]);
            const reads = [...body.matchAll(/var\(\s*(--at-[\w-]+)/g)].map((t) => t[1]);
            // A rule that only reads is still evidence: `.at-card { color:
            // var(--at-card-cl, …) }` declares nothing, and skipping it is what
            // made a private-namespace state arm look unbacked.
            if (!tokens.length && !reads.length) continue;
            for (const raw of selectorText.split(',')) {
                const selector = raw.trim();
                if (!selector) continue;
                const base = selector.replace(STATE_PSEUDO, '').trim();
                const key = base || selector;
                if (base === selector) {
                    if (!resting.has(key)) resting.set(key, new Set());
                    if (!restingReads.has(key)) restingReads.set(key, new Set());
                    tokens.forEach((t) => resting.get(key).add(t));
                    reads.forEach((t) => restingReads.get(key).add(t));
                } else if (tokens.length) {
                    stateful.push({ selector, key, tokens, above, css });
                }
            }
        }
        for (const { selector, key, tokens, above, css: blk } of stateful) {
            if (STATE_ARM_EXEMPT.has(key)) continue;
            if (/WRONG/.test(above)) continue;
            const declared = resting.get(key);
            const read = restingReads.get(key);
            for (const token of tokens) {
                if (declared && declared.has(token)) continue;
                // A private-namespace token whose own resting rule reads it has
                // exactly one possible supplier, so there is nothing for it to
                // inherit and the read's fallback IS the resting value. Shared
                // channels keep the strict rule: an ancestor or the framework can
                // supply them, which is the leak this check exists to catch.
                if (!knownVars.has(token) && read && read.has(token)) continue;
                failures.push(
                    `${owner}: ${selector} seeds ${token} only in a state arm — custom `
                    + 'properties inherit, so the resting state takes an ancestor value. '
                    + `Declare the resting value on ${key}, or delete the seed if nothing reads it.`,
                );
            }
        }
    };

    if (isStylesheet) run(content);
    else for (const fence of cssFences(content)) run(fence);
}

/**
 * `:where(:root) <selector>` is the same selector. `:root` matches <html>, every
 * element in the document is a descendant of it, and `:where()` contributes zero
 * specificity — so the prefix changes neither the match set nor the specificity.
 * It reads as scoping that does not exist, and a comment justifying it would be
 * false. `:where(:root) { … }` on its own is fine: that is the root itself.
 */
function checkRedundantRoot(owner, content) {
    // Comments explain the rule, so they are allowed to quote the anti-pattern.
    const code = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const m of code.matchAll(/:where\(:root\)(?=\s+[^\s{])/g)) {
        failures.push(
            `${owner} writes \`:where(:root) …\` with more selector after it — that is the same `
            + 'selector as without the prefix, at the same specificity. Drop `:where(:root)`.');
    }
}

/**
 * A custom property seeded on a bare element selector escapes to its whole
 * subtree, so `h1 { --at-cl: … }` sets the app's colour channel for everything
 * under every h1 rather than styling the h1. Element defaults are raw
 * properties; a token is seeded on a class, or on `*` for a global override.
 *
 * Matches `:where(el)` and `el` alike — the selector form is not the point, and
 * a gate that only understood one of them would pass everything the moment the
 * other was used. `*`, `:root` and the `:focus-visible` style pseudo-class are
 * exempt: `*` is the deliberate global-override idiom (see the reduced-motion
 * rule) and `:root` scopes to nothing below it.
 */
/**
 * Comments and fence markers are blanked (length preserved, so every index still
 * addresses the original text) before the selector scan. Without this the capture
 * swallows them: `\`\`\`css` immediately above a rule makes the captured "selector"
 * read `css\nh1`, which then fails the bare-element test and silently skips a real
 * seed. Prose is left alone — the rules it documents live inside fences.
 */
function codeMask(content) {
    const blank = (m) => ' '.repeat(m.length);
    return content
        .replace(/\/\*[\s\S]*?\*\//g, blank)
        .replace(/^```[^\n]*$/gm, blank);
}

// Two alternatives: `:where(el)` and a bare selector, confined to one line. The
// single-line bound is load-bearing: prose contains `{` only rarely, so an
// unbounded capture runs from a sentence to the next brace in the document and
// swallows every rule in between — which is how a real seed goes unreported.
// The bare branch also requires a non-space first character, so a match cannot
// start on the whitespace before `:where(` and take the wrapper with it.
const SEED_SELECTOR = /(?::where\(([^)]*)\)|([^\s{@][^{}@\n]*))\s*\{/g;
const BARE_ELEMENT = /^(?:[a-z][\w-]*|(?:body|html)(?![\w-]))(?:\s*[>+~]\s*(?:[a-z][\w-]*|\*)|\s+[a-z][\w-]*)*\s*(?:::?[\w-]+(?:\([^)]*\))?)*$/i;

function checkElementSeeds(owner, content) {
    // Deliberately scans fenced blocks too: the CSS examples are precisely what
    // this rule governs, so stripping them would make the check inert. Only the
    // comments and fence markers are blanked, and indices still line up.
    const mask = codeMask(content);
    for (const m of mask.matchAll(SEED_SELECTOR)) {
        // A match that begins just after an `@` is an at-rule prelude
        // (`@media print {`), not a selector — the engine skips the `@` because
        // it cannot start the capture, so reject it here rather than reporting
        // `media print` as a bare element.
        if (content[m.index - 1] === '@') continue;

        const selector = (m[1] !== undefined ? m[1] : m[2]).trim();
        if (!selector || /[*]|:root|:focus|@/.test(selector)) continue;
        if (!BARE_ELEMENT.test(selector)) continue;
        // A documented counter-example is allowed to show the anti-pattern, as
        // long as it says so — the same WRONG/RIGHT convention the guides use.
        // The marker may sit in a comment above the rule, so look back only as
        // far as the previous rule: since the last `}`.
        const before = content.slice(Math.max(0, m.index - 400), m.index);
        if (/WRONG/.test(before.slice(before.lastIndexOf('}') + 1)) || /WRONG/.test(m[0])) continue;
        const body = content.slice(m.index, content.indexOf('}', m.index));
        for (const seed of body.matchAll(/(--[\w-]+)\s*:/g)) {
            if (!seed[1].startsWith('--at-')) continue;
            failures.push(
                `${owner} seeds ${seed[1]} on the bare element \`${selector}\` — `
                + 'a seed there sets that token for its whole subtree. Use the raw property, '
                + 'or move the seed to a class.');
        }
    }
}

/** Fenced code carries sample CSS and shell, not claims about the framework. */
const stripFences = (content) => content.replace(/^```[\s\S]*?^```/gm, '');

function checkCounts(owner, content) {
    const text = stripFences(content);
    for (const [file, re, valueFns, label] of COUNT_CLAIMS) {
        if (file !== owner) continue;
        // A claim supplies either a list of value functions or one function
        // returning a list, for the multi-capture cases.
        const resolved = Array.isArray(valueFns) ? valueFns.map((f) => f()) : valueFns();
        const expected = Array.isArray(resolved) ? resolved : [resolved];
        // matchAll insists on `g`; the claim patterns are written without it.
        const global = re.flags.includes('g') ? re : new RegExp(re.source, `${re.flags}g`);
        for (const m of text.matchAll(global)) {
            expected.forEach((want, i) => {
                const got = Number(m[i + 1]);
                if (got !== want) {
                    failures.push(`${owner} says ${label} is ${got}, but the reference says ${want}`);
                }
            });
        }
    }
}

/**
 * Relative markdown links, and the `#fragment` they point at. Anchors and
 * http(s)/mailto are exempt.
 */
function checkLinks(owner, content) {
    for (const m of content.matchAll(/\]\(([^)\s]+)\)/g)) {
        const target = m[1];
        if (/^(?:https?:|mailto:)/.test(target)) continue;
        const [rel, fragment] = target.split('#');
        const file = rel ? path.normalize(path.join(path.dirname(owner), rel)) : owner;
        if (rel && !shipsOrContains(file)) {
            failures.push(`${owner} links to ${target}, which resolves to ${file} and is not in the npm tarball`);
            continue;
        }
        if (fragment) checkFragment(owner, file, fragment);
    }
    // Same-file fragments, written without a path.
    for (const m of content.matchAll(/\]\(#([\w-]+)\)/g)) {
        checkFragment(owner, owner, m[1]);
    }
}

function checkFragment(owner, file, fragment) {
    const slugs = slugsOf(file);
    if (!slugs || !slugs.length) return; // no headings to judge against
    if (!slugs.includes(fragment)) {
        failures.push(`${owner} links to ${file}#${fragment}, but that file has no heading with that anchor (did you mean ${slugs.filter((s) => s.startsWith(fragment)).join(', ') || 'another heading'}?)`);
    }
}

/** A resolved path is acceptable if it ships, or is a directory that does. */
const shipsOrContains = (raw) => {
    // Callers hand over paths that may or may not keep a trailing separator
    // (`path.normalize('../references/')` does). Normalise once, here, so the
    // directory prefix cannot end up doubled.
    const rel = raw.replace(/[\\/]+$/, '');
    if (SHIPPED.has(rel)) return true;
    const prefix = `${rel}${path.sep}`;
    return [...SHIPPED].some((f) => f.startsWith(prefix));
};

/**
 * Bare `path/` mentions in code spans. A shipped doc must not name a
 * repo-only directory as a path — the same unshipped directory was once written
 * as a bare code span in a sibling file, and the link-syntax check could not see
 * it. Any top-level path a shipped doc names must resolve inside the tarball, so
 * a repo-only path has to be described in prose rather than written as one.
 */
function checkBarePaths(owner, content) {
    // A bare path may be written relative to the document (`generated/`, the
    // skill's own subfolders) or relative to the package root (`css/atomic.css`,
    // which every document refers to that way). Accept either: a shipped
    // document naming a shipped file is correct however it spells the path.
    const base = path.dirname(owner);
    for (const m of content.matchAll(/`([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*\/?)`/g)) {
        const token = m[1];
        if (!token.includes('/')) continue;
        // Doc-relative tokens belong to checkLinks, which resolves them properly.
        if (token.startsWith('..')) continue;
        // `node_modules/…` is a post-install location by construction: it exists
        // in the consumer's tree, not in the tarball. The agent skill teaches
        // paths from that root constantly, so it is not a stale reference.
        if (token.startsWith('node_modules/')) continue;
        const clean = (p) => path.normalize(p).replace(/[\\/]+$/, '');
        if (shipsOrContains(clean(token)) || shipsOrContains(clean(path.join(base, token)))) continue;
        failures.push(`${owner} names the path \`${token}\`, which resolves to neither \`${clean(token)}\` nor \`${clean(path.join(base, token))}\`; it is not in the npm tarball — describe it in prose instead`);
    }
}

/**
 * The skill is copied out of the package whole, so it may not send a reader
 * somewhere that does not travel with it. The framework's own docs stay in the
 * repo — a consumer holding `skills/atomic-css/` has no ARCHITECTURE.md, no
 * `demo/`, and no legend file, so a pointer to any of them is a dead end.
 *
 * The exemption is the stylesheet: telling a consumer which file to link is the
 * skill's job and that file lives outside it by design (`css/…`,
 * `node_modules/…`, an `npm install` of the package).
 */
const SKILL_FOREIGN = /\b(?:ARCHITECTURE|AGENTS)\.md\b|\bshort-names\.json\b|\bdemo\//;

function checkSkillSelfContained(owner, content) {
    for (const m of content.matchAll(
        /`([^`]+)`|\[([^\]]*)\]\(([^)\s]+)\)/g)) {
        const token = (m[1] || m[3] || '').trim();
        if (!token || /^(?:https?:|mailto:)/.test(token)) continue;
        // Intra-skill targets are exactly what self-contained means.
        if (token.startsWith('..') || token.startsWith('#') || token.startsWith('generated/')
            || token.startsWith('scripts/') || token.startsWith('references/')) continue;
        // The stylesheet package, which the skill must name.
        if (/^(?:css|css-max|css-template|node_modules)\//.test(token)) continue;
        const hit = token.match(SKILL_FOREIGN);
        if (hit) {
            const line = content.slice(0, m.index).split('\n').length;
            failures.push(
                `${owner}:${line} points at \`${token}\`, which is outside the skill. `
                + 'The skill is copied to consumers on its own, so that pointer is a dead end '
                + '— state the rule here, or let ARCHITECTURE.md link to this file instead.',
            );
        }
    }
}

/**
 * Every `§ Section` must resolve, in a document its line names or in the line's
 * own document. This walks the repo docs too, not just the shipped skill:
 * AGENTS.md and ARCHITECTURE.md are read by agents working on the framework and
 * are covered by no other check, so a § naming a section that has since been
 * renamed or deleted is invisible to CI without this.
 *
 * A section is a heading or a bolded rule label — this file's own doctrine lives
 * in bold paragraphs, not headings, and `§ The token contract` is how the rest of
 * the repo refers to it.
 *
 * Two tolerances, both deliberate. Resolution walks down the pointer's words, so
 * a § followed by a clause of prose (`§ Build discipline for the gitignore list`)
 * resolves on its leading words. And a heading may carry a suffix the pointer
 * omits (`§ The template bundle` -> `### The template bundle (\`css-template\`)`),
 * but only as a prefix — matching anywhere in the string would let `§ Markup
 * purity` pass against a heading that merely ends in the word "markup".
 */
const SKILL_DIR = 'skills/atomic-css';
const DOC_NAME = /[\w./-]*[\w-]+\.md\b/g;

function checkSectionPointers(owner, content) {
    const abs = path.join(root, owner);
    // A pointer may spell its target relative to itself, to the repo root, or
    // relative to the skill folder (the repo docs reach into it constantly).
    const docFrom = (token) => [path.dirname(owner), '.', SKILL_DIR]
        .map((base) => path.resolve(root, base, token))
        .find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
    const resolvers = new Map();
    const sectionsIn = (file) => {
        if (!resolvers.has(file)) {
            const text = fs.readFileSync(file, 'utf8');
            resolvers.set(file, new Set(
                [...text.matchAll(/^#{1,6} (.+)$/gm), ...text.matchAll(/\*\*(.+?)\*\*/g)]
                    .map((m) => m[1]),
            ));
        }
        return resolvers.get(file);
    };
    // A § on a line that itself bolds the same words must not resolve against
    // that line. ARCHITECTURE.md § Shared Rules is a table whose first column is
    // the doctrine name and whose second column points at it — self-satisfaction
    // made that table immune to this check for as long as the column existed.
    const ownerInlineBold = (line) => new Set(
        [...line.matchAll(/\*\*(.+?)\*\*/g)].map((m) => slug(m[1])));
    const slug = (h) => h.toLowerCase().replace(/[`*]/g, '')
        .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    content.split('\n').forEach((line, i) => {
        const scope = new Set([abs, ...[...line.matchAll(DOC_NAME)].map((m) => docFrom(m[0]))]
            .filter((f) => f && fs.statSync(f).isFile()));
        const onThisLine = ownerInlineBold(line);
        const names = [...scope].flatMap((f) => [...sectionsIn(f)]
            .map((h) => [slug(h), f]))
            .filter(([n, f]) => !(f === abs && onThisLine.has(n)))
            .map(([n]) => n);
        if (!names.length) return;
        for (const m of line.matchAll(/§+\s*([A-Za-z][\w -]*[A-Za-z])/g)) {
            const words = m[1].trim().split(/\s+/);
            const keys = Array.from({ length: words.length }, (_, n) => slug(words.slice(0, n + 1).join(' ')));
            // Exact match at any depth. The prefix fallback covers two real
            // shapes: a heading carrying a suffix the pointer omits (`§ The
            // template bundle` -> `### The template bundle (css-template)`), and
            // a § trailed by prose (`§ Build discipline for the gitignore
            // list`), which resolves on its leading words.
            //
            // Both need at least two words. On one word the fallback lets
            // `§ Global first` match `## Global tokens` — which is how a deleted
            // section stayed linked for a whole session — and `§ Markup purity`
            // match a heading that merely ends in the word. A pointer that *is*
            // one word (`§ Bundles`) is exempt: the word is the whole intent and
            // there is no trailing prose to over-read.
            const single = words.length === 1;
            const found = keys.some((k) => names.includes(k))
                || keys.some((k, i) => (single || i >= 1)
                    && names.some((h) => h.startsWith(k) || k.startsWith(h)));
            if (!found) {
                failures.push(
                    `${owner}:${i + 1} points at § ${m[1].trim()}, which is not a heading or a `
                    + `bolded rule in ${[...scope].map((f) => path.basename(f)).join(' or ')}`,
                );
            }
        }
    });
}

// Section pointers are checked in every doc, not just the shipped skill:
// AGENTS.md and ARCHITECTURE.md are read by agents working on the framework and
// are covered by no other check, so a § that names a section which has since
// been renamed or deleted is invisible to CI without this.
for (const file of [...AGENT_DOCS, ...PROSE, 'AGENTS.md', 'ARCHITECTURE.md']) {
    const abs = path.join(root, file);
    if (fs.existsSync(abs)) checkSectionPointers(file, fs.readFileSync(abs, 'utf8'));
}

// The agent-facing skill is read from disk: it ships, so its references must
// resolve in the tarball, and the class and variable names it teaches must
// exist. The generated reference is JSON, so it is checked as data above, not
// as prose here.
for (const file of AGENT_DOCS) {
    const abs = path.join(root, file);
    if (fs.existsSync(abs)) {
        const content = fs.readFileSync(abs, 'utf8');
        checkPointers(file, content);
        checkLinks(file, content);
        checkBarePaths(file, content);
        checkSkillSelfContained(file, content);
        checkCounts(file, content);
        checkElementSeeds(file, content);
        checkScaleSteps(file, content);
        checkRedundantRoot(file, content);
        checkRowGap(file, content);
        checkStateArmSeeds(file, content, false);
    }
}

// Stylesheets: the CSS-shape rules only.
for (const file of CONSUMER_STYLESHEETS) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    checkElementSeeds(file, content);
    checkScaleSteps(file, content);
    checkRowGap(file, content);
    checkStateArmSeeds(file, content, true);
    checkPrefixLiterals(file, content);
}

// SCSS sources: the prefix-literal rule only. The CSS-shape checks above are
// written against compiled output, and a literal-vs-variable question is only
// answerable from the source.
for (const abs of scssSources()) {
    const rel = path.relative(root, abs).split(path.sep).join('/');
    checkPrefixLiterals(rel, fs.readFileSync(abs, 'utf8'));
}


function reportFailures() {
    failures.forEach((f) => console.error(`FAIL: ${f}`));
}

if (CHECK) {
    if (failures.length) {
        reportFailures();
        console.error(`FAIL: ${failures.length} doc check(s) failed.`);
        process.exit(1);
    }
    const stale = outputs.filter(([rel, content]) => (
        !fs.existsSync(path.join(root, rel)) || fs.readFileSync(path.join(root, rel), 'utf8') !== content
    )).map(([rel]) => rel);
    if (stale.length) {
        stale.forEach((rel) => console.error(`FAIL: ${rel} is missing or stale — run \`npm run docs\``));
        console.error(`FAIL: ${stale.length} generated file(s) out of date.`);
        process.exit(1);
    }
    console.log(
        `PASS: ${OUT} is up to date `
        + `(${counts.minimalClasses} minimal / ${counts.maxClasses} max classes, `
        + `${counts.variables} variables, ${counts.legendEntries} legend tokens).`
    );
    process.exit(0);
}

outputs.forEach(([rel, content]) => {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    console.log(`WROTE: ${rel}`);
});

if (failures.length) {
    reportFailures();
    console.error(`FAIL: ${failures.length} doc check(s) failed; files were still written for inspection.`);
    process.exit(1);
}
console.log(
    `OK: ${counts.minimalClasses} minimal / ${counts.maxClasses} max classes, `
    + `${counts.variables} variables, ${counts.legendEntries} legend tokens.`
);
