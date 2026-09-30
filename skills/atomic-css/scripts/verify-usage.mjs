#!/usr/bin/env node
// verify-usage.mjs — check .at-* classes and --at-* variables in your files
// against atomic-css's generated reference.
//
//   node verify-usage.mjs <files...>
//   node verify-usage.mjs --bundle minimal --allow at-btn,at-card src/
//   node verify-usage.mjs --strict-vars --check-bundle css/atomic.min.css index.html
//
// Reference, resolved in order: --ref > this skill's own generated/ folder >
// node_modules/atomic-css (walking up) > the framework checkout. The generated
// folder travels with the skill, so a plain copy needs nothing installed.
// It is generated from the compiled CSS — the only truth for which names exist.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VALUE_FLAGS = new Set(["ref", "bundle", "allow", "check-bundle"]);
const flags = {};
const paths = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) paths.push(argv[i]);
  else if (VALUE_FLAGS.has(argv[i].slice(2))) flags[argv[i].slice(2)] = argv[++i];
  else flags[argv[i].slice(2)] = true;
}
if (paths.length === 0) {
  console.error("usage: verify-usage.mjs [--ref <CLASS-REFERENCE.json>] [--bundle both|minimal|max]\n" +
    "                        [--allow at-btn,at-card] [--strict-vars] [--check-bundle <file.css>] <files...>");
  process.exit(2);
}

