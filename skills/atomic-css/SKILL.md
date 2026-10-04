---
name: atomic-css
description: Apply the atomic-css utility framework — `.at-*` classes that read `--at-*` CSS variables, with a Flexbox grid, mobile-first breakpoint infixes, RTL variants and a WordPress template bundle. Use when writing or reviewing markup/CSS in a project that links an atomic-css bundle, when choosing between the minimal and max bundles, when theming with `--at-*` variables or a dark mode, or when a `.at-*` class "does nothing". Not for changing the framework itself — that is repo work, governed by the framework repo's own agent notes, which are not part of this skill.
---

# atomic-css (consumer)

Every `.at-*` class applies a CSS property; a matching `--at-*` variable supplies
its value. **Neither works alone.**

```html
<div class="at-p">Inert — no value is set anywhere.</div>
<div class="at-p" style="--at-p: 24px">Works.</div>
```

`initial` is the deliberate fallback for almost every utility, so the framework
imposes nothing until you set a variable. **If a utility "does nothing", you have
not set its variable.**

## What this framework is for

It ships a Flexbox grid and 616 classes that between them
apply **102 distinct CSS properties**. Three tiers, and the middle one is a
judgement call — getting tier 2 wrong in either direction is the common mistake.

1. **Layout: the grid and flex vocabulary, always.** `.at-ctnr` → `.at-row` →
   `.at-col-{1..12}`, plus `at-col-auto`, `at-col-cust`, `at-col-2m3`,
   `at-no-gtr` and the flex, align and justify families. This holds in
   hand-written HTML, in React and in any JS framework, because a dashboard's
   layout is exactly where a second source of truth costs you — 104 grid classes
   cover spans, equal-share, `2m3`, `auto`, `cust`, containers and gutters. Never
   hand-roll `flex: 0 0 50%`, `width: 33%`, or a new breakpoint.
2. **Everything else: raw property or utility class, per property.**
   **A property?** 102 are already applied by some class, and whether you should
   use one is tier 2's question, not a lookup's. Look the name up to see whether
   a class exists at all; when none does, raw CSS is the *correct* answer — that
   is a finding about the framework, not a mistake. The test is whether the value
   has a **second writer** — a theme, a state, a second variant, a per-instance
   computed value, or a generator. Second writer → class plus variable. One
   source, written once → write the property. A token with nothing to re-point it
   is a wrapper around a constant.
3. **Generated markup: the pair is mandatory.** A block builder or a Gutenberg
   control writes a per-instance value, and a generated `style` attribute is an
   inline style that a `style-src` policy drops silently. The token is the one
   seam it writes through.

