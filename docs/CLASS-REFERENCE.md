# Atomic CSS — class & variable reference

> GENERATED FILE — do not edit. Regenerate with `npm run docs`, verify with
> `npm run docs:check`. Derived from:
> `css/atomic.css`
> `css-max/atomic-max.css`
> `css-template/atomic-template.css`
> `short-names.json`

For how to *use* these classes read [`../USAGE.md`](../USAGE.md) first; this file is
the lookup table. For the rules the framework itself follows, read
[`../ARCHITECTURE.md`](../ARCHITECTURE.md).

## At a glance

| | Count |
| --- | --- |
| Classes in `css/atomic.css` | 441 |
| Classes in `css-max/atomic-max.css` | 617 |
| Classes only in the max bundle | 176 |
| Classes in `css-template/atomic-template.css` | 441 |
| Distinct `--at-*` variables read | 93 |
| Naming-legend tokens (`short-names.json`) | 314 |
| Structural classes | 17 |
| Classes that seed a `--at-*` value | 7 |
| Classes carrying `!important` | 0 |

No shipped bundle carries `!important` — utilities are ordinary declarations that a
consumer can override by specificity or order. Importance is available only by building
from `css-template/atomic-template.css`, where the `%%IMPORTANT%%` marker is the sole
mechanism. A dedicated verifier enforces this on the compiled output; see `AGENTS.md`.

### Files

| File | Bytes | Role |
| --- | --- | --- |
| `css/atomic.css` | 65,315 | minimal bundle — link this by default |
| `css/atomic.min.css` | 48,241 | minimal, minified |
| `css/atomic-rtl.css` | 65,317 | minimal, RTL |
| `css/atomic.min-rtl.css` | 48,243 | minimal, minified + RTL |
| `css-max/atomic-max.css` | 79,033 | superset — adds order, offset and print |
| `css-max/atomic-max.min.css` | 57,503 | superset, minified |
| `css-max/atomic-max-rtl.css` | 79,112 | superset, RTL |
| `css-max/atomic-max.min-rtl.css` | 57,582 | superset, minified + RTL |
| `css-template/atomic-template.css` | 81,611 | transform source for WordPress/PHP — never a link target |

## Breakpoints

Mobile-first: larger viewports are reached only through `min-width`, never `max-width`.

| Infix | Min width | Applied as |
| --- | --- | --- |
| `xs` | — | no min-width — base rules are unprefixed. The one name carrying an `xs` segment is `.at-col-xs-2m3`, which is also unprefixed (see the fifths ladder below) |
| `sm` | 576px | @media (min-width: 576px) |
| `md` | 768px | @media (min-width: 768px) |
| `lg` | 992px | @media (min-width: 992px) |
| `xl` | 1200px | @media (min-width: 1200px) |
| `xxl` | 1400px | @media (min-width: 1400px) |

A base class has no infix. `.at-col-6` applies at every width, `.at-col-md-6` from the
`md` breakpoint up.

## How to read the tables

| Column | Meaning |
| --- | --- |
| Class | The class as written in HTML. |
| Property | CSS properties the class applies. Autoprefixer clones are collapsed and legacy `box-*` / `flex-*` artifacts suppressed. |
| Variable | `--at-*` variables the class reads. `—` means plain CSS that takes no value from you. |
| Seeds | Variables the class *declares* for a co-applied utility to read — see the seed table. |
| BP | Breakpoint infix, or `—` for all widths. |
| Bundle | `both`, `minimal only`, or `max only`. |

## Grid (105)

Grid geometry. The row and column classes compute their own `flex`; only the container widths and gaps read a variable from you.

