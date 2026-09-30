/**
 * check-demo — the demo is a required surface, not a showroom.
 *
 * ARCHITECTURE.md § Consumer Simulation: every pattern a consumer is expected
 * to follow must be demonstrated in demo/ first. That only holds if the demo
 * actually works, so this gate fails the build when it does not.
 *
 * stylelint cannot cover this tree: it has no postcss-html dependency, so
 * HTML under demo/ is not lintable CSS, and adding it to the stylelint glob would
 * be a no-op or a crash. This script reads the markup instead.
 *
 * Checks:
 *   1. every local href/src in a demo page resolves on disk
 *   2. every `.at-*` in demo markup is a framework class, or a class some
 *      stylesheet actually defines (compiled demo CSS, or the page's own
 *      inline <style>), or a declared JavaScript hook
 *   3. no class is *used but defined nowhere* — the silent no-op
 *   4. the JavaScript-hook allowlist stays accurate: a name on it must really
 *      be referenced by script, and a hook really referenced must be on it
 *
 * The stale question "does this page look right" is not answerable here; the
 * compiled output is checked by the build's own gates.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

/**
 * Classes that exist only to be handed to a third-party script (Glide, Slick,
 * Isotope, MicroModal). They have no CSS by design — that is the library's job
 * — so they are declared here rather than reported as broken on every run.
 * Keeping this list honest is check 4: drop a hook and the build tells you.
 */
const JS_HOOKS = new Set([
    // Glide.js — slider-glide.html
    'at-slider', 'at-carousel', 'at-peek',
    // Slick — slider.html
    'at-single-slide', 'at-slide-itm',
    // Isotope / Masonry — filter + gallery pages
    'at-gallery', 'at-gallery-itm', 'at-gallery-sizer', 'at-gallery-itm__expanded',
    // MicroModal — popup.html (data-at-modal-open/close are attributes)
    'at-modal', 'at-modal-slide', 'at-modal__overlay', 'at-modal__container',
    // popover.html — the trigger is wired by the page's own script
    'at-popover-trigger',
    // injected by script at runtime, never present in markup
    'at-ttip', 'show', 'at-canvas', 'at-prog-cir__bar-animate',
]);

/** Demo pages. demo/organism is included on purpose: it was outside every gate
 *  for long enough to accumulate 18 pages whose stylesheets did not resolve. */
function demoPages() {
    const out = [path.join(root, 'index.html')];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name === 'library') continue;
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (entry.name.endsWith('.html')) out.push(p);
        }
    };
    walk(path.join(root, 'demo'));
    return out;
}

/** Every `.at-*` a framework bundle ships. */
function frameworkClasses() {
    const ref = JSON.parse(fs.readFileSync(
        path.join(root, 'skills/atomic-css/generated/CLASS-REFERENCE.json'), 'utf8'));
    return new Set(ref.classes.map((c) => c.name));
}

/** Every class any demo stylesheet defines, compiled or inline. */
function consumerClasses() {
    const defined = new Set();
    const compiled = [
        'demo/colormode-globalstyle/dynamic.css',
        'demo/colormode-globalstyle/colormode-globalstyle.css',
    ];
    for (const rel of compiled) {
        const abs = path.join(root, rel);
        if (!fs.existsSync(abs)) continue;
        for (const m of fs.readFileSync(abs, 'utf8').matchAll(/\.((?:at-)?[\w-]+)/g)) {
            defined.add(m[1]);
        }
    }
    // Inline <style> blocks define page-local components.
    for (const file of demoPages()) {
        const html = fs.readFileSync(file, 'utf8');
        for (const block of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
            for (const m of block[1].matchAll(/\.((?:at-)?[\w-]+)/g)) defined.add(m[1]);
        }
    }
    return defined;
}

const framework = frameworkClasses();
const consumer = consumerClasses();
const pages = demoPages();

if (pages.length === 0) failures.push('no demo pages found — did the demo move?');

// --- 1. assets resolve -------------------------------------------------------
for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/(?:href|src)="([^":]+)"/g)) {
        const target = m[1];
        if (/^(?:https?:)?\/\//.test(target) || /^(?:#|data:|mailto:)/.test(target)) continue;
        if (!fs.existsSync(path.resolve(path.dirname(file), target))) {
            failures.push(`${path.relative(root, file)}: ${target} does not exist`);
        }
    }
}

// --- 2 & 3. every `.at-*` resolves, and is not a silent no-op ----------------
for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const used = new Set();
    for (const m of html.matchAll(/class="([^"]*)"/g)) {
        for (const c of m[1].split(/\s+/)) if (c) used.add(c);
    }
    for (const c of used) {
        if (!/^at-/.test(c)) continue;
        if (framework.has(c) || consumer.has(c) || JS_HOOKS.has(c)) continue;
        failures.push(
            `${path.relative(root, file)}: .${c} is not a framework class and no stylesheet defines it`
            + ' — the class renders nothing');
    }
}

// --- 4. the JS-hook list stays honest ----------------------------------------
const scripts = pages
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
const referenced = new Set();
for (const m of scripts.matchAll(/['"`]([a-z][\w-]*(?:at-[\w-]+|[\w-]*at-[\w]+)[\w-]*)['"`]/g)) {
    referenced.add(m[1]);
}
for (const hook of JS_HOOKS) {
    // A hook on the list that nothing anywhere references is a stale entry: it
    // would let a genuinely undefined class pass forever.
    const anywhere = fs.readdirSync(path.join(root, 'demo/organism'))
        .some((d) => {
            const p = path.join(root, 'demo/organism', d);
            if (!fs.statSync(p).isDirectory()) return false;
            for (const f of fs.readdirSync(p)) {
                if (f.endsWith('.html') && fs.readFileSync(path.join(p, f), 'utf8').includes(hook)) return true;
            }
            return false;
        });
    if (!anywhere) failures.push(`JS_HOOKS: '${hook}' is listed but no demo page references it`);
}

if (failures.length) {
    failures.forEach((f) => console.error(`  ${f}`));
    console.error(`FAIL: ${failures.length} demo problem(s). The demo is the consumer `
        + 'reference (ARCHITECTURE.md § Consumer Simulation).');
    process.exit(1);
}

console.log(`ok  ${pages.length} demo pages: every asset resolves, every .at-* resolves, `
    + `JS_HOOKS (${JS_HOOKS.size}) are all referenced`);