Both halves of tier 2 and the arm rule are stated once, with the full table, in
[patterns.md](references/patterns.md#one-source-one-declaration-when-a-token-is-not-warranted).

## Look before you write CSS

1. **Layout?** Tier 1 above — reach for the grid before writing any layout CSS.
2. **A property?** Tier 2's test, above.
3. **A component?** None ship — it is yours. The encoding follows the shape: a
   design that **repeats with variants** (a button, a card) gets one
   self-sufficient identity class reading a private `--<prefix>-*` namespace, and
   the markup carries only identity + variant. A design that is **unique** (a
   brand name, a logo) has one source, so the class writes the properties
   directly and the markup names nothing else — the class is what outranks a host
   stylesheet, not a utility. **Generated markup** is the third shape and takes
   the seed, because the generator needs a channel to write through. See
   [references/patterns.md](references/patterns.md).
4. **Can you put a class on the element?** If the element is yours, use the
   utility. If it is host markup you do not control — a CMS admin screen, a
   third-party widget — a raw property is the right tool there. That is the one
   recorded exception, not a loophole; it is stated in
   [references/patterns.md](references/patterns.md).

**When you need a case this skill does not list.** Take it, then record it in
your project's own architecture doc with the reason and the trade-off you gave
up — do not leave it as an undocumented local exception, and do not quietly
widen a stated rule. A rule that every consumer reinterprets locally is not
enforced anywhere; a rule with one written, argued exception is.

One lookup answers step 2, and both outcomes are useful:

Paths are relative to this skill's folder — the one holding `SKILL.md`.

```bash
# run from this skill's folder
REF=generated/CLASS-REFERENCE.json
node -p "JSON.parse(require('fs').readFileSync('$REF','utf8'))
  .classes.filter(c=>c.properties.includes('padding')).map(c=>c.name).join(' ')"
# at-p
node -p "…includes('aspect-ratio')…"   # nothing — no class, so write the property
```

## Install this skill

The skill is self-contained. `generated/` travels with it and carries every
class, variable and legend token, so copying the folder is the whole install:

```bash
mkdir -p .opencode/skills
cp -r node_modules/atomic-css/skills/atomic-css .opencode/skills/   # installed package
cp -r skills/atomic-css .opencode/skills/                          # clone of the repo
```

Then quit and restart your agent — skill paths are read once at startup.

If the package is installed, register the copy in place instead of duplicating
it, via `opencode.json`:

```json
{ "skills": { "paths": ["node_modules/atomic-css/skills"] } }
```

The checker resolves names from this skill's own `generated/` folder first, so a
bare copy works with nothing else present. If that folder is missing it exits 2
rather than resolving names from memory.

The stylesheet is a separate matter and is **not** part of this skill.
[references/setup.md](references/setup.md#install) owns installing it, including
the pinned-commit install, the vendored-file path, and why `npm install
atomic-css` is the wrong package. There is also no JS entry point to import —
link the CSS file path.

## Cheat sheet (summary only — `generated/CLASS-REFERENCE.json` is the source of truth)

Only the rules a lookup cannot return. Everything else is one file away:
[references/classes.md](references/classes.md) for the tables,
[patterns.md](references/patterns.md) for how to design with them.

- **You declare every global token; no bundle ships `:root`.** Only three carry
  direct fallbacks — `--at-ctnr 1140px`, `--at-ctnr-min 1100px`, `--at-gtr 15px`;
  everything else falls back to `initial` (inert) or a keyword —
  [patterns.md#global-tokens](references/patterns.md#global-tokens).
- **Breakpoints**: `sm 576`, `md 768`, `lg 992`, `xl 1200`, `xxl 1400`,
  `min-width` only. There is **no `xs`** —
  [classes.md#breakpoints](references/classes.md#breakpoints).
- **Gap chain**: `--at-gap` unset → `0` for grid columns, `15px` for `.at-vrt`;
  `.at-row-gap`/`.at-col-gap` fall back to `--at-gap` —
  [classes.md#gap-chain](references/classes.md#gap-chain).
- **Naming**: `at` + legend tokens, and the class and its variable share the
  joined string, so `bg`+`cl` → `.at-bg-cl` / `--at-bg-cl`. Never invent a token —
  [classes.md#naming-grammar](references/classes.md#naming-grammar).
- **Infix position**: *middle* for columns/flex/justify/align (`.at-col-md-6`,
  `.at-flx-md-row`); *first* for display (`.at-lg-blk`) —
  [classes.md#infix-position-is-not-uniform](references/classes.md#infix-position-is-not-uniform).
- **`2m3` is a fifth** (20%), not 2.5-of-3 —
  [classes.md#the-2m3-fifths-ladder](references/classes.md#the-2m3-fifths-ladder).
- **Seeded reads** only declare a variable — they do nothing alone —
  [classes.md#seeded-reads-7](references/classes.md#seeded-reads-7).
- **A token needs a second writer.** A theme, a state, a second variant, a
  per-instance value or a generator → class + variable. One source, written once
  → write the property. Arms re-point the token and never restate it —
  [patterns.md](references/patterns.md#one-source-one-declaration-when-a-token-is-not-warranted).
- **One bundle**: max is a strict superset of minimal. Never link both; never
  link the template — [setup.md#what-you-get](references/setup.md#what-you-get).

Verify any name you have not seen before in
`generated/CLASS-REFERENCE.json`.

## Do / Don't

| Don't | Do |
| --- | --- |
| `npm install atomic-css` | `github:codersantosh/atomic-css#2.0.0` |
| Link minimal **and** max | Link one: max only if you need `at-ord-*` / `at-ofst-*` / `at-prt-*` |
| Link `atomic-template.css` | Transform it into your own build (breakpoints + `%%IMPORTANT%%`) |
| Seed `--at-p` **and** write `padding:` in the same rule | Set `--at-p` alone; the class applies the property |
| Reach for `at-p` to write one fixed `padding` that nothing varies | Write `padding` in your own rule — one source, one declaration |
| Hand-roll a layout (`flex: 0 0 50%`, `width: 33%`, a new breakpoint) | `.at-row` + `.at-col-md-6` — 104 grid classes cover it |
| Assume `at-p` means `1rem` | Read the fallback column; `initial` means inert |
| Invent `at-mt-4`, `at-flex-md-row`, `at-xs-col-6` | Look the name up; a wrong name fails silently |
| Seed a token only inside `:hover` / `:focus` / a media block | Declare the resting value too — the arm alone leaves the normal state inherited |
| Restate a property inside a `@media`, `[data-at-theme]` or `:hover` arm | Re-point the token; the property is written once, at the resting rule |
| Route a component's own measurement through the shared `--at-gap` | Use a private `--<prefix>-*` value |
| Use `--at-x: unset` to clear an inherited token | It computes to `inherit`; use `initial` |
| Override a utility with `!important` | Redefine the variable; bundles carry **zero** `!important` |
| Read a bare `var(--at-ctnr)` in your CSS | Use `var(--at-ctnr, 1140px)` or declare the token |
| Put `left`/`right` inside a variable value | rtlcss mirrors declarations, not `var()` contents |
| Expect `.at-txt` / `.at-btn-*` to exist | They are **yours**; no bundle defines them |
| Write a generated instance's value as a `style` attribute | Seed a token and let the applier apply it — inline styles need `unsafe-inline` |
| Expect `.at-img`, `.at-vid`, `.at-aud`, `.at-map` | Removed in 2.0 — declare `img` defaults yourself |

## Before / after

```html
<!-- ✗ class with no value, and a variable set where no class reads it -->
<div class="at-p"><span style="--at-cl: red">text</span></div>

<!-- ✓ the class is on the element that uses the property; the variable is anywhere on it or an ancestor -->
<div class="at-p at-cl" style="--at-p: 24px; --at-cl: #c00">text</div>
```

```css
/* ✗ theming by property — not composable, breaks every utility */
[data-at-theme='dark'] .card { color: #fff; background: #161616; }

/* ✓ theming by variable — every utility follows, no class changes */
[data-at-theme='dark'] { --at-cl: #fff; --at-bg-cl: #161616; }
```

```css
/* ✗ a token around a constant — nothing re-points it, so it is a wrapper */
/*    (this is what a static hero title should NOT look like) */
.hero-title { --at-fnt-sz: 72px; --at-cl: #fff; }

/* ✓ one source, one declaration; the class still outranks an h1 rule */
.hero-title { font-size: 72px; color: #fff; }
```

For a component that *does* vary, the values sit in the rule and the classes in
the markup apply them — a worked shell in
[patterns.md](references/patterns.md#which-classes-read-a-channel-and-which-do-not),
and the consumer contract, element defaults, the `.at-btn` contract and dark
mode in [patterns.md](references/patterns.md).

## Before you finish

```bash
node <this-skill>/scripts/verify-usage.mjs --allow at-btn,at-card src/ index.html
```

Then confirm by hand:

- [ ] Every `.at-*` class you used exists in `generated/CLASS-REFERENCE.json`; every non-framework name is a class **you** define.
- [ ] Every utility you applied has its variable set — no unexplained inert rules.
- [ ] Every `--at-*` token you seeded has a second writer — a theme, a state, a variant, a per-instance value or a generator. Any without one is a raw property.
- [ ] No property is written twice: the rule that styles it and an arm never both declare it.
- [ ] Layout is the grid and flex vocabulary; nothing hand-rolls a span, a gutter or a breakpoint.
- [ ] Exactly one bundle is linked; no `%%` markers survive; the template was never linked directly.
- [ ] Theming sets variables only; global element defaults are **raw properties** on the element — never a `--at-*` seed on a bare element, which would set that token for its whole subtree.
- [ ] Infix position matches the family (middle, or first for display).
- [ ] On RTL pages the `-rtl` bundle is linked and no variable value carries direction.
- [ ] `verify-usage.mjs` exits 0, or every remaining FAIL is understood and allowlisted.
- [ ] Read the WARN lines — do not skip them. A WARN is either a consumer token you should `--allow`, or a typo like `--at-z-id` for `--at-z-idx`.
- [ ] If the project has no consumer palette (no `--at-primary`, `--at-white`, …), re-run with `--strict-vars` so unrecognised variables fail instead of warn.

Script behaviour and flags: `node <this-skill>/scripts/verify-usage.mjs --help`
(usage on stderr with no paths).

## What ships beside this skill, in an installed project

- `generated/CLASS-REFERENCE.json` — the generated lookup, every class,
  variable, breakpoint and token, derived from the compiled CSS. Never stale,
  never hand-edit. `verify-usage.mjs` reads it as its source of truth, and the
  `node -p` recipes above are how you read it. See `generated/README.md` for
  where a wrong entry actually gets fixed.
- The token legend is already inside this skill, in the `legend` key of
  `generated/CLASS-REFERENCE.json` — see
  [classes.md#naming-grammar](references/classes.md#naming-grammar) to look one
  up.

Before you ship — these are the consumer's decisions, not the framework's, and
several fail silently. See [production.md](references/production.md):

- **Cascade layers.** Never wrap a bundle in `@layer` — an unlayered rule beats
  every layered one regardless of specificity, so your CSS is silently ignored.
- **`color-scheme`** beside your dark-mode variables, or the UA chrome stays light.
- **CSP** — the inline-variable idiom is an inline style, blocked by
  `style-src` without `unsafe-inline`.

This folder is self-contained: every rule you need is in `SKILL.md` or
`references/`, and every name resolves against `generated/`. The one thing it
cannot carry is the stylesheet itself — that is a separate install, owned by
[setup.md](references/setup.md).

Everything from `SKILL.md` down to `references/` is hand-written; everything in
`generated/` is generated. Know which one you are editing.
