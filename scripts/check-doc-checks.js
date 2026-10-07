#!/usr/bin/env node
// check-doc-checks.js — negative tests for the doc checks in generate-docs.js.
//
// Every gate in this repo was written to pass on a correct tree. That is also
// exactly how a broken gate hides: two of the bugs in checkSectionPointers sat
// undetected for a whole session because the docs it read happened to satisfy
// it. A gate that has never been seen to fail has not been tested.
//
// Each case below injects one fault, asserts the gate fires (or, for the
// tolerance cases, stays quiet), restores the file, and asserts the tree is
// clean again. It edits files and rewinds them, so it is not part of `verify`;
// run it after changing a doc check.
//
//   node scripts/check-doc-checks.js

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function probe() {
    let out = '';
    try {
        out = execFileSync('node', ['scripts/generate-docs.js', '--check'],
            { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
        out = `${e.stdout || ''}${e.stderr || ''}`;
    }
    return out;
}

const pointerFailures = (out) => (out.match(/^FAIL: \S+:\d+ points at § /gm) || []).length;
const inertFailures = (out) => (out.match(/is an example built only from inert classes/g) || []).length;
const headerFailures = (out) => (out.match(/has no '\*\*Owner:\*\*/g) || []).length;
const wsFailures = (out) => (out.match(/has trailing whitespace/g) || []).length;
const headingFailures = (out) => (out.match(/heading (?:ends with punctuation|carries a manual section number)/g) || []).length;
const linkFailures = (out) => (out.match(/has no heading with that anchor/g) || []).length;

/**
 * @param {string} name    what the case proves
 * @param {string} rel     file to fault, repo-relative
 * @param {string} find    text to replace
 * @param {string} replace its replacement
 * @param {number} expect  failure count the gate must report after the edit
 * @param {Function} count failure line matcher
 */
function check(name, rel, find, replace, expect, count = pointerFailures) {
    const abs = path.join(root, rel);
    const original = fs.readFileSync(abs, 'utf8');
    if (!original.includes(find)) {
        console.error(`  ERROR ${name}\n         fixture not present in ${rel}: ${JSON.stringify(find.slice(0, 60))}`);
        return false;
    }
    let ok = false;
    try {
        fs.writeFileSync(abs, original.replace(find, replace));
        const seen = count(probe());
        ok = seen === expect;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name} — ${seen} failure(s), expected ${expect}`);
    } finally {
        fs.writeFileSync(abs, original);
    }
    return ok;
}

const A = 'ARCHITECTURE.md';
const P = 'skills/atomic-css/references/patterns.md';
const AG = 'AGENTS.md';
const D = 'README.md';

const cases = [
    // --- checkSectionPointers: must fire
    () => check('§ pointer names a section that exists nowhere', A,
        '`references/patterns.md` § Mobile first',
        '`references/patterns.md` § Breakpoint ladders', 1),
    () => check('§ pointer breaks when its heading is renamed', P,
        '## Semantic HTML first', '## Markup semantics', 1),
    () => check('a line\'s own bold cannot satisfy its own § pointer', P,
        '**Global First, Local Second.**', 'Global first, local second.', 1),
    () => check('one-word § pointer breaks when its heading is renamed', P,
        '## Components: one owner per class',
        '## Component ownership', 1),

    // --- checkSectionPointers: must stay quiet (tolerances, not bugs)
    () => check('§ followed by prose resolves on its leading words', AG,
        '§ Build discipline for the gitignore list.', '§ Build discipline.', 0),
    () => check('one-word § pointer resolves against a suffixed heading', P,
        '## Components: one owner per class',
        '## Components: one owner per class, and the variant registry', 0),

    // --- checkInertExamples: must fire
    () => check('an example of only inert classes is rejected', P,
        '<a href="#main" class="skip-link">Skip to content</a>',
        '<a href="#main" class="at-pos at-w at-h at-ovf at-clp-pth at-white-sp at-z-idx">\n  Skip to content\n</a>', 1, inertFailures),
    () => check('one seeded class makes an example live again', P,
        '<figure class="wp-block-card at-cl at-p">',
        '<figure class="wp-block-card at-cl at-p" style="--at-p: 1rem">', 0, inertFailures),

    // --- documentation standard: must fire
    () => check('a missing owner line is rejected', D,
        '**Owner:** developer/user documentation owner · **Authority:** human onboarding and usage.',
        '**Owner:** none.', 1, headerFailures),
    () => check('trailing whitespace is rejected', D,
        '## Grid', '## Grid ', 1, wsFailures),
    () => check('a heading ending in punctuation is rejected', D,
        '## Quick start', '## Quick start:', 1, headingFailures),
    () => check('a manual section number is rejected', D,
        '## Bundles', '## 3. Bundles', 1, headingFailures),
    () => check('a link to a missing section is rejected', D,
        '[Grid](#grid)', '[Grid](#grids)', 1, linkFailures),
];

let passed = 0;
for (const c of cases) if (c()) passed += 1;

// The tree must be untouched, or a case leaked an edit.
const leaked = probe();
const clean = pointerFailures(leaked) === 0 && inertFailures(leaked) === 0;
console.log(`\n  ${passed}/${cases.length} cases behaved as expected`);
if (!clean) {
    console.error('  FAIL the tree did not return to a clean state — a case leaked an edit');
    process.exit(1);
}
console.log(`  ok   tree restored, no fault left behind`);
process.exit(passed === cases.length ? 0 : 1);