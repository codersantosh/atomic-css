# Using Atomic CSS

Task-oriented guide for applying atomic-css classes. Every framework class named here
exists in a shipped bundle, and every variable named here is either read by a bundle or
built from tokens in `short-names.json`. `npm run docs:check` enforces both, so this
file cannot drift into documenting something that was renamed or removed.

Your own component and marker class names are yours to define and deliberately do not
appear in the reference — see [§9](#9-what-the-framework-does-not-ship).

| You want | Read |
| --- | --- |
| The idea, in one rule | [§1](#1-the-one-rule) |
| Which file to link | [§2](#2-pick-a-bundle) |
| Columns and rows | [§3](#3-grid) |
| Per-breakpoint classes | [§4](#4-responsive) |
| Flexbox and `display` | [§5](#5-flex-and-display-utilities) |
| Margins, padding, colour, type | [§6](#6-property-utilities) |
| Overlays, shapes, sticky, vertical layout | [§7](#7-structural-classes) |
| Dark mode, themes, tokens | [§8](#8-theming) |
| What you must write yourself | [§9](#9-what-the-framework-does-not-ship) |
| Right-to-left | [§10](#10-rtl) |
| WordPress / PHP builds | [§11](#11-the-template-bundle) |
| The full lookup table | [`docs/CLASS-REFERENCE.md`](docs/CLASS-REFERENCE.md) |

---

## 1. The one rule

**A class applies the property. A variable supplies the value. You need both.**

```html
<div class="at-p">Inert — the class applies padding, but nothing supplies a value.</div>
```

```html
<div class="at-p" style="--at-p: 24px">Works.</div>
```

```css
.card { --at-p: 24px; }        /* value anywhere on the element or an ancestor */
```

```html
<div class="at-p card">Works — the variable inherits down.</div>
```

The variable may be set on the element, on any ancestor, or inline. The class needs
only to be on the element that uses the property.

The fallback for almost every utility is `initial`, which is the point: the framework
imposes nothing until you supply a value. If a utility "does nothing", you have not set
its variable.

**Don't**

- Don't write raw CSS for a property that has a utility — set the variable instead. A
  consumer override that redefines variables beats writing the property twice.
- Don't invent a class or a variable. Look it up in
  [`docs/CLASS-REFERENCE.md`](docs/CLASS-REFERENCE.md) first.
- Don't assume a class carries a value. `at-p` is not `1rem`.

---

## 2. Pick a bundle

| Bundle | File | Use when |
| --- | --- | --- |
| Minimal | `css/atomic.css` | Default. Grid, flex, display, property and structural classes. |
| Max | `css-max/atomic-max.css` | You also need `at-ord-*`, `at-ofst-*` or `at-prt-*`. |
| Template | `css-template/atomic-template.css` | WordPress/PHP builds only. Never link it. |

Exact file sizes and class counts are in
[`docs/CLASS-REFERENCE.md`](docs/CLASS-REFERENCE.md#at-a-glance), generated from the
CSS so they cannot go stale.

Each shipped bundle has a `.min`, a `-rtl` and a `.min-rtl` variant:

```
css/atomic.css            css/atomic.min.css
css/atomic-rtl.css        css/atomic.min-rtl.css
css-max/atomic-max.css    css-max/atomic-max.min.css
css-max/atomic-max-rtl.css    css-max/atomic-max.min-rtl.css
```

```html
<link rel="stylesheet" href="css/atomic.min.css">
```

**Don't**

- Don't link the minimal and max bundles together. Max is a strict superset, so you get
  every minimal rule twice.
- Don't link `css-template/atomic-template.css` in a page. It contains `%%` markers and
  is a build input, not a stylesheet.
- Don't link a non-RTL file on an RTL page — see [§10](#10-rtl).

---

## 3. Grid

12 columns, flexbox, gap-aware. The gutter is a variable, so it is themeable.

```html
<div class="at-ctnr">
  <div class="at-row">
    <div class="at-col-8">8</div>
    <div class="at-col-4">4</div>
  </div>
</div>
```

### Containers

| Class | Does |
| --- | --- |
| `.at-ctnr` | Centred, `max-width: var(--at-ctnr, 1140px)`, gutter padding |
| `.at-ctnr-min` | Same at `var(--at-ctnr-min, 1100px)` |
| `.at-ctnr-fld` | Fluid — full width, no max |

### Row and columns

| Class | Does |
| --- | --- |
| `.at-row` | `display: flex; flex-wrap: wrap`, plus negative margins that cancel the gutter |
| `.at-col-1` … `.at-col-12` | Span that many of the 12 columns, gap-aware |
| `.at-col-auto` | Size to content |
| `.at-col-cust` | Span `--at-cust-w` — **no fallback, inert until you set it** |
| `.at-col-2m3` | One fifth (`20%`), for fifths-based layouts. The token name is a misnomer — see below. |
| `.at-no-gtr` | Cancels the gutter on the row and its direct columns |

```html
<div class="at-ctnr">
  <div class="at-row at-no-gtr">
    <div class="at-col-6">Edge to edge</div>
  </div>
</div>
```

### Gaps

| Class | Reads | Inert default |
| --- | --- | --- |
| `.at-gap` | `--at-gap` | `initial` — no gap unless you set it |
| `.at-row-gap` | `--at-row-gap`, falling back to `--at-gap` | follows `--at-gap` |
| `.at-col-gap` | `--at-col-gap`, falling back to `--at-gap` | follows `--at-gap` |

```css
:root { --at-gap: 24px; }
```

`.at-row-gap` and `.at-col-gap` inherit `--at-gap` automatically, so you normally set
only `--at-gap`.

`2m3` is a misleading token name: the class is a fifth (`$grid-columns5: 5`), shipping
`20%`, and `.at-ofst-2m3` (max bundle only) offsets it by the same `20%`. The name suggests two and a half
of three, which is not what the CSS does — trust the `20%`, not the name.

The `2m3` family is a ladder, and each class is one term of it:

| Class | Alone it gives |
| --- | --- |
| `.at-col-2m3` | `max-width` at every width |
| `.at-col-xs-2m3` | only `width: 100%` — it sets no `max-width` anywhere |
| `.at-col-sm-2m3` … `.at-col-xxl-2m3` | `max-width` from that breakpoint up |

So for a fifth that stacks on mobile and is capped from `sm` up, apply **both**
terms — the `xs` one widens, the `sm` one caps:

```html
<div class="at-col-xs-2m3 at-col-sm-2m3">Stacked below sm, a fifth above</div>
```

**Don't**

- Don't put a `.at-col-*` directly in `.at-ctnr` without a `.at-row` between them.
- Don't set `--at-cust-w` and expect `.at-col-auto` to use it — they are different classes.
- Don't use `.at-gap` expecting a default gap. There is none; that is deliberate.

---

## 4. Responsive

Mobile-first. Base classes apply at every width; an infix applies from that breakpoint
up. Only `min-width` is ever used.

| Infix | From |
| --- | --- |
| *(none)* | 0 — applies at all widths |
| `sm` | 576px |
| `md` | 768px |
| `lg` | 992px |
| `xl` | 1200px |
| `xxl` | 1400px |

**The infix does not sit in the same place in every family.** This is the single
easiest place to invent a class that silently does nothing, so check it:

| Family | Base | From `md` up |
| --- | --- | --- |
| Columns | `.at-col-6` | `.at-col-md-6` |
| Flex direction | `.at-flx-row` | `.at-flx-md-row` |
| Justify | `.at-jfy-cont-btw` | `.at-jfy-cont-md-btw` |
| Align items | `.at-al-itm-ctr` | `.at-al-itm-md-ctr` |
| **Display** | `.at-blk` | `.at-md-blk` |

Columns, flex, justify and align take the infix **in the middle**, just before the
value. The display family takes it **first**, right after `.at`.

```html
<div class="at-col-12 at-col-md-6 at-col-lg-4">Stacked, then half, then a third</div>
<div class="at-flx-col at-flx-md-row">Column, then a row from md up</div>
<div class="at-d-non at-lg-blk">Hidden until lg</div>
```

There is no `xs` breakpoint: it has no `min-width`, so there is no infix to write. Base
classes already are the small-screen rules. The one shipped name containing `xs` is
`.at-col-xs-2m3`, which is also unprefixed — see [§3](#3-grid) for what it actually does.

**Don't**

- Don't write an `xs` infix — there is no such breakpoint. The only `xs`-named class is `.at-col-xs-2m3`.
- Don't put the infix first for anything other than the display family. Infix-first flex, justify, align and column classes do not exist — the real form keeps the infix in the middle.
- Don't look for a max-width variant. Below a breakpoint is expressed by omitting the infix.

---

## 5. Flex and display utilities

No shipped bundle carries `!important`, so these are ordinary declarations: any of
them can be overridden by your own CSS through specificity or order. That is
deliberate — it is what lets a base theme stay at zero specificity. If you need a
utility to win unconditionally, build from [§11](#11-the-template-bundle) instead of
reaching for `!important` here.

| Class | Does |
| --- | --- |
| `.at-flx-row` `.at-flx-col` `.at-flx-row-rev` `.at-flx-col-rev` | `flex-direction` |
| `.at-flx-wrp` `.at-flx-nowrp` `.at-flx-wrp-rev` | `flex-wrap` |
| `.at-flx-fil` `.at-flx-grw-0` `.at-flx-grw-1` `.at-flx-srnk-0` `.at-flx-srnk-1` | grow / shrink |
| `.at-jfy-cont-st` `-end` `-ctr` `-btw` `-ard` `-evnly` | `justify-content` |
| `.at-al-itm-st` `-end` `-ctr` `-bsln` `-strh` | `align-items` |
| `.at-al-cont-st` `-end` `-ctr` `-btw` `-ard` `-strh` | `align-content` |
| `.at-al-slf-auto` `-st` `-end` `-ctr` `-bsln` `-strh` | `align-self` |
| `.at-d-non` `.at-inl` `.at-inl-blk` `.at-blk` `.at-tbl` `.at-tbl-row` `.at-tbl-cel` `.at-flx` `.at-inl-flx` | `display` |

All of these exist per breakpoint: `.at-flx-md-row`, `.at-al-itm-lg-ctr`, and so on.

```html
<div class="at-flx-col at-flx-md-row at-jfy-cont-btw at-al-itm-ctr">
  <div class="at-col-12 at-col-md-4">One</div>
  <div class="at-col-12 at-col-md-4">Two</div>
</div>
```

**Don't**

- Don't reach for `!important` to beat a utility. It is not needed: the utility is an
  ordinary (0,1,0) rule, so your own class or a `:where()`-free element rule of higher
  specificity will win. Reserve `!important` for elements you do not control.
- Hiding below a breakpoint and showing it above (`.at-d-non` plus `.at-lg-blk`) works
  because the breakpoint rule comes later in the bundle. Writing it the other way round
  — a breakpoint `display: none` with a base `display: block` — will not.
- Don't forget that a utility can now be overridden. If something you set earlier stops
  winning, check whether a later rule of equal specificity is setting the same property.

---

## 6. Property utilities

One class applies a property, reading the matching variable. The full table, with counts,
is in [`docs/CLASS-REFERENCE.md`](docs/CLASS-REFERENCE.md).

| Class | Property | Variable |
| --- | --- | --- |
| `.at-m` | `margin` | `--at-m` |
| `.at-p` | `padding` | `--at-p` |
| `.at-w` `.at-h` `.at-max-w` `.at-max-h` `.at-min-w` `.at-min-h` | sizing | matching |
| `.at-cl` | `color` | `--at-cl` |
| `.at-bg-cl` | `background-color` | `--at-bg-cl` |
| `.at-bdr` | border colour / width / style | `--at-bdr-cl` `--at-bdr-w` `--at-bdr-sty` |
| `.at-bdr-rad` | `border-radius` | `--at-bdr-rad` |
| `.at-box-sdw` | `box-shadow` | `--at-box-sdw` |
| `.at-fnt-sz` `.at-fnt-wt` `.at-fnt-fam` `.at-fnt-sty` | font | matching |
| `.at-txt-al` `.at-txt-tf` `.at-txt-dec` `.at-txt-sdw` `.at-txt-ovf` | text | matching |
| `.at-ln-h` `.at-ltr-sp` `.at-wrd-wrp` | text flow | matching |
| `.at-ovf` `.at-ovf-x` `.at-ovf-y` | overflow | matching |
| `.at-tbl` | `caption-side`, `table-layout` | `--at-cpt-sd` `--at-tbl-lyt` |
| `.at-tf` | transform family | `--at-tf` and friends |

```css
:root {
  --at-cl: #1c1c1c;
  --at-bg-cl: #fff;
  --at-p: 16px;
  --at-fnt-sz: 16px;
}
```

Two names keep a nested fallback for a superseded spelling. The row's own name is the
active one to set; the nested name still works, but is on its way out:

| Set this | Falls back to | Note |
| --- | --- | --- |
| `--at-mix-blnd-mode` | `var(--at-mix-blend-mode, initial)` | active token is `blnd` |
| `--at-wrd-spc` | `var(--at-wrd-spg, initial)` | active token is `spc` |

**Don't**

- Don't expect a default. `initial` is the fallback, so `.at-opa` is fully opaque until
  you set `--at-opa`.
- Don't set a variable whose class is not on the element. The variable alone renders nothing.

---

## 7. Structural classes

A fixed set of classes where the framework owns the geometry, so a composition works
with no consumer stylesheet. They set plain CSS, not variables.

### Overlays

```html
<div class="at-ovl at-ovl-cl">
  <!-- .at-ovl builds the ::after layer; .at-ovl-cl paints it -->
</div>
```

`.at-ovl` creates the pseudo-element layer. `.at-ovl-cl` and `.at-ovl-grd` are
behaviourally identical — each fills that layer with `background: var(--at-ovl)`. The
only difference is intent: the `-grd` name tells you and the next reader that
`--at-ovl` is expected to hold a gradient. The framework generates no gradient of its
own, so set the variable accordingly.

### Block shapes

```html
<div class="at-blk-shp">
  <div class="at-shp at-shp-t">Top half</div>
  <div class="at-shp at-shp-b">Bottom half</div>
</div>
```

### The rest

| Class | Does |
| --- | --- |
| `.at-stky` | `position: sticky; top: 0`, plus `align-self: flex-start` |
| `.at-dropcap` | `float: left` on `::first-letter` — geometry only, no styling |
| `.at-svg-wrp` | Wraps an inline SVG, collapses its line box, and fills it — the SVG is fixed at `100%`/`100%` and reads no channel, so no ancestor can resize it |
| `.at-has-abs-wrp` | `position: relative` — the positioning context for `.at-abs-el` |
| `.at-abs-el` | Absolutely fills that context |
| `.at-bg-vid` `.at-vid-bg` | Video-as-background pairing |
| `.at-vrt` `.at-vrt-hdr` `.at-vrt-conts` | Vertical layout: a fixed-width rail beside scrolling content |

### Seeded reads

A few classes *declare* a variable instead of setting a property with it, so a utility
elsewhere picks the value up. **A seed does nothing on its own** — you must also apply
one of the reading utilities.

| Class | Seeds | Read by |
| --- | --- | --- |
| `.at-shp` | `--at-l` `--at-pos` `--at-w` `--at-z-idx` | `.at-pos` `.at-w` `.at-z-idx` |
| `.at-shp-t` | `--at-t` | `.at-pos` |
| `.at-shp-b` | `--at-b` | `.at-pos` |
| `.at-ovl` | `--at-pos` `--at-z-idx` | `.at-pos` `.at-z-idx` |
| `.at-blk-shp` | `--at-pos` | `.at-pos` |
| `.at-vid-bg` | `--at-l` `--at-pos` `--at-t` `--at-z-idx` | `.at-pos` `.at-z-idx` |
| `.at-bg-vid` | `--at-pos` `--at-z-idx` | `.at-pos` `.at-z-idx` |

```html
<!-- .at-shp seeds --at-w and --at-pos; .at-w and .at-pos consume them -->
<div class="at-shp at-w at-pos">Sized and positioned by the seed</div>
```

**Don't**

- Don't apply a seed class alone expecting it to lay anything out.
- Don't expect a structural class to be themeable. It takes a variable only for values
  you are meant to configure, such as `--at-vrt-w`.

---

## 8. Theming

Set variables wherever it makes sense: `:root` for a whole site, a wrapper for a
section, or inline for one element.

```css
:root {
  --at-ctnr: 1280px;
  --at-gtr: 20px;
  --at-gap: 24px;
}
```

Only three variables ship a themeable default, so the grid works before you theme
anything:

| Variable | Default |
| --- | --- |
| `--at-ctnr` | `1140px` |
| `--at-ctnr-min` | `1100px` |
| `--at-gtr` | `15px` |

Everything else falls back to `initial` — inert until you set it — or, for a few
properties, to a property-appropriate keyword such as `inherit` or `none`. Check the
fallback column in [`docs/CLASS-REFERENCE.md`](docs/CLASS-REFERENCE.md#variables-93)
before concluding a class does nothing.

The gap family chains: set `--at-gap` and `.at-row-gap` / `.at-col-gap` follow it.

### Dark mode

Drive it from an attribute and redefine variables only — never properties.

```css
[data-at-theme='dark'] {
  --at-cl: #f2f2f2;
  --at-bg-cl: #161616;
}
```

```html
<html data-at-theme="dark">
```

Because the switch only redefines variables, every utility on the page follows with no
class changes and no extra stylesheet.

**Don't**

- Don't write a bare `var(--at-ctnr)` in your own CSS expecting it to resolve — the
  framework declares no `:root` values. Read it as `var(--at-ctnr, 1140px)`, or set it.
- Don't set properties in a theme block. Set variables; that is what makes theming
  composable.
- Don't set `--at-ctnr` once and expect it to be responsive. It is a single value; set
  it per breakpoint if you need it to change.

---

## 9. What the framework does not ship

The framework ships **only** utilities, grid geometry and structural helpers. Three
things are yours, by design.

### Media sizing

There is no framework class that sizes images, video or audio. Declare the defaults once
in your own global CSS, at zero specificity so utilities can still win:

```css
:where(img)   { --at-w: 100%; max-width: var(--at-w, 100%); height: auto; }
:where(video) { max-width: 100%; width: 100%; height: 100%; }
:where(audio) { width: 100%; min-width: 217px; }
/* map / iframe sizing is consumer-owned too, e.g. width: 100%; height: 100%; */
```

The `img` rule seeds `--at-w` and then reads it back, so image width stays themeable —
a consumer can override `--at-w` on any ancestor. The `video` rule's 100%/100% box is
what a background-video layer needs, so do not narrow it without a reason.

### Component and identity classes

No component CSS ships. Every component class name — a button, a card, a menu — is one
*you* own and style; the framework has no opinion on what any of them look like. The
pattern is: an identity class sets the shape, colour variants only set variables, and
state variants only set variables.

```css
:root { --at-btn-bg: #2b6cb0; --at-btn-bg--hover: #245a94; --at-btn-cl: #fff; }

.btn {
  display: inline-block;
  padding: var(--at-btn-p, 10px 18px);
  border: 0;
  background: var(--at-btn-bg);
  color: var(--at-btn-cl);
}
.btn:hover { background: var(--at-btn-bg--hover); }
```

A fuller version of this pattern, with a variant registry, is in
[`README.md`](README.md#buttons).

### Global element defaults

Resets, base font, base colour: yours. Keep them at zero specificity (`:where(body)`) so
that any utility can override them without `!important`.

**Don't**

- Don't reach for a framework class to style a component. Build the component; use the
  utilities inside it.
- Don't put component rules in a utility class name. A class is either a framework
  utility or your own identity class, never both.

---

## 10. RTL

Each bundle has an `-rtl` sibling, generated by flipping physical declarations —
`margin-left` becomes `margin-right`, `float: left` becomes `float: right`, and so on.

```html
<link rel="stylesheet" href="css/atomic.min-rtl.css">
```

**rtlcss does not touch values inside `var()`.** If a variable holds a directional
value, the framework cannot mirror it for you. Keep direction out of the variable, or
author the variable direction-aware:

```css
/* fine — no direction in the value */
--at-p: 16px;

/* needs a direction-aware value, because rtlcss will not flip this */
--at-m: 0 auto 0 0;
```

**Don't**

- Don't link the LTR file on an RTL page.
- Don't put `left`/`right` in a variable name you expect to flip automatically.
- Don't assume `-rtl` adds features. It is the same selectors, mirrored.

---

## 11. The template bundle

`css-template/atomic-template.css` is for consumers who generate CSS at runtime —
WordPress themes, PHP page builders. It mirrors the minimal bundle with two kinds of
marker:

| Marker | Replace with |
| --- | --- |
| `%%MOBILE_BREAKPOINT%%` | your `sm` width, e.g. `576` |
| `%%TABLET_BREAKPOINT%%` | your `md` width |
| `%%DESKTOP_BREAKPOINT%%` | your `lg` width |
| `%%LARGE_DESKTOP_BREAKPOINT%%` | your `xl` width |
| `%%EXTRA_LARGE_DESKTOP_BREAKPOINT%%` | your `xxl` width |
| `%%IMPORTANT%%` | see below — two build modes |

The five breakpoint markers are written `%%NAME%%px` inside a `min-width`, so replacing
the name regenerates every responsive infix at your own values. `%%IMPORTANT%%` is
different: it is appended to **every** declaration value, and it is the only sanctioned
importance mechanism. There are exactly two builds, never a partial mix:

```php
// Normal build — no importance. This is behaviourally identical to the
// shipped bundles, which carry none either.
$css = str_replace( '%%IMPORTANT%%', '', $css );

// Force build — every declaration becomes !important. Note the leading
// space: it replaces the tail of the value, not the whole declaration.
$css = str_replace( '%%IMPORTANT%%', ' !important', $css );
```

**Default to the normal build** — it is what the shipped bundles already are, and
switching a rule from plain to important changes what wins. The template is the *only*
way to obtain importance in a framework stylesheet, so a consumer who needs it should
take the force build deliberately rather than patching `!important` into their own
rules.

A built stylesheet that still contains any `%%` marker is invalid. That is the check to
run after transforming.

**Don't**

- Don't link the template directly.
- Don't produce a partial mix — replacing some markers and not others leaves a stylesheet whose importance depends on where it came from.
- Don't replace a marker with a whole declaration. It is the tail of a value, so `%%IMPORTANT%%` becomes `!important` (or nothing), never `display: flex`.
- Don't fork the template to change a breakpoint. That is what the markers are for.

---

## 12. Where to go next

| File | What it gives you |
| --- | --- |
| [`docs/CLASS-REFERENCE.md`](docs/CLASS-REFERENCE.md) | Every class, variable, breakpoint and token, generated from the CSS |
| [`docs/CLASS-REFERENCE.json`](docs/CLASS-REFERENCE.json) | The same inventory as JSON, for tooling |
| [`README.md`](README.md) | Install, bundles, the full button contract, WordPress enqueue |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | The rules the framework itself follows |
| the repository's `demo` directory (not shipped) | Working pages: colour modes, organisms, templates |
| `short-names.json` | The token legend — every abbreviation, and what it expands to |

Names are assembled from legend tokens, and the class and the variable always share the
same joined string: `bg` + `cl` gives `.at-bg-cl` and `--at-bg-cl`. If a name is not
obvious, look its tokens up in the legend.

**Don't**

- Don't guess a name from a pattern. The pattern is consistent but not complete, and a
  wrong name fails silently.
- Don't edit anything under `docs/` — it is generated. Run `npm run docs`.
