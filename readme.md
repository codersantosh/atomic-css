# Atomic CSS

An atomic/utility CSS framework built on **CSS custom properties** and a **Flexbox grid system**. Every utility class (`.at-*`) reads its value from a matching CSS variable (`--at-*`), so theming is done entirely in variables — no class overrides, no JavaScript runtime.

## Breaking changes in 2.0.0

The framework no longer ships element/media sizing classes. `.at-img`, `.at-vid`,
`.at-aud`, and `.at-map` were removed — declare those defaults once in your own
global CSS instead:

```css
:where(img)   { max-width: 100%; height: auto; }
:where(video) { max-width: 100%; width: 100%; height: 100%; }
:where(audio) { width: 100%; min-width: 217px; }
/* map (iframe) sizing is consumer-owned too, e.g. width: 100%; height: 100%; */
```

Structural helpers (`.at-ovl`, `.at-blk-shp`, `.at-shp`, `.at-vrt`, …) now use
plain-CSS geometry — they no longer publish `--at-*` values for their own
layout. Their documented seeded reads for co-applied utilities (`.at-pos`,
`.at-w`, `.at-z-idx`) are unchanged.

## Quick start

```html
<link rel="stylesheet" href="css/atomic.min.css">
<link rel="stylesheet" href="css-max/atomic-max.min.css"><!-- optional: superset bundle -->

<div class="at-ctnr">
  <div class="at-row">
    <div class="at-col-6">Half</div>
    <div class="at-col-3">Quarter</div>
    <div class="at-col-3">Quarter</div>
  </div>
</div>
```

## Bundles

| File | Contents | Use when |
| --- | --- | --- |
| `css/atomic.css` | Atomic utilities + flex/display utilities + minimal grid (containers, rows, 12-col columns, fifths, custom-width columns) | Default |
| `css-max/atomic-max.css` | **Superset** — everything in `atomic.css` plus per-breakpoint order (`.at-ord-*`), offset (`.at-ofst-*`), print display (`.at-prt-*`), fifths offsets (`.at-ofst-*-2m3`) | You need order/offset/print utilities |
| `css-template/atomic-template.css` | **Template** — structural replica of `css/atomic.css` with `%%PLACEHOLDER%%` markers for dynamic consumers | WordPress/PHP/any dynamic script transforms it into its own build (see below) |

Minified (`.min.css`) and RTL (`-rtl.css`, `.min-rtl.css`) variants exist for both shipped bundles. A parity check in CI guarantees `atomic.css` stays a strict subset of `atomic-max.css`.

### CSS template (dynamic consumers)

`css-template/atomic-template.css` is a build artifact to **transform, not link**. WordPress, PHP, or any dynamic script language replaces the placeholders and saves the result as its own stylesheet — the framework source never changes. The template mirrors the minimal bundle (same selectors, same order); placeholders appear in values only, never inside `var()` names or selectors:

```css
/* Dynamic Breakpoint Placeholder */
@media (min-width: %%MOBILE_BREAKPOINT%%px) {

}

.at-flx-md {
    display: flex%%IMPORTANT%%;
}

.at-col-cust {
    max-width: var(--at-cust-w)%%IMPORTANT%%;
}
```

- `%%MOBILE_BREAKPOINT%%` (sm), `%%TABLET_BREAKPOINT%%` (md), `%%DESKTOP_BREAKPOINT%%` (lg), `%%LARGE_DESKTOP_BREAKPOINT%%` (xl), `%%EXTRA_LARGE_DESKTOP_BREAKPOINT%%` (xxl) — the five `min-width` breakpoints, written `%%…%%px`, so a dynamic consumer can regenerate all responsive infixes at its own values.
- `%%IMPORTANT%%` — appended to every declaration value (before the `;`, no leading space, custom-property declarations included), replacing the shipped bundles' built-in `!important`. For a force build, replace every occurrence with ` !important` (the whole build becomes important — never a partial mix); for a normal build, remove it entirely, yielding an importance-free stylesheet.
- A consumer build that still contains any `%%…%%` marker is invalid — every placeholder must be replaced.

## Grid

### Containers

| Class | Behavior |
| --- | --- |
| `.at-ctnr` | Centered container — `max-width: var(--at-ctnr, 1140px)`, gutters `var(--at-gtr, 15px)` |
| `.at-ctnr-min` | Centered container using `--at-ctnr-min` (fallback `1100px`) |
| `.at-ctnr-fld` | Fluid (full-width) container |

### Row & columns

Wrap columns in `.at-row` (flex row with negative gutters). Columns are 12 per row:

```html
<div class="at-row">
  <div class="at-col-6">Half</div>
  <div class="at-col-md-4">Third on md+</div>
  <div class="at-col-lg-2">Sixth on lg+</div>
</div>
```