const bundle = flags.bundle || "both";
const allow = new Set(
  (flags.allow || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

// This skill is designed to be copied out of the package and used on its own,
// so the generated reference travels with it. Resolve that first: the script's
// own folder is the one location guaranteed to be correct wherever the skill
// was installed.
const SELF_REF = "../generated/CLASS-REFERENCE.json";

// Fallbacks, for a checkout of the repository rather than an installed skill.
const REF_PATHS = [
  "skills/atomic-css/generated/CLASS-REFERENCE.json",
  "docs/CLASS-REFERENCE.json",
];

function findRef() {
  if (flags.ref) return existsSync(flags.ref) ? flags.ref : null;
  const selfDir = dirname(fileURLToPath(import.meta.url));
  const self = resolve(selfDir, SELF_REF);
  if (existsSync(self)) return self;
  for (let dir = process.cwd(); ; dir = dirname(dir)) {
    for (const rel of REF_PATHS) {
      const hit = join(dir, "node_modules/atomic-css", rel);
      if (existsSync(hit)) return hit;
    }
    if (dir === dirname(dir)) break;
  }
  for (const rel of REF_PATHS) {
    const local = resolve(rel);
    if (existsSync(local)) return local;
  }
  return null;
}

const refPath = findRef();
if (!refPath) {
  console.error("verify-usage: no CLASS-REFERENCE.json found.\n" +
    "  Looked in this skill's own generated/ folder, then node_modules/atomic-css/\n" +
    "  (walking up), then the working directory. If the skill was copied without its\n" +
    "  generated/ folder, restore it — or pass --ref <path> to a reference from\n" +
    "  `npm run docs`. Never resolve names from memory: a plausible class fails silently.");
  process.exit(2);
}

const ref = JSON.parse(readFileSync(refPath, "utf8"));
const classes = new Map(ref.classes.map((c) => [c.name, c]));
const variables = new Set(ref.variables.map((v) => v.name));

// The lookbehind skips data-at-theme / --at-p; the lookahead skips wildcards
// and placeholders, so `.at-ord-*` and `.at-fnt-<size>` are docs, not classes.
// `_` is a name character: `at-fc-4_6-6` is captured whole and validated.
const CLASS_RE = /(?<![A-Za-z0-9_-])at-[a-z0-9]+(?:[-_][a-z0-9]+)*(?![A-Za-z0-9_-])/g;
const VAR_RE = /--at-[a-z0-9]+(?:-[a-z0-9]+)*(?![A-Za-z0-9_*-])/g;
const SCANNABLE = /\.(html?|jsx?|tsx?|vue|svelte|astro|md|mdx|php|css|scss|sass|less|js|ts)$/i;

// Comments and <code> spans carry family examples, never markup. "" = skip.
// `closer` is remembered across lines, because `<!--` on its own line closes on
// a later one and a CSS `/* --- */` divider often spans three.
function strip(line, state) {
  if (state.closer) {
    const end = line.indexOf(state.closer);
    if (end === -1) return "";
    const close = state.closer;
    state.closer = null;
    line = line.slice(end + close.length);
  }
  for (const [open, close] of [["<!--", "-->"], ["/*", "*/"]]) {
    const at = line.indexOf(open);
    if (at === -1) continue;
    const end = line.indexOf(close, at + open.length);
    if (end === -1) {
      state.closer = close;
      return "";
    }
    line = line.slice(0, at) + line.slice(end + close.length);
  }
  if (/^\s*(\/\/|\*)/.test(line)) return "";
  return line.replace(/<code\b[^>]*>.*?<\/code>/gi, "");
}

function* walk(target) {
  if (!existsSync(target)) return;
  if (!statSync(target).isDirectory()) return yield target;
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    yield* walk(join(target, entry.name));
  }
}

const failures = [];
const warnings = [];
const fail = (f, n, msg) => failures.push(`${f}:${n}  ${msg}`);
const warn = (f, n, msg) => warnings.push(`${f}:${n}  ${msg}`);
const used = new Set();
const reads = new Map(); // "class|variable" -> first file:line
const declared = new Set();

for (const target of paths) {
  for (const file of walk(target)) {
    if (!SCANNABLE.test(file)) continue;
    const state = { closer: null };
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((raw, i) => {
        const line = strip(raw, state);
        if (!line.trim()) return;
        const at = { f: file, n: i + 1 };

        for (const m of line.matchAll(VAR_RE)) {
          // A variable is set by a declaration — `--at-p: 24px` in CSS, JS or a
          // style string. A `var(--at-p)` read is not a declaration.
          if (/^\s*:/.test(line.slice(m.index + m[0].length))) declared.add(m[0]);
          if (variables.has(m[0]) || allow.has(m[0].slice(2))) continue;
          // The reference covers variables the *bundles read*; a consumer owns
          // more (the documented button palette is not in it). --strict-vars
          // promotes this to a failure when every token should be a bundle read.
          const msg = `variable ${m[0]} is read by no atomic-css bundle — ${flags["strict-vars"] ? "typo?" : "consumer token? --allow it"}`;
          flags["strict-vars"] ? fail(at.f, at.n, msg) : warn(at.f, at.n, msg);
        }

        for (const m of line.matchAll(CLASS_RE)) {
          const name = m[0];
          if (allow.has(name)) continue;
          const known = classes.get(name);
          if (!known) {
            fail(at.f, at.n, `unknown class .${name} — not in the reference (or consumer-owned? --allow it)`);
            continue;
          }
          if (known.bundle === "max only" && bundle === "minimal") {
            fail(at.f, at.n, `.${name} is max-bundle only, but --bundle minimal is linked`);
          }
          used.add(name);
          for (const v of known.reads) if (!reads.has(`${name}|${v}`)) reads.set(`${name}|${v}`, at);
        }
      });
  }
}

if (flags["check-bundle"]) {
  const file = flags["check-bundle"];
  if (!existsSync(file)) fail(file, 0, "bundle file not found");
  else
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (line.includes("!important")) fail(file, i + 1, "!important found — shipped bundles are importance-free");
        if (line.includes("%%")) fail(file, i + 1, "%% template marker left unreplaced");
      });
}

// Inert is the default state, not an error — but it is the symptom of the #1
// consumer mistake, so report it. Checked after the scan, so a variable set in
// a later file still counts.
for (const [key, at] of reads) {
  if (!declared.has(key.split("|")[1])) warn(at.f, at.n, `inert: .${key.replace("|", " reads ")}, never set in the scanned files`);
}

const show = (label, rows) => rows.length && console.log(`\n${label} (${rows.length})\n${rows.map((r) => `  ${r}`).join("\n")}`);
console.log(`verify-usage: ${refPath}`);
console.log(`  bundle: ${bundle}${allow.size ? ` | allow: ${[...allow].join(", ")}` : ""}`);
console.log(`  ${paths.length} path(s) scanned, ${used.size} distinct framework classes used`);
show("FAIL", failures);
show("WARN", warnings);
console.log(
  !failures.length && !warnings.length
    ? "\nPASS"
    : `\n${failures.length ? "FAILED" : "passed with warnings"} — fix FAIL lines first; supply variables rather than guessing values.`,
);
process.exit(failures.length ? 1 : 0);
