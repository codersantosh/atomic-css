---
name: atomic-css
description: Apply the atomic-css utility framework — `.at-*` classes that read `--at-*` CSS variables, with a Flexbox grid, mobile-first breakpoint infixes, RTL variants and a WordPress template bundle. Use when writing or reviewing markup/CSS in a project that links an atomic-css bundle, when choosing between the minimal and max bundles, when theming with `--at-*` variables or a dark mode, or when a `.at-*` class "does nothing". Not for changing the framework itself — that is repo work, governed by the framework repo's own agent notes, which are not part of this skill.
license: GPL-2.0-or-later
---

# atomic-css (consumer)

How to consume the atomic-css 2.0 bundles: classes, tokens, components, and the traps that fail silently.

**Owner:** AI reference owner · **Authority:** the consumer contract for the atomic-css 2.0 bundles.

Every `.at-*` class applies a CSS property; a matching `--at-*` variable supplies
its value. **Neither works alone.**

```html
<div class="at-p">Inert — no value is set anywhere.</div>
<div class="at-p" style="--at-p: 24px">Works.</div>
```

`initial` is the deliberate fallback for almost every utility, so the framework
imposes nothing until you set a variable — if a utility "does nothing", you have
not set its variable.

## What this framework is for

It ships a Flexbox grid and 616 classes that between them
apply **102 distinct CSS properties**. Three tiers:

1. **Layout: the grid, always.** `.at-ctnr` → `.at-row` → `.at-col-{1..12}`,
   plus equal-share, `auto`, `cust`, the fifths ladder and `at-no-gtr`. 104 grid
   classes cover spans, containers and gutters — never hand-roll
   `flex: 0 0 50%`, `width: 33%` or a new breakpoint.
2. **Everything else: raw property or utility, per property.** The test is
   whether the value has a **second writer** — a theme, a state, a variant, a
   per-instance value or a generator: with one, class + variable; without one,
   write the property. **A property?** 102 are already applied by some class —
   when the lookup comes back empty, raw CSS is the *correct* answer.
3. **Generated markup: the pair is mandatory.** A generator needs one seam for a
   per-instance value — a class and its token; a generated `style` attribute is an
   inline style, blocked by `style-src` without `unsafe-inline`.