- `.at-col-1` … `.at-col-12` — fixed fractions; responsive via breakpoint infixes: `xs`, `sm`, `md`, `lg`, `xl`, `xxl` (e.g. `.at-col-md-6`)
- `.at-col-auto` — width from content
- `.at-col-cust` — width from `--at-cust-w`
- `.at-col-*-2m3` — fifths (1 of 5): `.at-col-2m3`, `.at-col-md-2m3`, …
- `.at-no-gtr` — removes gutters from row and child columns
- `atomic-max.css` only: `.at-ord-*` (reorder), `.at-ofst-*` (offset), `.at-prt-*` (print display)

## Atomic utilities

Every class is a thin alias for a CSS property reading a matching variable, e.g.:

```css
.at-bg-cl    { background-color: var(--at-bg-cl, initial); }
.at-p        { padding: var(--at-p, initial); }
.at-tf       { transform: var(--at-tf, initial); }
.at-bdr      { border: ... var(--at-bdr-*, initial); }
```

Abbreviations follow a documented legend (`bg-cl` = background-color, `bdr` = border, `tf` = transform, `msk` = mask, …) kept in [`short-names.json`](short-names.json).

### Typography utilities

Each typography property has its own utility class reading its matching `--at-*` variable:

| Class | Property | Variable |
| --- | --- | --- |
| `.at-fnt-sz` | `font-size` | `--at-fnt-sz` |
| `.at-fnt-wt` | `font-weight` | `--at-fnt-wt` |
| `.at-fnt-fam` | `font-family` | `--at-fnt-fam` |
| `.at-fnt-sty` | `font-style` | `--at-fnt-sty` |
| `.at-txt-tf` | `text-transform` | `--at-txt-tf` |
| `.at-txt-dec` | `text-decoration` | `--at-txt-dec` |
| `.at-ln-h` | `line-height` | `--at-ln-h` |
| `.at-ltr-sp` | `letter-spacing` | `--at-ltr-sp` |
| `.at-cl` | `color` | `--at-cl` |

> **Breaking Change**: The compound `.at-txt, .at-txt *` rule has been removed. `.at-txt` is now a marker class with no CSS declarations. Consumers apply individual typography utility classes conditionally. Additionally, `.at-dropcap::first-letter` only supplies structural `float: left`; all styling values arrive as raw `::first-letter` declarations from the block CSS.

## Theming

Set variables on `:root`, on a theme container, or inline:

```css
:root {
  --at-bg-cl: #0d6efd;
  --at-p: 10px 25px;
  --at-bdr-cl: #0c5ed7;
}

[data-at-theme="dark"] {
  --at-bg-cl: #212529;
  --at-cl: #fff;
}
```

### Framework defaults vs consumer-declared

The framework declares **three** variables in `:root`; every other `--at-*`
value is supplied by the consumer:

| Variable | Default | Controls |
| --- | --- | --- |
| `--at-ctnr` | `1140px` | `.at-ctnr` max-width |
| `--at-ctnr-min` | `1100px` | `.at-ctnr-min` max-width |
| `--at-gtr` | `15px` | container/column padding and `.at-row` negative margins |

The grid rules also carry the same defaults as direct `var()` fallbacks
(`var(--at-ctnr, 1140px)`, `var(--at-gtr, 15px)`), so the grid stays functional
if the framework `:root` is stripped or replaced. This resilience applies to
the grid rules only — it does not extend the root-token contract to unrelated
consumer CSS that reads `var(--at-ctnr)` or `var(--at-gtr)` without its own
fallback. Consumer declarations always win, including scoped ones:

```css
/* loaded after the bundle */
:root { --at-ctnr: 700px; --at-gtr: 20px; }

@media (min-width: 576px) {
  .at-ctnr { --at-ctnr: 540px; } /* element-scoped, as the demo does */
}
```

The shipped container default is not responsive: re-declare `--at-ctnr` per
breakpoint as the demo does
([`demo/colormode-globalstyle/scss/dynamic.scss`](demo/colormode-globalstyle/scss/dynamic.scss)).

Everything else is consumer-declared:

- **Utility and gap tokens** — each utility stays inert until its variable is
  set. `--at-gap` has no universal default: `.at-gap` and the grid column
  offset resolve to `0` when unset, while `.at-vrt` uses `15px`
  (`--at-vrt-gap` → `--at-gap` → `15px`); `--at-row-gap` and `--at-col-gap` fall
  back to `--at-gap`.