| Class | Property | Variable | Seeds | BP | Bundle |
| --- | --- | --- | --- | --- | --- |
| `.at-col` | `flex-basis`, `flex-grow`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | — | both |
| `.at-col-1` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-10` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-11` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-12` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-2` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-2m3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-4` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-5` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-6` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-7` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-8` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-9` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | — | both |
| `.at-col-auto` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | — | both |
| `.at-col-cust` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-cust-w`, `--at-gtr` | — | — | both |
| `.at-col-gap` | `column-gap` | `--at-col-gap`, `--at-gap` | — | — | both |
| `.at-col-lg` | `flex-basis`, `flex-grow`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `lg` | both |
| `.at-col-lg-1` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-10` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-11` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-12` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-2` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-2m3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-4` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-5` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-6` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-7` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-8` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-9` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `lg` | both |
| `.at-col-lg-auto` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `lg` | both |
| `.at-col-lg-cust` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-cust-w`, `--at-gtr` | — | `lg` | both |
| `.at-col-md` | `flex-basis`, `flex-grow`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `md` | both |
| `.at-col-md-1` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-10` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-11` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-12` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-2` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-2m3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-4` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-5` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-6` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-7` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-8` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-9` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `md` | both |
| `.at-col-md-auto` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `md` | both |
| `.at-col-md-cust` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-cust-w`, `--at-gtr` | — | `md` | both |
| `.at-col-sm` | `flex-basis`, `flex-grow`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `sm` | both |
| `.at-col-sm-1` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-10` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-11` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-12` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-2` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-2m3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-4` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-5` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-6` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-7` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-8` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-9` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `sm` | both |
| `.at-col-sm-auto` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `sm` | both |
| `.at-col-sm-cust` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-cust-w`, `--at-gtr` | — | `sm` | both |
| `.at-col-xl` | `flex-basis`, `flex-grow`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `xl` | both |
| `.at-col-xl-1` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-10` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-11` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-12` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-2` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-2m3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-4` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-5` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-6` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-7` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-8` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-9` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xl` | both |
| `.at-col-xl-auto` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `xl` | both |
| `.at-col-xl-cust` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-cust-w`, `--at-gtr` | — | `xl` | both |
| `.at-col-xs-2m3` | `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `xs` | both |
| `.at-col-xxl` | `flex-basis`, `flex-grow`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-1` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-10` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-11` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-12` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-2` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-2m3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-3` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-4` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-5` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-6` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-7` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-8` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-9` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-col-gap`, `--at-gap`, `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-auto` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-gtr` | — | `xxl` | both |
| `.at-col-xxl-cust` | `flex`, `max-width`, `min-height`, `padding-left`, `padding-right`, `position`, `width` | `--at-cust-w`, `--at-gtr` | — | `xxl` | both |
| `.at-ctnr` | `margin-left`, `margin-right`, `max-width`, `padding-left`, `padding-right` | `--at-ctnr`, `--at-gtr` | — | — | both |
| `.at-ctnr-fld` | `margin-left`, `margin-right`, `max-width`, `padding-left`, `padding-right` | `--at-gtr` | — | — | both |
| `.at-ctnr-min` | `margin-left`, `margin-right`, `max-width`, `padding-left`, `padding-right` | `--at-ctnr-min`, `--at-gtr` | — | — | both |
| `.at-gap` | `gap` | `--at-gap` | — | — | both |
| `.at-no-gtr` | `margin-left`, `margin-right`, `padding-left`, `padding-right` | — | — | — | both |
| `.at-row` | `box-sizing`, `display`, `flex-wrap`, `margin-left`, `margin-right` | `--at-box-szg`, `--at-gtr` | — | — | both |
| `.at-row-gap` | `row-gap` | `--at-row-gap`, `--at-gap` | — | — | both |

## Flex utilities (210)

These are plain declarations, so consumer base rules can override them by specificity or order. A consumer that needs them to win should build from `css-template`.

| Class | Property | Variable | Seeds | BP | Bundle |
| --- | --- | --- | --- | --- | --- |
| `.at-al-cont-ard` | `align-content` | — | — | — | both |
| `.at-al-cont-btw` | `align-content` | — | — | — | both |
| `.at-al-cont-ctr` | `align-content` | — | — | — | both |
| `.at-al-cont-end` | `align-content` | — | — | — | both |
| `.at-al-cont-lg-ard` | `align-content` | — | — | `lg` | both |
| `.at-al-cont-lg-btw` | `align-content` | — | — | `lg` | both |
| `.at-al-cont-lg-ctr` | `align-content` | — | — | `lg` | both |
| `.at-al-cont-lg-end` | `align-content` | — | — | `lg` | both |
| `.at-al-cont-lg-st` | `align-content` | — | — | `lg` | both |
| `.at-al-cont-lg-strh` | `align-content` | — | — | `lg` | both |
| `.at-al-cont-md-ard` | `align-content` | — | — | `md` | both |
| `.at-al-cont-md-btw` | `align-content` | — | — | `md` | both |
| `.at-al-cont-md-ctr` | `align-content` | — | — | `md` | both |
| `.at-al-cont-md-end` | `align-content` | — | — | `md` | both |
| `.at-al-cont-md-st` | `align-content` | — | — | `md` | both |
| `.at-al-cont-md-strh` | `align-content` | — | — | `md` | both |
| `.at-al-cont-sm-ard` | `align-content` | — | — | `sm` | both |
| `.at-al-cont-sm-btw` | `align-content` | — | — | `sm` | both |
| `.at-al-cont-sm-ctr` | `align-content` | — | — | `sm` | both |
| `.at-al-cont-sm-end` | `align-content` | — | — | `sm` | both |
| `.at-al-cont-sm-st` | `align-content` | — | — | `sm` | both |
| `.at-al-cont-sm-strh` | `align-content` | — | — | `sm` | both |
| `.at-al-cont-st` | `align-content` | — | — | — | both |
| `.at-al-cont-strh` | `align-content` | — | — | — | both |
| `.at-al-cont-xl-ard` | `align-content` | — | — | `xl` | both |
| `.at-al-cont-xl-btw` | `align-content` | — | — | `xl` | both |
| `.at-al-cont-xl-ctr` | `align-content` | — | — | `xl` | both |
| `.at-al-cont-xl-end` | `align-content` | — | — | `xl` | both |
| `.at-al-cont-xl-st` | `align-content` | — | — | `xl` | both |
| `.at-al-cont-xl-strh` | `align-content` | — | — | `xl` | both |
| `.at-al-cont-xxl-ard` | `align-content` | — | — | `xxl` | both |
| `.at-al-cont-xxl-btw` | `align-content` | — | — | `xxl` | both |
| `.at-al-cont-xxl-ctr` | `align-content` | — | — | `xxl` | both |
| `.at-al-cont-xxl-end` | `align-content` | — | — | `xxl` | both |
| `.at-al-cont-xxl-st` | `align-content` | — | — | `xxl` | both |
| `.at-al-cont-xxl-strh` | `align-content` | — | — | `xxl` | both |
| `.at-al-itm-bsln` | `align-items` | — | — | — | both |
| `.at-al-itm-ctr` | `align-items` | — | — | — | both |
| `.at-al-itm-end` | `align-items` | — | — | — | both |
| `.at-al-itm-lg-bsln` | `align-items` | — | — | `lg` | both |
| `.at-al-itm-lg-ctr` | `align-items` | — | — | `lg` | both |
| `.at-al-itm-lg-end` | `align-items` | — | — | `lg` | both |
| `.at-al-itm-lg-st` | `align-items` | — | — | `lg` | both |
| `.at-al-itm-lg-strh` | `align-items` | — | — | `lg` | both |
| `.at-al-itm-md-bsln` | `align-items` | — | — | `md` | both |
| `.at-al-itm-md-ctr` | `align-items` | — | — | `md` | both |
| `.at-al-itm-md-end` | `align-items` | — | — | `md` | both |
| `.at-al-itm-md-st` | `align-items` | — | — | `md` | both |
| `.at-al-itm-md-strh` | `align-items` | — | — | `md` | both |
| `.at-al-itm-sm-bsln` | `align-items` | — | — | `sm` | both |
| `.at-al-itm-sm-ctr` | `align-items` | — | — | `sm` | both |
| `.at-al-itm-sm-end` | `align-items` | — | — | `sm` | both |
| `.at-al-itm-sm-st` | `align-items` | — | — | `sm` | both |
| `.at-al-itm-sm-strh` | `align-items` | — | — | `sm` | both |
| `.at-al-itm-st` | `align-items` | — | — | — | both |
| `.at-al-itm-strh` | `align-items` | — | — | — | both |
| `.at-al-itm-xl-bsln` | `align-items` | — | — | `xl` | both |
| `.at-al-itm-xl-ctr` | `align-items` | — | — | `xl` | both |
| `.at-al-itm-xl-end` | `align-items` | — | — | `xl` | both |
| `.at-al-itm-xl-st` | `align-items` | — | — | `xl` | both |
| `.at-al-itm-xl-strh` | `align-items` | — | — | `xl` | both |
| `.at-al-itm-xxl-bsln` | `align-items` | — | — | `xxl` | both |
| `.at-al-itm-xxl-ctr` | `align-items` | — | — | `xxl` | both |
| `.at-al-itm-xxl-end` | `align-items` | — | — | `xxl` | both |
| `.at-al-itm-xxl-st` | `align-items` | — | — | `xxl` | both |
| `.at-al-itm-xxl-strh` | `align-items` | — | — | `xxl` | both |
| `.at-al-slf-auto` | `align-self` | — | — | — | both |
| `.at-al-slf-bsln` | `align-self` | — | — | — | both |
| `.at-al-slf-ctr` | `align-self` | — | — | — | both |
| `.at-al-slf-end` | `align-self` | — | — | — | both |
| `.at-al-slf-lg-auto` | `align-self` | — | — | `lg` | both |
| `.at-al-slf-lg-bsln` | `align-self` | — | — | `lg` | both |
| `.at-al-slf-lg-ctr` | `align-self` | — | — | `lg` | both |
| `.at-al-slf-lg-end` | `align-self` | — | — | `lg` | both |
| `.at-al-slf-lg-st` | `align-self` | — | — | `lg` | both |
| `.at-al-slf-lg-strh` | `align-self` | — | — | `lg` | both |
| `.at-al-slf-md-auto` | `align-self` | — | — | `md` | both |
| `.at-al-slf-md-bsln` | `align-self` | — | — | `md` | both |
| `.at-al-slf-md-ctr` | `align-self` | — | — | `md` | both |
| `.at-al-slf-md-end` | `align-self` | — | — | `md` | both |
| `.at-al-slf-md-st` | `align-self` | — | — | `md` | both |
| `.at-al-slf-md-strh` | `align-self` | — | — | `md` | both |
| `.at-al-slf-sm-auto` | `align-self` | — | — | `sm` | both |
| `.at-al-slf-sm-bsln` | `align-self` | — | — | `sm` | both |
| `.at-al-slf-sm-ctr` | `align-self` | — | — | `sm` | both |
| `.at-al-slf-sm-end` | `align-self` | — | — | `sm` | both |
| `.at-al-slf-sm-st` | `align-self` | — | — | `sm` | both |
| `.at-al-slf-sm-strh` | `align-self` | — | — | `sm` | both |
| `.at-al-slf-st` | `align-self` | — | — | — | both |
| `.at-al-slf-strh` | `align-self` | — | — | — | both |
| `.at-al-slf-xl-auto` | `align-self` | — | — | `xl` | both |
| `.at-al-slf-xl-bsln` | `align-self` | — | — | `xl` | both |
| `.at-al-slf-xl-ctr` | `align-self` | — | — | `xl` | both |
| `.at-al-slf-xl-end` | `align-self` | — | — | `xl` | both |
| `.at-al-slf-xl-st` | `align-self` | — | — | `xl` | both |
| `.at-al-slf-xl-strh` | `align-self` | — | — | `xl` | both |
| `.at-al-slf-xxl-auto` | `align-self` | — | — | `xxl` | both |
| `.at-al-slf-xxl-bsln` | `align-self` | — | — | `xxl` | both |
| `.at-al-slf-xxl-ctr` | `align-self` | — | — | `xxl` | both |
| `.at-al-slf-xxl-end` | `align-self` | — | — | `xxl` | both |
| `.at-al-slf-xxl-st` | `align-self` | — | — | `xxl` | both |
| `.at-al-slf-xxl-strh` | `align-self` | — | — | `xxl` | both |
| `.at-flx-col` | `flex-direction` | — | — | — | both |
| `.at-flx-col-rev` | `flex-direction` | — | — | — | both |
| `.at-flx-fil` | `flex` | — | — | — | both |
| `.at-flx-grw-0` | `flex-grow` | — | — | — | both |
| `.at-flx-grw-1` | `flex-grow` | — | — | — | both |
| `.at-flx-lg-col` | `flex-direction` | — | — | `lg` | both |
| `.at-flx-lg-col-rev` | `flex-direction` | — | — | `lg` | both |
| `.at-flx-lg-fil` | `flex` | — | — | `lg` | both |
| `.at-flx-lg-grw-0` | `flex-grow` | — | — | `lg` | both |
| `.at-flx-lg-grw-1` | `flex-grow` | — | — | `lg` | both |
| `.at-flx-lg-nowrp` | `flex-wrap` | — | — | `lg` | both |
| `.at-flx-lg-row` | `flex-direction` | — | — | `lg` | both |
| `.at-flx-lg-row-rev` | `flex-direction` | — | — | `lg` | both |
| `.at-flx-lg-srnk-0` | `flex-shrink` | — | — | `lg` | both |
| `.at-flx-lg-srnk-1` | `flex-shrink` | — | — | `lg` | both |
| `.at-flx-lg-wrp` | `flex-wrap` | — | — | `lg` | both |
| `.at-flx-lg-wrp-rev` | `flex-wrap` | — | — | `lg` | both |
| `.at-flx-md-col` | `flex-direction` | — | — | `md` | both |
| `.at-flx-md-col-rev` | `flex-direction` | — | — | `md` | both |
| `.at-flx-md-fil` | `flex` | — | — | `md` | both |
| `.at-flx-md-grw-0` | `flex-grow` | — | — | `md` | both |
| `.at-flx-md-grw-1` | `flex-grow` | — | — | `md` | both |
| `.at-flx-md-nowrp` | `flex-wrap` | — | — | `md` | both |
| `.at-flx-md-row` | `flex-direction` | — | — | `md` | both |
| `.at-flx-md-row-rev` | `flex-direction` | — | — | `md` | both |
| `.at-flx-md-srnk-0` | `flex-shrink` | — | — | `md` | both |
| `.at-flx-md-srnk-1` | `flex-shrink` | — | — | `md` | both |
| `.at-flx-md-wrp` | `flex-wrap` | — | — | `md` | both |
| `.at-flx-md-wrp-rev` | `flex-wrap` | — | — | `md` | both |
| `.at-flx-nowrp` | `flex-wrap` | — | — | — | both |
| `.at-flx-row` | `flex-direction` | — | — | — | both |
| `.at-flx-row-rev` | `flex-direction` | — | — | — | both |
| `.at-flx-sm-col` | `flex-direction` | — | — | `sm` | both |
| `.at-flx-sm-col-rev` | `flex-direction` | — | — | `sm` | both |
| `.at-flx-sm-fil` | `flex` | — | — | `sm` | both |
| `.at-flx-sm-grw-0` | `flex-grow` | — | — | `sm` | both |
| `.at-flx-sm-grw-1` | `flex-grow` | — | — | `sm` | both |
| `.at-flx-sm-nowrp` | `flex-wrap` | — | — | `sm` | both |
| `.at-flx-sm-row` | `flex-direction` | — | — | `sm` | both |
| `.at-flx-sm-row-rev` | `flex-direction` | — | — | `sm` | both |
| `.at-flx-sm-srnk-0` | `flex-shrink` | — | — | `sm` | both |
| `.at-flx-sm-srnk-1` | `flex-shrink` | — | — | `sm` | both |
| `.at-flx-sm-wrp` | `flex-wrap` | — | — | `sm` | both |
| `.at-flx-sm-wrp-rev` | `flex-wrap` | — | — | `sm` | both |
| `.at-flx-srnk-0` | `flex-shrink` | — | — | — | both |
| `.at-flx-srnk-1` | `flex-shrink` | — | — | — | both |
| `.at-flx-wrp` | `flex-wrap` | — | — | — | both |
| `.at-flx-wrp-rev` | `flex-wrap` | — | — | — | both |
| `.at-flx-xl-col` | `flex-direction` | — | — | `xl` | both |
| `.at-flx-xl-col-rev` | `flex-direction` | — | — | `xl` | both |
| `.at-flx-xl-fil` | `flex` | — | — | `xl` | both |
| `.at-flx-xl-grw-0` | `flex-grow` | — | — | `xl` | both |
| `.at-flx-xl-grw-1` | `flex-grow` | — | — | `xl` | both |
| `.at-flx-xl-nowrp` | `flex-wrap` | — | — | `xl` | both |
| `.at-flx-xl-row` | `flex-direction` | — | — | `xl` | both |
| `.at-flx-xl-row-rev` | `flex-direction` | — | — | `xl` | both |
| `.at-flx-xl-srnk-0` | `flex-shrink` | — | — | `xl` | both |
| `.at-flx-xl-srnk-1` | `flex-shrink` | — | — | `xl` | both |
| `.at-flx-xl-wrp` | `flex-wrap` | — | — | `xl` | both |
| `.at-flx-xl-wrp-rev` | `flex-wrap` | — | — | `xl` | both |
| `.at-flx-xxl-col` | `flex-direction` | — | — | `xxl` | both |
| `.at-flx-xxl-col-rev` | `flex-direction` | — | — | `xxl` | both |
| `.at-flx-xxl-fil` | `flex` | — | — | `xxl` | both |
| `.at-flx-xxl-grw-0` | `flex-grow` | — | — | `xxl` | both |
| `.at-flx-xxl-grw-1` | `flex-grow` | — | — | `xxl` | both |
| `.at-flx-xxl-nowrp` | `flex-wrap` | — | — | `xxl` | both |
| `.at-flx-xxl-row` | `flex-direction` | — | — | `xxl` | both |
| `.at-flx-xxl-row-rev` | `flex-direction` | — | — | `xxl` | both |
| `.at-flx-xxl-srnk-0` | `flex-shrink` | — | — | `xxl` | both |
| `.at-flx-xxl-srnk-1` | `flex-shrink` | — | — | `xxl` | both |
| `.at-flx-xxl-wrp` | `flex-wrap` | — | — | `xxl` | both |
| `.at-flx-xxl-wrp-rev` | `flex-wrap` | — | — | `xxl` | both |
| `.at-jfy-cont-ard` | `justify-content` | — | — | — | both |
| `.at-jfy-cont-btw` | `justify-content` | — | — | — | both |
| `.at-jfy-cont-ctr` | `justify-content` | — | — | — | both |
| `.at-jfy-cont-end` | `justify-content` | — | — | — | both |
| `.at-jfy-cont-evnly` | `justify-content` | — | — | — | both |
| `.at-jfy-cont-lg-ard` | `justify-content` | — | — | `lg` | both |
| `.at-jfy-cont-lg-btw` | `justify-content` | — | — | `lg` | both |
| `.at-jfy-cont-lg-ctr` | `justify-content` | — | — | `lg` | both |
| `.at-jfy-cont-lg-end` | `justify-content` | — | — | `lg` | both |
| `.at-jfy-cont-lg-evnly` | `justify-content` | — | — | `lg` | both |
| `.at-jfy-cont-lg-st` | `justify-content` | — | — | `lg` | both |
| `.at-jfy-cont-md-ard` | `justify-content` | — | — | `md` | both |
| `.at-jfy-cont-md-btw` | `justify-content` | — | — | `md` | both |
| `.at-jfy-cont-md-ctr` | `justify-content` | — | — | `md` | both |
| `.at-jfy-cont-md-end` | `justify-content` | — | — | `md` | both |
| `.at-jfy-cont-md-evnly` | `justify-content` | — | — | `md` | both |
| `.at-jfy-cont-md-st` | `justify-content` | — | — | `md` | both |
| `.at-jfy-cont-sm-ard` | `justify-content` | — | — | `sm` | both |
| `.at-jfy-cont-sm-btw` | `justify-content` | — | — | `sm` | both |
| `.at-jfy-cont-sm-ctr` | `justify-content` | — | — | `sm` | both |
| `.at-jfy-cont-sm-end` | `justify-content` | — | — | `sm` | both |
| `.at-jfy-cont-sm-evnly` | `justify-content` | — | — | `sm` | both |
| `.at-jfy-cont-sm-st` | `justify-content` | — | — | `sm` | both |
| `.at-jfy-cont-st` | `justify-content` | — | — | — | both |
| `.at-jfy-cont-xl-ard` | `justify-content` | — | — | `xl` | both |
| `.at-jfy-cont-xl-btw` | `justify-content` | — | — | `xl` | both |
| `.at-jfy-cont-xl-ctr` | `justify-content` | — | — | `xl` | both |
| `.at-jfy-cont-xl-end` | `justify-content` | — | — | `xl` | both |
| `.at-jfy-cont-xl-evnly` | `justify-content` | — | — | `xl` | both |
| `.at-jfy-cont-xl-st` | `justify-content` | — | — | `xl` | both |
| `.at-jfy-cont-xxl-ard` | `justify-content` | — | — | `xxl` | both |
| `.at-jfy-cont-xxl-btw` | `justify-content` | — | — | `xxl` | both |
| `.at-jfy-cont-xxl-ctr` | `justify-content` | — | — | `xxl` | both |
| `.at-jfy-cont-xxl-end` | `justify-content` | — | — | `xxl` | both |
| `.at-jfy-cont-xxl-evnly` | `justify-content` | — | — | `xxl` | both |
| `.at-jfy-cont-xxl-st` | `justify-content` | — | — | `xxl` | both |

## Display utilities (54)

These are plain declarations, so consumer base rules can override them by specificity or order. `.at-tbl` is listed here for its `display`, but it also applies `caption-side` and `table-layout` from the Properties layer.

| Class | Property | Variable | Seeds | BP | Bundle |
| --- | --- | --- | --- | --- | --- |
| `.at-blk` | `display` | — | — | — | both |
| `.at-d-non` | `display` | — | — | — | both |
| `.at-flx` | `display` | — | — | — | both |
| `.at-inl` | `display` | — | — | — | both |
| `.at-inl-blk` | `display` | — | — | — | both |
| `.at-inl-flx` | `display` | — | — | — | both |
| `.at-lg-blk` | `display` | — | — | `lg` | both |
| `.at-lg-d-non` | `display` | — | — | `lg` | both |
| `.at-lg-flx` | `display` | — | — | `lg` | both |
| `.at-lg-inl` | `display` | — | — | `lg` | both |
| `.at-lg-inl-blk` | `display` | — | — | `lg` | both |
| `.at-lg-inl-flx` | `display` | — | — | `lg` | both |
| `.at-lg-tbl` | `display` | — | — | `lg` | both |
| `.at-lg-tbl-cel` | `display` | — | — | `lg` | both |
| `.at-lg-tbl-row` | `display` | — | — | `lg` | both |
| `.at-md-blk` | `display` | — | — | `md` | both |
| `.at-md-d-non` | `display` | — | — | `md` | both |
| `.at-md-flx` | `display` | — | — | `md` | both |
| `.at-md-inl` | `display` | — | — | `md` | both |
| `.at-md-inl-blk` | `display` | — | — | `md` | both |
| `.at-md-inl-flx` | `display` | — | — | `md` | both |
| `.at-md-tbl` | `display` | — | — | `md` | both |
| `.at-md-tbl-cel` | `display` | — | — | `md` | both |
| `.at-md-tbl-row` | `display` | — | — | `md` | both |
| `.at-sm-blk` | `display` | — | — | `sm` | both |
| `.at-sm-d-non` | `display` | — | — | `sm` | both |
| `.at-sm-flx` | `display` | — | — | `sm` | both |
| `.at-sm-inl` | `display` | — | — | `sm` | both |
| `.at-sm-inl-blk` | `display` | — | — | `sm` | both |
| `.at-sm-inl-flx` | `display` | — | — | `sm` | both |
| `.at-sm-tbl` | `display` | — | — | `sm` | both |
| `.at-sm-tbl-cel` | `display` | — | — | `sm` | both |
| `.at-sm-tbl-row` | `display` | — | — | `sm` | both |
| `.at-tbl` | `caption-side`, `display`, `table-layout` | `--at-cpt-sd`, `--at-tbl-lyt` | — | — | both |
| `.at-tbl-cel` | `display` | — | — | — | both |
| `.at-tbl-row` | `display` | — | — | — | both |
| `.at-xl-blk` | `display` | — | — | `xl` | both |
| `.at-xl-d-non` | `display` | — | — | `xl` | both |
| `.at-xl-flx` | `display` | — | — | `xl` | both |
| `.at-xl-inl` | `display` | — | — | `xl` | both |
| `.at-xl-inl-blk` | `display` | — | — | `xl` | both |
| `.at-xl-inl-flx` | `display` | — | — | `xl` | both |
| `.at-xl-tbl` | `display` | — | — | `xl` | both |
| `.at-xl-tbl-cel` | `display` | — | — | `xl` | both |
| `.at-xl-tbl-row` | `display` | — | — | `xl` | both |
| `.at-xxl-blk` | `display` | — | — | `xxl` | both |
| `.at-xxl-d-non` | `display` | — | — | `xxl` | both |
| `.at-xxl-flx` | `display` | — | — | `xxl` | both |
| `.at-xxl-inl` | `display` | — | — | `xxl` | both |
| `.at-xxl-inl-blk` | `display` | — | — | `xxl` | both |
| `.at-xxl-inl-flx` | `display` | — | — | `xxl` | both |
| `.at-xxl-tbl` | `display` | — | — | `xxl` | both |
| `.at-xxl-tbl-cel` | `display` | — | — | `xxl` | both |
| `.at-xxl-tbl-row` | `display` | — | — | `xxl` | both |

## Order / offset / print (176)

Present only in `css-max/atomic-max.css`; linking the minimal bundle makes them inert. They apply inside `@media print` like any other rule, so an author print stylesheet of equal specificity that comes later will override them.

| Class | Property | Variable | Seeds | BP | Bundle |
| --- | --- | --- | --- | --- | --- |
| `.at-ofst-1` | `margin-left` | — | — | — | max only |
| `.at-ofst-10` | `margin-left` | — | — | — | max only |
| `.at-ofst-11` | `margin-left` | — | — | — | max only |
| `.at-ofst-2` | `margin-left` | — | — | — | max only |
| `.at-ofst-2m3` | `margin-left` | — | — | — | max only |
| `.at-ofst-3` | `margin-left` | — | — | — | max only |
| `.at-ofst-4` | `margin-left` | — | — | — | max only |
| `.at-ofst-5` | `margin-left` | — | — | — | max only |
| `.at-ofst-6` | `margin-left` | — | — | — | max only |
| `.at-ofst-7` | `margin-left` | — | — | — | max only |
| `.at-ofst-8` | `margin-left` | — | — | — | max only |
| `.at-ofst-9` | `margin-left` | — | — | — | max only |
| `.at-ofst-lg-0` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-1` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-10` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-11` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-2` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-2m3` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-3` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-4` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-5` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-6` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-7` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-8` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-lg-9` | `margin-left` | — | — | `lg` | max only |
| `.at-ofst-md-0` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-1` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-10` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-11` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-2` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-2m3` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-3` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-4` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-5` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-6` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-7` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-8` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-md-9` | `margin-left` | — | — | `md` | max only |
| `.at-ofst-sm-0` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-1` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-10` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-11` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-2` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-2m3` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-3` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-4` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-5` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-6` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-7` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-8` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-sm-9` | `margin-left` | — | — | `sm` | max only |
| `.at-ofst-xl-0` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-1` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-10` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-11` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-2` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-2m3` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-3` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-4` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-5` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-6` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-7` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-8` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xl-9` | `margin-left` | — | — | `xl` | max only |
| `.at-ofst-xxl-0` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-1` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-10` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-11` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-2` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-2m3` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-3` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-4` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-5` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-6` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-7` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-8` | `margin-left` | — | — | `xxl` | max only |
| `.at-ofst-xxl-9` | `margin-left` | — | — | `xxl` | max only |
| `.at-ord-0` | `order` | — | — | — | max only |
| `.at-ord-1` | `order` | — | — | — | max only |
| `.at-ord-10` | `order` | — | — | — | max only |
| `.at-ord-11` | `order` | — | — | — | max only |
| `.at-ord-12` | `order` | — | — | — | max only |
| `.at-ord-2` | `order` | — | — | — | max only |
| `.at-ord-3` | `order` | — | — | — | max only |
| `.at-ord-4` | `order` | — | — | — | max only |
| `.at-ord-5` | `order` | — | — | — | max only |
| `.at-ord-6` | `order` | — | — | — | max only |
| `.at-ord-7` | `order` | — | — | — | max only |
| `.at-ord-8` | `order` | — | — | — | max only |
| `.at-ord-9` | `order` | — | — | — | max only |
| `.at-ord-first` | `order` | — | — | — | max only |
| `.at-ord-last` | `order` | — | — | — | max only |
| `.at-ord-lg-0` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-1` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-10` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-11` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-12` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-2` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-3` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-4` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-5` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-6` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-7` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-8` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-9` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-first` | `order` | — | — | `lg` | max only |
| `.at-ord-lg-last` | `order` | — | — | `lg` | max only |
| `.at-ord-md-0` | `order` | — | — | `md` | max only |
| `.at-ord-md-1` | `order` | — | — | `md` | max only |
| `.at-ord-md-10` | `order` | — | — | `md` | max only |
| `.at-ord-md-11` | `order` | — | — | `md` | max only |
| `.at-ord-md-12` | `order` | — | — | `md` | max only |
| `.at-ord-md-2` | `order` | — | — | `md` | max only |
| `.at-ord-md-3` | `order` | — | — | `md` | max only |
| `.at-ord-md-4` | `order` | — | — | `md` | max only |
| `.at-ord-md-5` | `order` | — | — | `md` | max only |
| `.at-ord-md-6` | `order` | — | — | `md` | max only |
| `.at-ord-md-7` | `order` | — | — | `md` | max only |
| `.at-ord-md-8` | `order` | — | — | `md` | max only |
| `.at-ord-md-9` | `order` | — | — | `md` | max only |
| `.at-ord-md-first` | `order` | — | — | `md` | max only |
| `.at-ord-md-last` | `order` | — | — | `md` | max only |
| `.at-ord-sm-0` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-1` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-10` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-11` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-12` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-2` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-3` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-4` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-5` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-6` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-7` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-8` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-9` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-first` | `order` | — | — | `sm` | max only |
| `.at-ord-sm-last` | `order` | — | — | `sm` | max only |
| `.at-ord-xl-0` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-1` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-10` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-11` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-12` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-2` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-3` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-4` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-5` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-6` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-7` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-8` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-9` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-first` | `order` | — | — | `xl` | max only |
| `.at-ord-xl-last` | `order` | — | — | `xl` | max only |
| `.at-ord-xxl-0` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-1` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-10` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-11` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-12` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-2` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-3` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-4` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-5` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-6` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-7` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-8` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-9` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-first` | `order` | — | — | `xxl` | max only |
| `.at-ord-xxl-last` | `order` | — | — | `xxl` | max only |
| `.at-prt-blk` | `display` | — | — | — | max only |
| `.at-prt-flx` | `display` | — | — | — | max only |
| `.at-prt-inl` | `display` | — | — | — | max only |
| `.at-prt-inl-blk` | `display` | — | — | — | max only |
| `.at-prt-inl-flx` | `display` | — | — | — | max only |
| `.at-prt-non` | `display` | — | — | — | max only |
| `.at-prt-tbl` | `display` | — | — | — | max only |
| `.at-prt-tbl-cel` | `display` | — | — | — | max only |
| `.at-prt-tbl-row` | `display` | — | — | — | max only |