The tier-2 rule, with the decision table, is in
[patterns.md](references/patterns.md#one-source-one-declaration-when-a-token-is-not-warranted).

## Look before you write CSS

1. **Layout?** The grid — 104 classes cover spans, equal-share, `2m3`, `auto`,
   `cust`, containers and gutters.
2. **A property?** Look it up rather than writing the declaration; when no class
   applies it, raw CSS is correct.
3. **A component?** None ship — it is yours. The encoding follows the shape:
   **repeats with variants** → one identity class reading a private
   `--<prefix>-*` namespace; **unique** → the class writes the properties;
   **generated markup** → the seed, because the generator needs a channel to
   write through. See [references/patterns.md](references/patterns.md).
4. **Can you put a class on the element?** Yours → utility. Host markup you do
   not control → raw property; that is the one recorded exception.

**When you need a case this skill does not list**, take it and record it in your
project's architecture doc with the reason — do not leave it as an undocumented
local exception.

Two lookups answer step 2, and both outcomes are useful. Paths are relative to
this skill's folder — the one holding `SKILL.md`:

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
class, variable and legend token, so copying the folder into your agent's skills
directory is the whole install:

```bash
# <skills-dir> is the directory your agent reads skills from — for example
# .agents/skills (Command Code) or .opencode/skills (OpenCode).
cp -r node_modules/atomic-css/skills/atomic-css <skills-dir>/   # installed package
cp -r skills/atomic-css <skills-dir>/                           # clone of the repo
```

Then quit and restart your agent — skill paths are read once at startup. Agents
that register skill paths in config can point at the folder in place instead —
for example OpenCode's `opencode.json`:

```json
{ "skills": { "paths": ["node_modules/atomic-css/skills"] } }
```

The checker resolves names from this skill's own `generated/` folder first, so a
bare copy works with nothing else present. The stylesheet is a separate matter:
[setup.md](references/setup.md#install) owns installing it.

## Cheat sheet

Summary only — `generated/CLASS-REFERENCE.json` is the source of truth. The rules
a lookup cannot return:

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
- **Naming**: `at` + legend tokens, joined — `bg`+`cl` → `.at-bg-cl` /
  `--at-bg-cl`. Never invent a framework token —
  [classes.md#naming-grammar](references/classes.md#naming-grammar).
- **Infix position**: *middle* for columns/flex/justify/align (`.at-col-md-6`);
  *first* for display (`.at-lg-blk`) —
  [classes.md#infix-position-is-not-uniform](references/classes.md#infix-position-is-not-uniform).
- **`2m3` is a fifth** (20%), not 2.5-of-3 —
  [classes.md#the-2m3-fifths-ladder](references/classes.md#the-2m3-fifths-ladder).
- **Seeded reads** only declare a variable — they do nothing alone —
  [classes.md#seeded-reads-7](references/classes.md#seeded-reads-7).
- **A token needs a second writer.** One source, written once → the property;
  arms re-point the token and never restate it —
  [patterns.md](references/patterns.md#one-source-one-declaration-when-a-token-is-not-warranted).
- **One bundle**: max is a strict superset of minimal. Never link both; never
  link the template — [setup.md#what-you-get](references/setup.md#what-you-get).

**Pick the encoding from the shape of the design:**

| Shape | Encoding | Markup |
| --- | --- | --- |
| Repeats, has variants | identity class reading its own `--<prefix>-*` namespace; variants set only those | `at-btn at-btn-primary` |
| Unique, no variants | the class writes the properties; no token, no appliers | `brand-name` |
| Generated markup | the class owns the token, the applier is a fixed class | `unique-class at-cl at-p` |

Deeper: [semantic HTML](references/patterns.md#semantic-html-first) ·
[element defaults](references/patterns.md#element-defaults-are-bare-elements-never-where-wrapped) ·
[tokens and arms](references/patterns.md#arms-and-resting-values) ·
[private namespaces](references/patterns.md#why-the-namespace-is-private) ·
[readers](references/patterns.md#which-classes-read-a-channel-and-which-do-not) ·
[React and site builders](references/patterns.md#markup-targets) ·
[overriding](references/patterns.md#overriding) ·
[WCAG and the platform standards](references/patterns.md#standards-and-where-atomic-css-fits) ·
[production notes](references/production.md).

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

## Before you finish

```bash
node <this-skill>/scripts/verify-usage.mjs --allow at-btn,at-card src/ index.html
```

Then confirm by hand:

- [ ] Every `.at-*` class you used exists in `generated/CLASS-REFERENCE.json`; every non-framework name is a class **you** define.
- [ ] Every utility you applied has its variable set — no unexplained inert rules.
- [ ] Every `--at-*` token you seeded has a second writer. Any without one is a raw property.
- [ ] No property is written twice: the rule that styles it and an arm never both declare it.
- [ ] Layout is the grid and flex vocabulary; nothing hand-rolls a span, a gutter or a breakpoint.
- [ ] Exactly one bundle is linked; no `%%` markers survive; the template was never linked directly.
- [ ] Theming sets variables only; global element defaults are **raw properties** — never a `--at-*` seed on a bare element.
- [ ] Infix position matches the family (middle, or first for display).
- [ ] On RTL pages the `-rtl` bundle is linked and no variable value carries direction.
- [ ] `verify-usage.mjs` exits 0, or every remaining FAIL is understood and allowlisted — read the WARN lines too.
- [ ] If the project has no consumer palette, re-run with `--strict-vars` so unrecognised variables fail instead of warn.

Script behaviour and flags: `node <this-skill>/scripts/verify-usage.mjs --help`.

## What ships beside this skill

- `generated/CLASS-REFERENCE.json` — the generated lookup: every class,
  variable, breakpoint and token, derived from the compiled CSS. Never stale,
  never hand-edit; the checker reads it as its source of truth.
- The token legend is inside it, in the `legend` key — all 319 entries.

Before you ship — the consumer's decisions, and several fail silently
([production.md](references/production.md)):

- **Cascade layers.** Never wrap a bundle in `@layer` — an unlayered rule beats
  every layered one, so your CSS is silently ignored.
- **`color-scheme`** beside your dark-mode variables, or the UA chrome stays light.
- **CSP** — the inline-variable idiom is an inline style, blocked by
  `style-src` without `unsafe-inline`.

This folder is self-contained: every rule you need is in `SKILL.md` or
`references/`, and every name resolves against `generated/`. The one thing it
cannot carry is the stylesheet — [setup.md](references/setup.md) owns that
install.
