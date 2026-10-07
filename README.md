# Atomic CSS

An atomic/utility CSS framework built on CSS custom properties and a Flexbox grid: every `.at-*` class applies a property and a matching `--at-*` variable supplies its value, so theming is variables only — no class overrides, no JavaScript runtime.

**Owner:** developer/user documentation owner · **Authority:** human onboarding and usage.

## Contents

- [What this framework is for](#what-this-framework-is-for)
- [Breaking changes in 2.0.0](#breaking-changes-in-200)
- [Quick start](#quick-start)
- [Bundles](#bundles)
- [Grid](#grid)
- [Atomic utilities](#atomic-utilities)
- [Theming](#theming)
- [RTL](#rtl)
- [npm](#npm)
- [Demo](#demo)
- [Building from source](#building-from-source)
- [License](#license)

> **Applying these classes with an AI agent?** Use the skill in
> [`skills/atomic-css/`](skills/atomic-css/SKILL.md) — the agent-facing contract,
> shipped inside the package. Its
> [`references/classes.md`](skills/atomic-css/references/classes.md) is the
> readable layer over a class and variable inventory generated from the compiled
> CSS and drift-checked in CI, so it always matches the bundles.

## What this framework is for

The framework is compiled from SCSS with Webpack and dart-sass, passed through
postcss/autoprefixer and rtlcss, and the **compiled CSS is committed and shipped
as-is**: no build step at install time, no JavaScript runtime. Two bundles ship
(minimal and max); a third file, the template, is a build input for dynamic
consumers and is never linked.

Layout is the grid, always: `.at-ctnr` → `.at-row` → `.at-col-{1..12}`, plus
equal-share, `auto`, `cust` and the fifths ladder — never a hand-rolled
`flex: 0 0 50%` or a new breakpoint. For everything else the test is whether the
value has a **second writer** — a colour mode, a state, a variant, a
per-instance value, or a generator: with one, reach for the class and set the
variable; without one, write the property. The full contract — the three tiers,
the component shapes, the arm rules — is
[the skill's consumer contract](skills/atomic-css/SKILL.md#what-this-framework-is-for).

## Breaking changes in 2.0.0

The framework no longer ships element/media sizing classes. `.at-img`, `.at-vid`,
`.at-aud`, and `.at-map` were removed — declare those defaults once in your own
global CSS instead:

```css
img   { max-width: 100%; height: auto; }
video { max-width: 100%; width: 100%; height: 100%; }
audio { width: 100%; min-width: 217px; }
/* map (iframe) sizing is consumer-owned too, e.g. width: 100%; height: 100%; */
```

These are raw properties, not channel seeds: a seed here would set `--at-w` for
the whole `img` subtree instead of sizing the image, and a bare `<img>` carries
no class for a utility to apply one anyway. If you need themeable image width, seed
`--at-w` on a container class and put `.at-w` on the image.

Structural helpers (`.at-ovl`, `.at-blk-shp`, `.at-shp`, `.at-vrt`, …) now use
plain-CSS geometry — they no longer publish `--at-*` values for their own
layout. Their documented seeded reads for co-applied utilities (`.at-pos`,
`.at-w`, `.at-z-idx`) are unchanged.

The framework also ships **no `:root` variables**. `--at-ctnr`, `--at-ctnr-min`,
and `--at-gtr` are consumed with built-in fallbacks (`var(--at-ctnr, 1140px)`,
…); if your own CSS reads these variables from `:root` or an ancestor, declare
them yourself — a bare `var(--at-ctnr)`/`var(--at-gtr)` no longer resolves.

## Quick start

```html
<link rel="stylesheet" href="css/atomic.min.css">

<div class="at-ctnr">
  <div class="at-row">
    <div class="at-col-6">Half</div>
    <div class="at-col-3">Quarter</div>
    <div class="at-col-3">Quarter</div>
  </div>
</div>
```

Link **one** bundle. Swap that line for `css-max/atomic-max.min.css` if you need the
order, offset or print utilities — never both, or you ship every rule twice.

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
  .at-flx-sm-row {
    flex-direction: row%%IMPORTANT%%;
  }
}

.at-col-cust {
  flex: 0 0 var(--at-cust-w)%%IMPORTANT%%;
}
```

Both rules are real excerpts, abridged: the shipped template also carries
autoprefixer clones (`-ms-flex-direction`, `-webkit-box-orient`) for each.

- `%%MOBILE_BREAKPOINT%%` (sm), `%%TABLET_BREAKPOINT%%` (md), `%%DESKTOP_BREAKPOINT%%` (lg), `%%LARGE_DESKTOP_BREAKPOINT%%` (xl), `%%EXTRA_LARGE_DESKTOP_BREAKPOINT%%` (xxl) — the five `min-width` breakpoints, written `%%…%%px`, so a dynamic consumer can regenerate all responsive infixes at its own values.
- `%%IMPORTANT%%` — appended to every declaration value (before the `;`, no leading space, custom-property declarations included), so importance is opt-in; the shipped bundles themselves carry none. For a force build, replace every occurrence with ` !important` (the whole build becomes important — never a partial mix); for a normal build, remove it entirely, yielding an importance-free stylesheet.
- A consumer build that still contains any `%%…%%` marker is invalid — every placeholder must be replaced.

## Grid

### Containers

| Class | Behavior |
| --- | --- |
| `.at-ctnr` | Centered container — `max-width: var(--at-ctnr, 1140px)`, gutters `var(--at-gtr, 15px)` |
| `.at-ctnr-min` | Centered container using `--at-ctnr-min` (fallback `1100px`) |
| `.at-ctnr-fld` | Fluid (full-width) container |

### Row and columns

Wrap columns in `.at-row` (flex row with negative gutters). Columns are 12 per row:

```html
<div class="at-row">
  <div class="at-col-6">Half</div>
  <div class="at-col-md-4">Third on md+</div>
  <div class="at-col-lg-2">Sixth on lg+</div>
</div>
```

- `.at-col-1` … `.at-col-12` — fixed fractions; responsive via breakpoint infixes: `sm`, `md`, `lg`, `xl`, `xxl` (e.g. `.at-col-md-6`)
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

When a class is warranted versus when to write the property is the
[second-writer test](skills/atomic-css/SKILL.md#what-this-framework-is-for) — and
the class tables, with the variables each one reads, are in
[`classes.md`](skills/atomic-css/references/classes.md).

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

> **Breaking Change**: The compound `.at-txt, .at-txt *` rule has been removed. The framework defines **no** `.at-txt` rule — it is a consumer-side hook: you may apply it in your markup and style it in your own CSS, but it never appears in a bundle or in the skill's generated reference. For framework-provided typography, apply the individual utility classes in the table above. Additionally, `.at-dropcap::first-letter` only supplies structural `float: left`; all styling values arrive as raw `::first-letter` declarations from the block CSS.

## Theming

Theme by variable, never by property: re-point a `--at-*` token and every utility
follows, with no class changes and no property restated under a theme, media or
state arm. The framework ships no `:root` variables — the three grid values carry
direct fallbacks (`--at-ctnr` 1140px, `--at-ctnr-min` 1100px, `--at-gtr` 15px),
and every other token is inert until declared. The reference token set lives in
[`demo/colormode-globalstyle/scss/variable.scss`](demo/colormode-globalstyle/scss/variable.scss);
the rules — naming, arms and resting values, the reference block — are in the
skill's [global tokens](skills/atomic-css/references/patterns.md#global-tokens).

### Buttons

The framework ships no button CSS: `.at-btn` is a consumer identity class. The
variant registry (this list is the registry):

- Solid: `at-btn-primary`, `-secondary`, `-success`, `-danger`, `-warning`, `-info`, `-light`, `-dark`, `-lnk` (with `:hover` states).
- Outline: `at-btn-outln` plus `at-btn-outln-<color>` for the same 8 colors.
- Icon layout: `at-btn-icon`.

Variants consume the palette tokens `--at-<color>` and `--at-<color>--hover`
(`--at-primary`, …), plus `--at-white`, `--at-black`, `--at-base-color`,
`--at-body-color`, `--at-quaternary` — declare them at `:root` or on a theme
container. The worked contract — the shell, the private `--at-btn-*` namespace,
the generated-markup case — is
[components: one owner per class](skills/atomic-css/references/patterns.md#components-one-owner-per-class).

### WordPress

Enqueue one bundle; the active theme supplies the token set. The install matrix,
the template transform and the enqueue example are in the skill's
[setup reference](skills/atomic-css/references/setup.md#enqueue-wordpress).

## RTL

Every bundle has an `-rtl` sibling (rtlcss mirrors physical declarations —
`left`/`right`, margins, padding, `.at-ofst-*` offsets included — but **not
values inside `var()`**). The mirrored stylesheet is only half of it: the
document must be marked RTL too (`<html dir="rtl">`), and no variable value
carries direction. Details in the skill's [RTL setup](skills/atomic-css/references/setup.md#rtl).

## npm

```bash
# from GitHub, pinned to an immutable commit — the repo has no git tag
npm install github:codersantosh/atomic-css#c51609b

# or the moving branch: fine for a trial, not for a deploy
npm install github:codersantosh/atomic-css#2.0.0
```

**Not `npm install atomic-css`** — that registry name belongs to an unrelated
2017 project, and the same applies to `github:codersantosh/atomic-css` with no
ref, which resolves to the pre-2.0 `master` tree. Git installs ship the
committed CSS: there is no build step, so the CSS in the repo is the artifact.
The full install matrix — a vendored copy, a single raw file, and how to confirm
the stylesheet resolved — is in the skill's
[setup reference](skills/atomic-css/references/setup.md#install).

```html
<link rel="stylesheet" href="node_modules/atomic-css/css/atomic.min.css">
```

## Demo

- [`index.html`](index.html) — main showcase (superset bundle)
- [`demo/organism/`](demo/organism/) — component examples (slider, gallery, tooltip, progressbar, …)
- [`demo/colormode-globalstyle/color-mode.html`](demo/colormode-globalstyle/color-mode.html) — theming

`index.html` is the front door: it links every demo below it.

## Building from source

```bash
npm install
npm run build   # build + cleanup + parity/naming/variables verification
npm run lint    # stylelint
```

## License

[GPL-2.0-or-later](LICENSE)