## Structural classes (17)

The framework owns this geometry so compositions work with no consumer stylesheet. A structural class sets plain CSS for its own geometry and reads a variable only for values a consumer is expected to configure.

| Class | Property | Variable | Seeds | BP | Bundle |
| --- | --- | --- | --- | --- | --- |
| `.at-abs-el` | `bottom`, `height`, `position`, `top`, `width` | — | — | — | both |
| `.at-bg-vid` | — | — | `--at-pos`, `--at-z-idx` | — | both |
| `.at-blk-shp` | `position`, `z-index` | — | `--at-pos` | — | both |
| `.at-dropcap` | `float` | — | — | — | both |
| `.at-has-abs-wrp` | `position` | — | — | — | both |
| `.at-ovl` | `content`, `height`, `left`, `position`, `top`, `transition`, `width`, `z-index` | `--at-trs` | `--at-pos`, `--at-z-idx` | — | both |
| `.at-ovl-cl` | `background` | `--at-ovl` | — | — | both |
| `.at-ovl-grd` | `background` | `--at-ovl` | — | — | both |
| `.at-shp` | `position`, `z-index` | — | `--at-l`, `--at-pos`, `--at-w`, `--at-z-idx` | — | both |
| `.at-shp-b` | — | — | `--at-b` | — | both |
| `.at-shp-t` | — | — | `--at-t` | — | both |
| `.at-stky` | `align-self`, `position`, `top` | — | — | — | both |
| `.at-svg-wrp` | `height`, `line-height`, `width` | — | — | — | both |
| `.at-vid-bg` | `object-fit` | — | `--at-l`, `--at-pos`, `--at-t`, `--at-z-idx` | — | both |
| `.at-vrt` | `gap` | `--at-gap`, `--at-vrt-gap` | — | — | both |
| `.at-vrt-conts` | `width` | `--at-gap`, `--at-vrt-gap`, `--at-vrt-w` | — | — | both |
| `.at-vrt-hdr` | `width` | `--at-vrt-w` | — | — | both |

