---
name: atomic-css
description: Apply the atomic-css utility framework — `.at-*` classes that read `--at-*` CSS variables, with a Flexbox grid, mobile-first breakpoint infixes, RTL variants and a WordPress template bundle. Use when writing or reviewing markup/CSS in a project that links an atomic-css bundle, when choosing between the minimal and max bundles, when theming with `--at-*` variables or a dark mode, or when a `.at-*` class "does nothing". Not for changing the framework itself — that is the framework repo's own AGENTS.md, which is not part of this skill.
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
not set its variable.** That is the single most common consumer mistake.

## Look before you write CSS

The framework already ships a Flexbox grid and 616 classes that between them
apply **102 distinct CSS properties**. Reusing those is the whole point; a second
declaration of the same property is not a style choice, it is a second source of
truth that will drift. Settle each question in this order:

1. **Layout?** `.at-ctnr` → `.at-row` → `.at-col-6`. 104 grid classes: 12 spans
   × 6 breakpoints, plus equal-share, `2m3`, `auto`, `cust`, the containers and
   the gutter classes. Do not hand-roll `flex: 0 0 50%`, `width: 33%`, or a new
   breakpoint.
2. **A property?** 102 are already applied by some class. Look it up rather
   than writing the declaration. When the lookup comes back empty, raw CSS is
   the *correct* answer — that is a finding about the framework, not a mistake.
3. **A component?** None ship — it is yours. But the encoding depends on the
   shape: a design that **repeats with variants** (a button, a card) gets one
   self-sufficient identity class reading a private `--<prefix>-*` namespace,
   and the markup carries only identity + variant. A design that is **unique**
   (a brand name, a logo) seeds the channels and puts the reader classes on the
   element. See [references/patterns.md](references/patterns.md).
4. **Can you put a class on the element?** If the element is yours, use the
   utility. If it is host markup you do not control — a CMS admin screen, a
   third-party widget — a raw property is the right tool there. That is one of
   two recorded exceptions, not a loophole; the other is a media or state arm.
   Both are stated in [references/patterns.md](references/patterns.md).

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

## When to use this skill

Use it when: you write or review markup/CSS in a project that links
`atomic.css`, `atomic-max.css` or the template build; you pick a bundle; you
theme tokens or wire a dark mode; a `.at-*` class has no visible effect; you add
a component that should be built from utilities; or you transform the template
for WordPress/PHP.

Do not use it for: changing the framework itself (its source, bundles, or
generated docs — that is work in the framework repo, whose `AGENTS.md` governs
it and is not part of this skill), projects on a different utility framework
(Tailwind, Bootstrap, …), or deciding component *design* — this framework ships
no component CSS, so every component class is yours to define.

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

Each row is the rule. The table behind it is stated once, in the reference.