- **Palette and state tokens** — `--at-primary`, `--at-primary--hover`, … are
  consumed by your own identity/variant classes (see [Buttons](#buttons)); state
  variants use a double dash.
- **Legacy alias fallbacks** — `--at-wrd-spg` and `--at-mix-blend-mode` are
  optional; the active names are `--at-wrd-spc` and `--at-mix-blnd-mode`.
- **Class-scoped seeds** — `--at-pos`, `--at-z-idx`, … published by structural
  helpers (`.at-ovl`, `.at-shp`, …) for co-applied utilities; consumers never
  declare these.

The single reference set (all tokens with defaults) lives in
[`demo/colormode-globalstyle/scss/variable.scss`](demo/colormode-globalstyle/scss/variable.scss);
its plain-CSS equivalent is the `:root` block at the top of
[`demo/colormode-globalstyle/colormode-globalstyle.css`](demo/colormode-globalstyle/colormode-globalstyle.css).
Never fork or re-list it.

### Buttons

`.at-btn` classes are **consumer-owned**: the framework ships no button CSS.
Consumers implement the var-driven base shell (cursor, color, background,
typography, border, padding, line-height, `[disabled]` state), the default
look (font-size 14px, padding 6px 12px, no border) and the variant palette
classes. The [atrc](https://www.npmjs.com/package/atrc) button atom
(`packages/atoms/button/style.scss`) is the reference implementation; the
demo `scss/css-properties.scss` shows the consumer pattern:

```css
.at-btn {
  --at-cur: pointer;
  --at-fnt-sz: 14px;
  --at-ln-h: normal;
  --at-bdr-w: initial;
  --at-bdr-sty: initial;
  --at-p: 6px 12px;

  cursor: var(--at-cur, pointer);
  color: var(--at-cl, inherit);
  background-color: var(--at-bg-cl, transparent);
  font-size: var(--at-fnt-sz, 14px);
  border-color: var(--at-bdr-cl, transparent);
  border-width: var(--at-bdr-w, 0);
  border-style: var(--at-bdr-sty, solid);
  padding: var(--at-p, 6px 12px);
}

.at-btn-primary {
  --at-cl: var(--at-white);
  --at-bg-cl: var(--at-primary);
  --at-bdr-cl: var(--at-primary);
}
```

Usage (identical in the framework and in consumer implementations):

```html
<button type="button" class="at-btn at-btn-primary">Primary</button>
<button type="button" class="at-btn at-btn-outln-primary">Outline</button>
<button type="button" class="at-btn at-btn-outln">Plain outline</button>
<button type="button" class="at-btn at-btn-lnk">Link</button>
<button type="button" class="at-btn at-btn-icon at-inl-flx at-gap">Icon btn</button>
```

Solid variants: `at-btn-primary`, `-secondary`, `-success`, `-danger`,
`-warning`, `-info`, `-light`, `-dark`, `-lnk` (with `:hover` states).
Outline variants: `at-btn-outln` plus `at-btn-outln-<color>` for the same
8 colors. Icon layout: `at-btn-icon`, paired with the `at-inl-flx`/`at-gap`
utilities.

Variants consume the palette variables `--at-<color>` and `--at-<color>--hover`
(`--at-primary`, `--at-primary--hover`, …), plus `--at-white`, `--at-black`,
`--at-base-color`, `--at-body-color`, `--at-quaternary` — declare them at
`:root` or on a theme container (reference set in the demo `variable.scss`).

### WordPress

```php
wp_enqueue_style( 'atomic', 'url-path-to/css/atomic.min.css', array(), '2.0.0' );
```

The enqueued bundle declares only the three structural variables
(`--at-ctnr`, `--at-ctnr-min`, `--at-gtr`); the theme supplies the rest of the
reference set (the grid itself relies on the built-in fallbacks otherwise).

## RTL

`*-rtl.css` files are auto-generated with [rtlcss](https://rtlcss.com/). rtlcss flips physical declarations (`left`/`right`, margins, padding), but **values inside `var()` are not mirrored** — e.g. a margin shorthand in `--at-m` stays LTR-oriented, so use logical/physical-aware values for RTL layouts.

## npm

```bash
npm install atomic-css
```

```html
<link rel="stylesheet" href="node_modules/atomic-css/css/atomic.min.css">
```

## Demo

- [`index.html`](index.html) — main showcase (superset bundle)
- [`demo/organism/`](demo/organism/) — component examples (slider, gallery, tooltip, progressbar, …)
- [`demo/colormode-globalstyle/color-mode.html`](demo/colormode-globalstyle/color-mode.html) — theming
- [`demo/template/landing/template-1.html`](demo/template/landing/template-1.html) — landing page

## Building from source

```bash
npm install
npm run build   # build + cleanup + parity/naming/variables verification
npm run lint    # stylelint
```

## License

[GPL-2.0-or-later](LICENSE)