## Property utilities (55)

One class applies a property, reading the matching variable. `initial` is the fallback, so the class is inert until you set the variable.

| Class | Property | Variable | Seeds | BP | Bundle |
| --- | --- | --- | --- | --- | --- |
| `.at-acl` | `accent-color` | `--at-acl` | — | — | both |
| `.at-bdr` | `border-color`, `border-style`, `border-width` | `--at-bdr-cl`, `--at-bdr-sty`, `--at-bdr-w` | — | — | both |
| `.at-bdr-rad` | `border-radius` | `--at-bdr-rad` | — | — | both |
| `.at-bg-cl` | `background-color` | `--at-bg-cl` | — | — | both |
| `.at-bg-img` | `background-attachment`, `background-blend-mode`, `background-image`, `background-origin`, `background-position`, `background-repeat`, `background-size` | `--at-bg-img`, `--at-bg-atch`, `--at-bg-blend-mode`, `--at-bg-org`, `--at-bg-pos`, `--at-bg-rpt`, `--at-bg-sz` | — | — | both |
| `.at-box-sdw` | `box-shadow` | `--at-box-sdw` | — | — | both |
| `.at-box-szg` | `box-sizing` | `--at-box-szg` | — | — | both |
| `.at-cl` | `color` | `--at-cl` | — | — | both |
| `.at-clp-pth` | `clip-path` | `--at-clp-pth` | — | — | both |
| `.at-clr` | `clear` | `--at-clr` | — | — | both |
| `.at-ct-cl` | `caret-color` | `--at-ct-cl` | — | — | both |
| `.at-cur` | `cursor` | `--at-cur` | — | — | both |
| `.at-dir` | `direction` | `--at-dir` | — | — | both |
| `.at-fl` | `filter` | `--at-fl` | — | — | both |
| `.at-fnt-fam` | `font-family` | `--at-fnt-fam` | — | — | both |
| `.at-fnt-sty` | `font-style` | `--at-fnt-sty` | — | — | both |
| `.at-fnt-sz` | `font-size` | `--at-fnt-sz` | — | — | both |
| `.at-fnt-wt` | `font-weight` | `--at-fnt-wt` | — | — | both |
| `.at-h` | `height` | `--at-h` | — | — | both |
| `.at-ln-h` | `line-height` | `--at-ln-h` | — | — | both |
| `.at-ls` | `color`, `font-size`, `list-style-image`, `list-style-position`, `list-style-type` | `--at-ls-img`, `--at-ls-pos`, `--at-ls-typ`, `--at-mkr-cl`, `--at-mkr-sz` | — | — | both |
| `.at-ltr-sp` | `letter-spacing` | `--at-ltr-sp` | — | — | both |
| `.at-m` | `margin` | `--at-m` | — | — | both |
| `.at-max-h` | `max-height` | `--at-max-h` | — | — | both |
| `.at-max-w` | `max-width` | `--at-max-w` | — | — | both |
| `.at-min-h` | `min-height` | `--at-min-h` | — | — | both |
| `.at-min-w` | `min-width` | `--at-min-w` | — | — | both |
| `.at-mix-blnd-mode` | `mix-blend-mode` | `--at-mix-blnd-mode`, `--at-mix-blend-mode` | — | — | both |
| `.at-msk` | `mask-image`, `mask-mode`, `mask-origin`, `mask-position`, `mask-repeat`, `mask-size` | `--at-msk-img`, `--at-msk-mode`, `--at-msk-org`, `--at-msk-pos`, `--at-msk-rpt`, `--at-msk-sz` | — | — | both |
| `.at-obj-fit` | `object-fit` | `--at-obj-fit` | — | — | both |
| `.at-opa` | `opacity` | `--at-opa` | — | — | both |
| `.at-outl` | `outline` | `--at-outl` | — | — | both |
| `.at-ovf` | `overflow` | `--at-ovf` | — | — | both |
| `.at-ovf-x` | `overflow-x` | `--at-ovf-x` | — | — | both |
| `.at-ovf-y` | `overflow-y` | `--at-ovf-y` | — | — | both |
| `.at-p` | `padding` | `--at-p` | — | — | both |
| `.at-pos` | `bottom`, `left`, `position`, `right`, `top` | `--at-pos`, `--at-b`, `--at-l`, `--at-r`, `--at-t` | — | — | both |
| `.at-ptr-ev` | `pointer-events` | `--at-ptr-ev` | — | — | both |
| `.at-resz` | `resize` | `--at-resz` | — | — | both |
| `.at-svg` | `fill` | `--at-cl` | — | — | both |
| `.at-tab-sz` | `tab-size` | `--at-tab-sz` | — | — | both |
| `.at-tf` | `perspective`, `perspective-origin`, `transform`, `transform-origin`, `transform-style` | `--at-tf`, `--at-ppv`, `--at-ppv-org`, `--at-tf-org`, `--at-tf-sty` | — | — | both |
| `.at-trs` | `transition` | `--at-trs` | — | — | both |
| `.at-txt-al` | `text-align` | `--at-txt-al` | — | — | both |
| `.at-txt-dec` | `text-decoration` | `--at-txt-dec` | — | — | both |
| `.at-txt-ovf` | `text-overflow` | `--at-txt-ovf` | — | — | both |
| `.at-txt-sdw` | `text-shadow` | `--at-txt-sdw` | — | — | both |
| `.at-txt-tf` | `text-transform` | `--at-txt-tf` | — | — | both |
| `.at-vis` | `visibility` | `--at-vis` | — | — | both |
| `.at-w` | `width` | `--at-w` | — | — | both |
| `.at-white-sp` | `white-space` | `--at-white-sp` | — | — | both |
| `.at-wrd-brk` | `word-break` | `--at-wrd-brk` | — | — | both |
| `.at-wrd-spc` | `word-spacing` | `--at-wrd-spc`, `--at-wrd-spg` | — | — | both |
| `.at-wrd-wrp` | `word-wrap` | `--at-wrd-wrp` | — | — | both |
| `.at-z-idx` | `position`, `z-index` | `--at-z-idx` | — | — | both |