- **Grid**: `.at-ctnr` → `.at-row` → `.at-col-{1..12}`, plus `at-col-auto`, `at-col-cust`, `at-no-gtr`. Reach for these before writing any layout CSS — [classes.md#grid-104-classes](references/classes.md#grid-104-classes).
- **Design**: semantic HTML first (classes restyle semantics, never replace them); global first, local second (raw properties on the element, so every utility class outranks them); mobile first (base rules *are* the small screen). The framework also leaves you focus rings, `prefers-reduced-motion`, contrast, and two scales to name yourself — a z-index scale and a spacing scale — [patterns.md](references/patterns.md#how-to-design-with-this-framework).
- **Naming**: `at` + legend tokens; the class and its variable share the joined string, so `bg`+`cl` → `.at-bg-cl` / `--at-bg-cl`. Never invent a token — [classes.md#naming-grammar](references/classes.md#naming-grammar).
- **Infix position**: *middle* for columns/flex/justify/align (`.at-col-md-6`, `.at-flx-md-row`); *first* for display (`.at-lg-blk`) — [classes.md](references/classes.md#infix-position-is-not-uniform).
- **Breakpoints**: `sm 576`, `md 768`, `lg 992`, `xl 1200`, `xxl 1400`, `min-width` only. There is **no `xs`** — [classes.md#breakpoints](references/classes.md#breakpoints).
- **Only three defaults exist**: `--at-ctnr 1140px`, `--at-ctnr-min 1100px`, `--at-gtr 15px`. Everything else falls back to `initial` (inert) or a keyword. **No bundle ships `:root` variables** — [classes.md](references/classes.md#variables-93-read-by-the-bundles).
- **Gap chain**: `--at-gap` unset → `0` for grid columns, `15px` for `.at-vrt`; `.at-row-gap`/`.at-col-gap` fall back to `--at-gap` — [classes.md#gap-chain](references/classes.md#gap-chain).
- **`2m3` is a fifth** (20%), not 2.5-of-3.
- **Seeded reads** only declare a variable — they do nothing alone — [classes.md](references/classes.md#seeded-reads-7).
- **Does it read a channel?** Most classes read no variable (all flex/align/display — `at-flx`, `at-flx-col`, `at-jfy-cont-btw`); those that do are **inert until seeded**. Check `reads[]` in the reference. `at-bdr` is three channels — [patterns.md](references/patterns.md#which-classes-read-a-channel-and-which-do-not).
- **One bundle**: max is a strict superset of minimal. Never link both; never link the template — [setup.md](references/setup.md#what-you-get).

Verify any name you have not seen before in
`generated/CLASS-REFERENCE.json`. Full tables:
[references/classes.md](references/classes.md).

## Do / Don't

| Don't | Do |
| --- | --- |
| `npm install atomic-css` | `github:codersantosh/atomic-css#c51609b` |
| Link minimal **and** max | Link one: max only if you need `at-ord-*` / `at-ofst-*` / `at-prt-*` |
| Link `atomic-template.css` | Transform it into your own build (breakpoints + `%%IMPORTANT%%`) |
| Write `padding: 24px` where `at-p` exists | Set `--at-p`; the class applies the property |
| Hand-roll a layout (`flex: 0 0 50%`, `width: 33%`, a new breakpoint) | `.at-row` + `.at-col-md-6` — 104 grid classes already cover it |
| Set `--at-p` **and** write `padding:` in the same rule | The property is dead — the class already applies it; set the variable only |
| Carry eight classes on every button instance | Let a repeating identity class own its box; markup carries identity + variant |
| Set a component-local value in a shared channel (`--at-gap`) | It corrupts the token for every descendant; use a private `--<prefix>-*` value |
| Assume `at-p` means `1rem` | Read the fallback column; `initial` means inert |
| Invent `at-mt-4`, `at-flex-md-row`, `at-xs-col-6` | Look the name up; a wrong name fails silently |
| Put the infix first outside display (e.g. `at-md-` + flex) | Infix in the middle: `.at-flx-md-row` |
| Override a utility with `!important` | Redefine the variable; bundles carry **zero** `!important` |
| Read a bare `var(--at-ctnr)` in your CSS | The framework declares no `:root`; use `var(--at-ctnr, 1140px)` or declare it |
| Set properties in a theme block | Set variables — that is what makes theming composable |
| Expect `.at-txt` / `.at-btn-*` to exist | They are **yours**; no bundle defines them |
| Expect `.at-img`, `.at-vid`, `.at-aud`, `.at-map` | Removed in 2.0 — declare `img` defaults yourself |
| Put `left`/`right` inside a variable value | rtlcss mirrors declarations, not `var()` contents |

## Before / after

```html
<!-- ✗ class with no value, and a variable set where no class reads it -->
<div class="at-p"><span style="--at-cl: red">text</span></div>

<!-- ✓ the class is on the element that uses the property; the variable is anywhere on it or an ancestor -->
<div class="at-p at-cl" style="--at-p: 24px; --at-cl: #c00">text</div>
```

```css
/* ✗ restating the property — the framework already applies it via the class */
.card { padding: 24px; }

/* ✓ supply the value, let .at-p apply it */
.card { --at-p: 24px; }
```

```css
/* ✗ a component owning its own properties */
.shell { display: flex; height: 100vh; overflow: hidden; }

/* ✓ values here; the classes in the markup apply the properties */
.shell { --at-h: 100vh; --at-ovf: hidden; }
```

```html
<!-- at-flx reads no channel; at-h and at-ovf each need the seed above -->
<div class="shell at-flx at-h at-ovf"></div>
```

```css
/* ✗ theming by property — not composable, breaks every utility */
[data-theme='dark'] .card { color: #fff; background: #161616; }

/* ✓ theming by variable — every utility follows, no class changes */
[data-theme='dark'] { --at-cl: #fff; --at-bg-cl: #161616; }
```

Longer, real patterns — the consumer contract, the zero-specificity base
layer, media defaults, the `.at-btn` contract, dark mode:
[references/patterns.md](references/patterns.md).

## Before you finish

```bash
node <this-skill>/scripts/verify-usage.mjs --allow at-btn,at-card src/ index.html
```

Then confirm by hand:

- [ ] Every `.at-*` class you used exists in `generated/CLASS-REFERENCE.json`; every non-framework name is a class **you** define.
- [ ] Every utility you applied has its variable set — no unexplained inert rules.
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

- `generated/CLASS-REFERENCE.md` / `.json` — the generated lookup, every class,
  variable, breakpoint and token, derived from the compiled CSS. Never stale,
  never hand-edit. `verify-usage.mjs` reads the JSON as its source of truth.
  See `generated/README.md` for where a wrong entry actually gets fixed.
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

In the framework package (not in this folder), for the framework's own docs:

- `README.md` — install, bundle detail, the full button contract, WordPress.
- `short-names.json` — the same 315 legend entries, the source the generated
  `legend` key is built from.
- `ARCHITECTURE.md` — the rules the framework follows, for when you need to know
  why rather than what.

Everything from `SKILL.md` down to `references/` is hand-written; everything in
`generated/` is generated. Know which one you are editing.
