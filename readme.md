# Atomic CSS

An atomic/utility CSS framework built on **CSS custom properties** and a **Flexbox grid system**. Every utility class (`.at-*`) reads its value from a matching CSS variable (`--at-*`), so theming is done entirely in variables — no class overrides, no JavaScript runtime.

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

Minified (`.min.css`) and RTL (`-rtl.css`, `.min-rtl.css`) variants exist for both bundles. A parity check in CI guarantees `atomic.css` stays a strict subset of `atomic-max.css`.

## Grid

### Containers

| Class | Behavior |
| --- | --- |
| `.at-ctnr` | Centered container — `max-width: var(--at-ctnr)`, gutters `var(--at-gtr)` |
| `.at-ctnr-min` | Centered container using `--at-ctnr-min` |
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

The full reference variable set (with defaults) lives in [`demo/colormode-globalstyle/scss/variable.scss`](demo/colormode-globalstyle/scss/variable.scss); the core build itself declares only `--at-ctnr`, `--at-ctnr-min`, `--at-gtr`.

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

  cursor: var(--at-cur);
  color: var(--at-cl);
  background-color: var(--at-bg-cl);
  font-size: var(--at-fnt-sz);
  border-color: var(--at-bdr-cl);
  border-width: var(--at-bdr-w);
  border-style: var(--at-bdr-sty);
  padding: var(--at-p);
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
wp_enqueue_style( 'atomic', 'url-path-to/css/atomic.min.css', array(), '1.0.1' );
```

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
npm run build   # build + cleanup + parity/naming verification
npm run lint    # stylelint
```

## License

[GPL-2.0-or-later](LICENSE)