## The 2m3 fifths ladder (7)

The `2m3` family is the fifths column. Each class is a separate term of one
ladder. The two facts below are derived separately from the compiled CSS, because a
term can have the column box and a `max-width` at once, and conflating them
misreports terms that do.

| Class | Base column geometry | `max-width` applied in |
| --- | --- | --- |
| `at-col-2m3` | yes | base (all widths) |
| `at-col-xs-2m3` | yes | _none_ |
| `at-col-sm-2m3` | yes | 576px |
| `at-col-md-2m3` | yes | 768px |
| `at-col-lg-2m3` | yes | 992px |
| `at-col-xl-2m3` | yes | 1200px |
| `at-col-xxl-2m3` | yes | 1400px |

So `.at-col-2m3` on its own is capped at every width, while `.at-col-xs-2m3` only widens to `100%` — to get the cap from `sm` up you apply both, and that term supplies the `max-width` once its media query matches.

`2m3` is a misleading token name: it reads as "2 and a half of 3" but ships 20%,
which is 1 of 5. The name was not changed because a rename is breaking under
ARCHITECTURE.md § The token contract.

## Seeded reads (7)

These classes declare a `--at-*` value instead of setting a property with it, so that
a utility elsewhere picks the value up. A seed has no effect on its own: you must also
apply one of the reading utilities below, either on the same element or on a child.
The framework ships no component CSS, so nothing else consumes a seed.

| Class | Seeds | Read by |
| --- | --- | --- |
| `.at-bg-vid` | `--at-pos`, `--at-z-idx` | `.at-pos`, `.at-z-idx` |
| `.at-blk-shp` | `--at-pos` | `.at-pos` |
| `.at-ovl` | `--at-pos`, `--at-z-idx` | `.at-pos`, `.at-z-idx` |
| `.at-shp` | `--at-l`, `--at-pos`, `--at-w`, `--at-z-idx` | `.at-pos`, `.at-w`, `.at-z-idx` |
| `.at-shp-b` | `--at-b` | `.at-pos` |
| `.at-shp-t` | `--at-t` | `.at-pos` |
| `.at-vid-bg` | `--at-l`, `--at-pos`, `--at-t`, `--at-z-idx` | `.at-pos`, `.at-z-idx` |

## Variables (93)

A utility is inert until you set the variable it reads. `initial` is the deliberate
fallback: the framework imposes nothing until you supply a value.

| Variable | Fallback | Read by |
| --- | --- | --- |
| `--at-acl` | `initial` | 1 |
| `--at-b` | `initial` | 1 |
| `--at-bdr-cl` | `initial` | 1 |
| `--at-bdr-rad` | `initial` | 1 |
| `--at-bdr-sty` | `initial` | 1 |
| `--at-bdr-w` | `initial` | 1 |
| `--at-bg-atch` | `initial` | 1 |
| `--at-bg-blend-mode` | `initial` | 1 |
| `--at-bg-cl` | `initial` | 1 |
| `--at-bg-img` | `initial` | 1 |
| `--at-bg-org` | `initial` | 1 |
| `--at-bg-pos` | `initial` | 1 |
| `--at-bg-rpt` | `initial` | 1 |
| `--at-bg-sz` | `initial` | 1 |
| `--at-box-sdw` | `initial` | 1 |
| `--at-box-szg` | `border-box` _(in 1)_<br>`initial` _(in 1)_ | 2 |
| `--at-cl` | _(none — unset means invalid)_<br>`initial` _(in 1)_ | 2 |
| `--at-clp-pth` | `initial` | 1 |
| `--at-clr` | `initial` | 1 |
| `--at-col-gap` | `var(--at-gap, 0px)` — contextual chain _(in 78)_<br>`var(--at-gap)` — contextual chain _(in 1)_ | 79 |
| `--at-cpt-sd` | `initial` | 1 |
| `--at-ct-cl` | `initial` | 1 |
| `--at-ctnr` | `1140px` | 1 |
| `--at-ctnr-min` | `1100px` | 1 |
| `--at-cur` | `initial` | 1 |
| `--at-cust-w` | _(none — unset means invalid)_ | 6 |
| `--at-dir` | `initial` | 1 |
| `--at-fl` | `initial` | 1 |
| `--at-fnt-fam` | `initial` | 1 |
| `--at-fnt-sty` | `initial` | 1 |
| `--at-fnt-sz` | `initial` | 1 |
| `--at-fnt-wt` | `initial` | 1 |
| `--at-gap` | _(none — unset means invalid)_<br>`0px` _(in 78)_<br>`15px` _(in 2)_<br>`initial` _(in 1)_ | 83 |
| `--at-gtr` | `15px` | 101 |
| `--at-h` | `initial` | 1 |
| `--at-l` | `initial` | 1 |
| `--at-ln-h` | `initial` | 1 |
| `--at-ls-img` | `none` | 1 |
| `--at-ls-pos` | `outside` | 1 |
| `--at-ls-typ` | `none` | 1 |
| `--at-ltr-sp` | `initial` | 1 |
| `--at-m` | `initial` | 1 |
| `--at-max-h` | `initial` | 1 |
| `--at-max-w` | `initial` | 1 |
| `--at-min-h` | `initial` | 1 |
| `--at-min-w` | `initial` | 1 |
| `--at-mix-blend-mode` | `initial`<br>_legacy name — still honoured as the nested fallback of `--at-mix-blnd-mode`, which is the one to set_ | 1 |
| `--at-mix-blnd-mode` | `var(--at-mix-blend-mode, initial)` — nested chain, legacy name `--at-mix-blend-mode` | 1 |
| `--at-mkr-cl` | `initial` | 1 |
| `--at-mkr-sz` | `initial` | 1 |
| `--at-msk-img` | `initial` | 1 |
| `--at-msk-mode` | `initial` | 1 |
| `--at-msk-org` | `initial` | 1 |
| `--at-msk-pos` | `initial` | 1 |
| `--at-msk-rpt` | `initial` | 1 |
| `--at-msk-sz` | `initial` | 1 |
| `--at-obj-fit` | `initial` | 1 |
| `--at-opa` | `initial` | 1 |
| `--at-outl` | `initial` | 1 |
| `--at-ovf` | `initial` | 1 |
| `--at-ovf-x` | `initial` | 1 |
| `--at-ovf-y` | `initial` | 1 |
| `--at-ovl` | `initial` | 2 |
| `--at-p` | `initial` | 1 |
| `--at-pos` | `initial` | 1 |
| `--at-ppv` | `initial` | 1 |
| `--at-ppv-org` | `initial` | 1 |
| `--at-ptr-ev` | `initial` | 1 |
| `--at-r` | `initial` | 1 |
| `--at-resz` | `initial` | 1 |
| `--at-row-gap` | `var(--at-gap)` — contextual chain | 1 |
| `--at-t` | `initial` | 1 |
| `--at-tab-sz` | `initial` | 1 |
| `--at-tbl-lyt` | `initial` | 1 |
| `--at-tf` | `initial` | 1 |
| `--at-tf-org` | `initial` | 1 |
| `--at-tf-sty` | `initial` | 1 |
| `--at-trs` | `initial` | 2 |
| `--at-txt-al` | `initial` | 1 |
| `--at-txt-dec` | `initial` | 1 |
| `--at-txt-ovf` | `initial` | 1 |
| `--at-txt-sdw` | `initial` | 1 |
| `--at-txt-tf` | `initial` | 1 |
| `--at-vis` | `initial` | 1 |
| `--at-vrt-gap` | `var(--at-gap, 15px)` — contextual chain | 2 |
| `--at-vrt-w` | `20%` | 2 |
| `--at-w` | `initial` | 1 |
| `--at-white-sp` | `initial` | 1 |
| `--at-wrd-brk` | `initial` | 1 |
| `--at-wrd-spc` | `var(--at-wrd-spg, initial)` — nested chain, legacy name `--at-wrd-spg` | 1 |
| `--at-wrd-spg` | `initial`<br>_legacy name — still honoured as the nested fallback of `--at-wrd-spc`, which is the one to set_ | 1 |
| `--at-wrd-wrp` | `initial` | 1 |
| `--at-z-idx` | `initial` | 1 |

- `--at-acl` — .at-acl
- `--at-b` — .at-pos
- `--at-bdr-cl` — .at-bdr
- `--at-bdr-rad` — .at-bdr-rad
- `--at-bdr-sty` — .at-bdr
- `--at-bdr-w` — .at-bdr
- `--at-bg-atch` — .at-bg-img
- `--at-bg-blend-mode` — .at-bg-img
- `--at-bg-cl` — .at-bg-cl
- `--at-bg-img` — .at-bg-img
- `--at-bg-org` — .at-bg-img
- `--at-bg-pos` — .at-bg-img
- `--at-bg-rpt` — .at-bg-img
- `--at-bg-sz` — .at-bg-img
- `--at-box-sdw` — .at-box-sdw
- `--at-box-szg` — .at-box-szg, .at-row
- `--at-cl` — .at-cl, .at-svg
- `--at-clp-pth` — .at-clp-pth
- `--at-clr` — .at-clr
- `--at-col-gap` — .at-col-1, .at-col-10, .at-col-11, .at-col-12, .at-col-2, .at-col-2m3, .at-col-3, .at-col-4, .at-col-5, .at-col-6, .at-col-7, .at-col-8, .at-col-9, .at-col-gap, .at-col-lg-1, .at-col-lg-10, .at-col-lg-11, .at-col-lg-12, .at-col-lg-2, .at-col-lg-2m3, .at-col-lg-3, .at-col-lg-4, .at-col-lg-5, .at-col-lg-6, .at-col-lg-7, .at-col-lg-8, .at-col-lg-9, .at-col-md-1, .at-col-md-10, .at-col-md-11, .at-col-md-12, .at-col-md-2, .at-col-md-2m3, .at-col-md-3, .at-col-md-4, .at-col-md-5, .at-col-md-6, .at-col-md-7, .at-col-md-8, .at-col-md-9, .at-col-sm-1, .at-col-sm-10, .at-col-sm-11, .at-col-sm-12, .at-col-sm-2, .at-col-sm-2m3, .at-col-sm-3, .at-col-sm-4, .at-col-sm-5, .at-col-sm-6, .at-col-sm-7, .at-col-sm-8, .at-col-sm-9, .at-col-xl-1, .at-col-xl-10, .at-col-xl-11, .at-col-xl-12, .at-col-xl-2, .at-col-xl-2m3, .at-col-xl-3, .at-col-xl-4, .at-col-xl-5, .at-col-xl-6, .at-col-xl-7, .at-col-xl-8, .at-col-xl-9, .at-col-xxl-1, .at-col-xxl-10, .at-col-xxl-11, .at-col-xxl-12, .at-col-xxl-2, .at-col-xxl-2m3, .at-col-xxl-3, .at-col-xxl-4, .at-col-xxl-5, .at-col-xxl-6, .at-col-xxl-7, .at-col-xxl-8, .at-col-xxl-9
- `--at-cpt-sd` — .at-tbl
- `--at-ct-cl` — .at-ct-cl
- `--at-ctnr` — .at-ctnr
- `--at-ctnr-min` — .at-ctnr-min
- `--at-cur` — .at-cur
- `--at-cust-w` — .at-col-cust, .at-col-lg-cust, .at-col-md-cust, .at-col-sm-cust, .at-col-xl-cust, .at-col-xxl-cust
- `--at-dir` — .at-dir
- `--at-fl` — .at-fl
- `--at-fnt-fam` — .at-fnt-fam
- `--at-fnt-sty` — .at-fnt-sty
- `--at-fnt-sz` — .at-fnt-sz
- `--at-fnt-wt` — .at-fnt-wt
- `--at-gap` — .at-col-1, .at-col-10, .at-col-11, .at-col-12, .at-col-2, .at-col-2m3, .at-col-3, .at-col-4, .at-col-5, .at-col-6, .at-col-7, .at-col-8, .at-col-9, .at-col-gap, .at-col-lg-1, .at-col-lg-10, .at-col-lg-11, .at-col-lg-12, .at-col-lg-2, .at-col-lg-2m3, .at-col-lg-3, .at-col-lg-4, .at-col-lg-5, .at-col-lg-6, .at-col-lg-7, .at-col-lg-8, .at-col-lg-9, .at-col-md-1, .at-col-md-10, .at-col-md-11, .at-col-md-12, .at-col-md-2, .at-col-md-2m3, .at-col-md-3, .at-col-md-4, .at-col-md-5, .at-col-md-6, .at-col-md-7, .at-col-md-8, .at-col-md-9, .at-col-sm-1, .at-col-sm-10, .at-col-sm-11, .at-col-sm-12, .at-col-sm-2, .at-col-sm-2m3, .at-col-sm-3, .at-col-sm-4, .at-col-sm-5, .at-col-sm-6, .at-col-sm-7, .at-col-sm-8, .at-col-sm-9, .at-col-xl-1, .at-col-xl-10, .at-col-xl-11, .at-col-xl-12, .at-col-xl-2, .at-col-xl-2m3, .at-col-xl-3, .at-col-xl-4, .at-col-xl-5, .at-col-xl-6, .at-col-xl-7, .at-col-xl-8, .at-col-xl-9, .at-col-xxl-1, .at-col-xxl-10, .at-col-xxl-11, .at-col-xxl-12, .at-col-xxl-2, .at-col-xxl-2m3, .at-col-xxl-3, .at-col-xxl-4, .at-col-xxl-5, .at-col-xxl-6, .at-col-xxl-7, .at-col-xxl-8, .at-col-xxl-9, .at-gap, .at-row-gap, .at-vrt, .at-vrt-conts
- `--at-gtr` — .at-col, .at-col-1, .at-col-10, .at-col-11, .at-col-12, .at-col-2, .at-col-2m3, .at-col-3, .at-col-4, .at-col-5, .at-col-6, .at-col-7, .at-col-8, .at-col-9, .at-col-auto, .at-col-cust, .at-col-lg, .at-col-lg-1, .at-col-lg-10, .at-col-lg-11, .at-col-lg-12, .at-col-lg-2, .at-col-lg-2m3, .at-col-lg-3, .at-col-lg-4, .at-col-lg-5, .at-col-lg-6, .at-col-lg-7, .at-col-lg-8, .at-col-lg-9, .at-col-lg-auto, .at-col-lg-cust, .at-col-md, .at-col-md-1, .at-col-md-10, .at-col-md-11, .at-col-md-12, .at-col-md-2, .at-col-md-2m3, .at-col-md-3, .at-col-md-4, .at-col-md-5, .at-col-md-6, .at-col-md-7, .at-col-md-8, .at-col-md-9, .at-col-md-auto, .at-col-md-cust, .at-col-sm, .at-col-sm-1, .at-col-sm-10, .at-col-sm-11, .at-col-sm-12, .at-col-sm-2, .at-col-sm-2m3, .at-col-sm-3, .at-col-sm-4, .at-col-sm-5, .at-col-sm-6, .at-col-sm-7, .at-col-sm-8, .at-col-sm-9, .at-col-sm-auto, .at-col-sm-cust, .at-col-xl, .at-col-xl-1, .at-col-xl-10, .at-col-xl-11, .at-col-xl-12, .at-col-xl-2, .at-col-xl-2m3, .at-col-xl-3, .at-col-xl-4, .at-col-xl-5, .at-col-xl-6, .at-col-xl-7, .at-col-xl-8, .at-col-xl-9, .at-col-xl-auto, .at-col-xl-cust, .at-col-xs-2m3, .at-col-xxl, .at-col-xxl-1, .at-col-xxl-10, .at-col-xxl-11, .at-col-xxl-12, .at-col-xxl-2, .at-col-xxl-2m3, .at-col-xxl-3, .at-col-xxl-4, .at-col-xxl-5, .at-col-xxl-6, .at-col-xxl-7, .at-col-xxl-8, .at-col-xxl-9, .at-col-xxl-auto, .at-col-xxl-cust, .at-ctnr, .at-ctnr-fld, .at-ctnr-min, .at-row
- `--at-h` — .at-h
- `--at-l` — .at-pos
- `--at-ln-h` — .at-ln-h
- `--at-ls-img` — .at-ls
- `--at-ls-pos` — .at-ls
- `--at-ls-typ` — .at-ls
- `--at-ltr-sp` — .at-ltr-sp
- `--at-m` — .at-m
- `--at-max-h` — .at-max-h
- `--at-max-w` — .at-max-w
- `--at-min-h` — .at-min-h
- `--at-min-w` — .at-min-w
- `--at-mix-blend-mode` — .at-mix-blnd-mode
- `--at-mix-blnd-mode` — .at-mix-blnd-mode
- `--at-mkr-cl` — .at-ls
- `--at-mkr-sz` — .at-ls
- `--at-msk-img` — .at-msk
- `--at-msk-mode` — .at-msk
- `--at-msk-org` — .at-msk
- `--at-msk-pos` — .at-msk
- `--at-msk-rpt` — .at-msk
- `--at-msk-sz` — .at-msk
- `--at-obj-fit` — .at-obj-fit
- `--at-opa` — .at-opa
- `--at-outl` — .at-outl
- `--at-ovf` — .at-ovf
- `--at-ovf-x` — .at-ovf-x
- `--at-ovf-y` — .at-ovf-y
- `--at-ovl` — .at-ovl-cl, .at-ovl-grd
- `--at-p` — .at-p
- `--at-pos` — .at-pos
- `--at-ppv` — .at-tf
- `--at-ppv-org` — .at-tf
- `--at-ptr-ev` — .at-ptr-ev
- `--at-r` — .at-pos
- `--at-resz` — .at-resz
- `--at-row-gap` — .at-row-gap
- `--at-t` — .at-pos
- `--at-tab-sz` — .at-tab-sz
- `--at-tbl-lyt` — .at-tbl
- `--at-tf` — .at-tf
- `--at-tf-org` — .at-tf
- `--at-tf-sty` — .at-tf
- `--at-trs` — .at-ovl, .at-trs
- `--at-txt-al` — .at-txt-al
- `--at-txt-dec` — .at-txt-dec
- `--at-txt-ovf` — .at-txt-ovf
- `--at-txt-sdw` — .at-txt-sdw
- `--at-txt-tf` — .at-txt-tf
- `--at-vis` — .at-vis
- `--at-vrt-gap` — .at-vrt, .at-vrt-conts
- `--at-vrt-w` — .at-vrt-conts, .at-vrt-hdr
- `--at-w` — .at-w
- `--at-white-sp` — .at-white-sp
- `--at-wrd-brk` — .at-wrd-brk
- `--at-wrd-spc` — .at-wrd-spc
- `--at-wrd-spg` — .at-wrd-spc
- `--at-wrd-wrp` — .at-wrd-wrp
- `--at-z-idx` — .at-z-idx

## Token legend (314)

Names are assembled from these tokens, and the same joined string is used for the
class and for the variable: `bg` + `cl` gives `.at-bg-cl` and `--at-bg-cl`.

| Token | Meaning |
| --- | --- |
| `2m3` | fifths column, 1 of 5 (misleading token name; the shipped width is 20%, not 2.5 of 3) |
| `abs` | absolute |
| `acc` | accordion |
| `accent` | accent |
| `accs` | accordions |
| `acl` | accent-color |
| `act` | active |
| `active` | active (full-word class token; see also act) |
| `add` | add |
| `adv` | advanced |
| `al` | align |
| `anc` | ancestor |
| `angle` | angle |
| `ani` | animation |
| `anim` | animation |
| `aply` | autoplay |
| `ard` | around |
| `asp` | aspect |
| `atch` | attachment |
| `attrib` | attributes |
| `aud` | audio |
| `auto` | auto/automatic |
| `b` | bottom |
| `bar` | bar |
| `base` | base |
| `bdr` | border |
| `beh` | behavior |
| `bg` | background |
| `bl` | bottom left |
| `black` | black |
| `blend` | blend (legacy var token; active token is blnd) |
| `blk` | block |
| `blnd` | blend |
| `blr` | blur |
| `blt` | bullet |
| `blts` | bullets |
| `body` | body |
| `border` | border |
| `box` | box |
| `br` | bottom right |
| `brgt` | bright |
| `brk` | break |
| `bs` | base |
| `bsln` | baseline |
| `btn` | button |
| `btw` | between |
| `cap` | cap |
| `cb` | combobox |
| `cel` | cell |
| `cir` | circle |
| `circ` | circumference |
| `cl` | color |
| `clp` | clip |
| `clr` | clear |
| `cnt` | count |
| `cntr` | counter |
| `code` | code |
| `col` | column |
| `color` | color |
| `cols` | columns |
| `cond` | conditional |
| `cont` | content |
| `conts` | contents |
| `cpt` | caption |
| `ct` | caret |
| `ctl` | control |
| `ctnr` | container |
| `ctr` | center |
| `ctrl` | control |
| `ctrs` | contrast |
| `cur` | cursor |
| `cust` | custom |
| `d` | display |
| `danger` | danger |
| `dark` | dark |
| `data` | dt |
| `dec` | decoration |
| `def` | define |
| `defd` | defined |
| `dev` | device |
| `dft` | default |
| `dir` | direction |
| `dist` | distinct |
| `div` | div |
| `divr` | divider |
| `dla` | delay |
| `dropcap` | drop cap |
| `dur` | duration |
| `dyn` | dynamic  |
| `ed` | editor |
| `el` | element |
| `end` | end |
| `eq` | equal |
| `ev` | events |
| `evn` | even |
| `evnly` | evenly |
| `ext` | external |
| `fam` | family |
| `fc` | feature-column |
| `fig` | figure |
| `fil` | fill |
| `fill` | fill (at-nav-tabs-fill variant) |
| `first` | first |
| `fit` | fit |
| `fl` | filter |
| `fld` | fluid |
| `flip` | flip |
| `flt` | floating |
| `flx` | flex |
| `fmt` | format |
| `fn` | function |
| `fnt` | font |
| `focus` | focus |
| `footer` | footer |
| `frm` | from |
| `frnt` | front |
| `ftr` | footer |
| `g` | gradient |
| `gap` | gap |
| `glry` | gallery |
| `grad` | gradient |
| `grd` | gradient |
| `grp` | group |
| `grw` | grow |
| `gtr` | gutter |
| `h` | height |
| `has` | has (wrapper pattern) |
| `hdg` | heading |
| `hdr` | header |
| `heading` | heading |
| `hldr` | holder |
| `hor` | horizontal |
| `hover` | hover |
| `icon` | icon |
| `idx` | index |
| `img` | image |
| `in` | input |
| `inact` | inactive |
| `ind` | indicator |
| `indicator` | indicator |
| `info` | info |
| `inh` | inherited |
| `inl` | inline |
| `input` | input |
| `inset` | inset |
| `inv` | invert |
| `is` | inline-start |
| `iter` | iteration |
| `itm` | item |
| `itms` | items |
| `jfy` | justify |
| `l` | left |
| `last` | last |
| `lb` | lightbox |
| `lbl` | label |
| `len` | length |
| `lg` | large device |
| `lh-n` | line-height-number |
| `light` | light |
| `link` | link |
| `ln` | line |
| `lnk` | link |
| `loc` | location |
| `ls` | list |
| `ltr` | letter |
| `lvl` | level |
| `lyt` | layout |
| `m` | margin |
| `map` | map |
| `mas` | masonry |
| `max` | max |
| `mb` | mobile |
| `md` | medium device |
| `menu` | menu |
| `min` | min |
| `mix` | mix |
| `mkr` | marker |
| `mod` | mod |
| `mode` | mode |
| `mrq` | marquee |
| `msk` | mask |
| `mtdt` | meta-data |
| `mty` | empty |
| `multi` | multi |
| `nav` | navigation |
| `no` | no (negation) |
| `non` | none |
| `nowrp` | no wrap |
| `obj` | object |
| `octonary` | octonary |
| `ofst` | offset |
| `op` | opacity |
| `opa` | opacity |
| `open` | open |
| `ord` | order |
| `org` | origin |
| `outl` | outline |
| `outln` | outline (at-btn-outln-* variant) |
| `ov` | over |
| `ovf` | overflow |
| `ovl` | overlay |
| `p` | padding |
| `pad` | padding |
| `pane` | pane |
| `pause` | pause |
| `pct` | percent |
| `pgn` | pagination |
| `pl` | place |
| `plain` | plain |
| `pnl` | panel |
| `pos` | position |
| `post` | post |
| `pp` | Popup |
| `ppv` | perspective |
| `primary` | primary |
| `prog` | progress |
| `prt` | print |
| `psr` | poster |
| `pth` | path |
| `ptr` | pointer |
| `quaternary` | quaternary |
| `quinary` | quinary |
| `r` | right |
| `rad` | radius |
| `rat` | ratio |
| `rating` | rating |
| `refl` | reflect |
| `resp` | responsive |
| `resz` | resize |
| `rev` | reverse |
| `rew` | rewind |
| `rm` | remove |
| `rot` | rotate |
| `row` | row |
| `rpt` | repeat |
| `rst` | reset |
| `rt` | rating |
| `rtl` | right-to-left |
| `sart` | saturate |
| `sc` | screen |
| `scl` | scale |
| `scr` | scroll |
| `sd` | side |
| `sdbar` | sidebar |
| `sdw` | shadow |
| `sec` | section |
| `secondary` | secondary |
| `select` | select |
| `sep` | separated |
| `set` | setting |
| `shp` | shape |
| `sldr` | slider |
| `slf` | self |
| `sm` | small-device |
| `sp` | space |
| `spc` | spacing (class token; legacy var --at-wrd-spg uses spg) |
| `speed` | speed |
| `spg` | spacing |
| `spinner` | spinner |
| `sprd` | spread |
| `srch` | search |
| `srnk` | shrink |
| `st` | start |
| `stky` | sticky |
| `str` | string |
| `strh` | stretch |
| `strk` | stroke |
| `sty` | style |
| `success` | success |
| `svg` | svg |
| `sz` | size |
| `szg` | sizing |
| `t` | top |
| `tab` | tab |
| `tabs` | tabs |
| `tbl` | table |
| `tertiary` | tertiary |
| `tf` | transform |
| `tgt` | target |
| `tkr` | ticker |
| `tl` | top-left |
| `tmg` | timing |
| `toc` | table of content |
| `tog` | toggle |
| `tpl` | template |
| `tr` | top-right |
| `transl` | translate |
| `trk` | track |
| `trs` | transition |
| `ttip` | Tooltip |
| `ttl` | title |
| `twtr` | typewriter |
| `txt` | text |
| `typ` | typography |
| `type` | type |
| `typo` | typography (post title type variant) |
| `url` | url |
| `vid` | video |
| `vis` | visibility |
| `vrt` | vertical |
| `w` | width |
| `warning` | warning |
| `white` | white |
| `wrd` | word |
| `wrp` | wrap |
| `wt` | weight |
| `x` | x axis |
| `xl` | x-large-device |
| `xs` | x-small-device |
| `xxl` | xx-large-device |
| `y` | y axis |
| `ytb` | youtube-feed |
| `z` | z (z-index) |
| `zoom` | zoom |

