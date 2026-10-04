# Classes and tokens

`../generated/CLASS-REFERENCE.json` — inside this skill, generated from the
compiled CSS — is the only truth for names. This file is the map around it.

## Look a name up before you use it

```bash
# run from this skill's folder — the one holding SKILL.md
REF=generated/CLASS-REFERENCE.json

# what does this class apply, read and seed?
node -p "JSON.stringify(require('./$REF').classes.find(c=>c.name==='at-p'),null,1)"
# { "name": "at-p", "kind": "property", "bundle": "both", "breakpoint": null,
#   "properties": ["padding"], "reads": ["--at-p"], "seeds": [], "importance": "none",
#   "tokens": ["p"] }

# who reads a variable, and what is its fallback?
node -p "JSON.stringify(require('./$REF').variables.find(v=>v.name==='--at-ctnr'),null,1)"

# is a name real at all?
node -p "require('./$REF').classes.some(c=>c.name==='at-mt-4')"   # false

# what abbreviation is this?
node -p "require('./$REF').legend['bg']"                           # "background"
```

`classes[]` fields: `name` (no leading dot), `kind`, `bundle` (`both` /
`max only`), `breakpoint`, `properties`, `reads`, `seeds`, `importance`,
`tokens`. The values of `kind` are `grid`, `flex`, `display`, `property`,
`structural`, `order-offset-print` — it is a field on each class, not a
separate key.

`variables[]` fields: `name`, `fallback`, `chain`, `legacy`, `readBy`.

## Naming grammar

`at` + legend tokens joined by `-`; the class and its variable always share the
joined string, so `.at-bg-cl` reads `--at-bg-cl`. The pattern is consistent but
**not complete** — guessing is how you get a name that silently does nothing.

### Where the legend is

**The legend is inside this skill.** It is the `legend` key of the generated
reference, all 317 entries, byte-identical to the framework's `short-names.json`:

```bash
node -p "require('./generated/CLASS-REFERENCE.json').legend['bg']"     # background
node -p "require('./generated/CLASS-REFERENCE.json').legend['h1']"     # heading level 1
node -p "Object.keys(require('./generated/CLASS-REFERENCE.json').legend).length"
```

There is deliberately **no second copy** in this folder. A hand-maintained copy of
317 entries would drift from the generated one, nothing would catch it, and an
agent reading the stale copy would hit a token check that fails for no stated
reason. `short-names.json` exists in the framework repo and ships in the npm
tarball for tooling that needs the raw file — this skill does not, because it
carries the same data in a form it can regenerate and gate.

To add a token, change `short-names.json` and re-run `npm run docs`. The count
below is asserted against the generated reference by CI, so a stale legend fails
the build rather than shipping.

## Breakpoints

| Infix | Min width |
| --- | --- |
| *(none)* | 0 — applies at all widths |
| `sm` | 576px |
| `md` | 768px |
| `lg` | 992px |
| `xl` | 1200px |
| `xxl` | 1400px |

Mobile-first, `min-width` only. There is no `max-width` variant: "below a
breakpoint" means omitting the infix. There is **no `xs` breakpoint** — it has
no `min-width`, so it has no infix to write.

### Infix position is not uniform

| Family | Base | From `md` up |
| --- | --- | --- |
| Columns | `.at-col-6` | `.at-col-md-6` |
| Flex direction | `.at-flx-row` | `.at-flx-md-row` |
| Justify | `.at-jfy-cont-btw` | `.at-jfy-cont-md-btw` |
| Align items | `.at-al-itm-ctr` | `.at-al-itm-md-ctr` |
| **Display** | `.at-blk` | `.at-md-blk` |

Infix in the **middle** for columns/flex/justify/align; **first** for display.
Infix-first forms are for display only; the flex, justify, align and column
families keep the infix in the middle.

## Grid (104 classes)

Reach for these before writing any layout CSS. Hand-rolled percentage widths,
`flex: 0 0 50%` and ad-hoc breakpoints are all covered here, and a second
declaration of a property a class already applies is a second source of truth
that will drift.

The layout vocabulary is the framework's and is not re-invented: a column's
basis, max-width and gutter padding are computed by the bundle as a scale (the
`calc()` and gutter maths further down this section), so writing them by hand
puts a measurement where a scale step belongs and a second opinion in the
cascade. Colour utilities beyond the framework pair are yours, in your own
namespace, the same way `at-btn-*` is — see
[the consumer contract](patterns.md#the-consumer-contract).

| Class | Does |
| --- | --- |
| `.at-ctnr` | Centred, `max-width: var(--at-ctnr, 1140px)` |
| `.at-ctnr-min` | Same at `var(--at-ctnr-min, 1100px)` |
| `.at-ctnr-fld` | Fluid, full width |
| `.at-row` | `display: flex; flex-wrap: wrap` + negative margins that cancel the gutter |
| `.at-col-1` … `.at-col-12` | Span N of 12, gap-aware |
| `.at-col` … `.at-col-xxl` | **Equal share, no span** — `flex: 1 1 0` from that breakpoint up, the remaining space split evenly |
| `.at-col-auto` | Size to content |
| `.at-col-cust` | Span `--at-cust-w` — no fallback, inert until set |
| `.at-no-gtr` | Cancel the gutter on the row and its direct columns |
| `.at-gap` `.at-row-gap` `.at-col-gap` | Gaps (see the chain below) |

Every column family takes a breakpoint infix: `.at-col-sm-6`, `.at-col-md-4`,
`.at-col-lg-auto`, and so on. That is where the 104 comes from — 72 numeric
spans (12 × 6 breakpoints) + 6 equal-share + 6 `2m3` + 6 `auto` + 6 `cust` +
2 containers + the row, the gutter cancel and the three gap classes.

`.at-col` (the equal-share family) is the one worth knowing: for a row where you
do not want to do the division yourself, `.at-col-sm-3 .at-col-md-2` gives three
equal columns on small screens and two from `md` up, with no span arithmetic.

`.at-row *` also sets `box-sizing: var(--at-box-szg, border-box)`, so columns
are border-box by default.

A column's width is `calc(<fraction> - var(--at-col-gap, var(--at-gap, 0px)) * <k>)`,
e.g. `.at-col-6` is `calc(50% - var(--at-col-gap, var(--at-gap, 0px)) * 0.5)`.

### Gap chain

- `--at-gap` unset → columns resolve to `0`, `.at-gap` applies `initial`.
- `--at-row-gap` falls back to `var(--at-gap)`; `--at-col-gap` likewise.
- `.at-vrt` is the exception: `gap: var(--at-vrt-gap, var(--at-gap, 15px))`.

### The gutter is counted once — two coherent arrangements

A column's basis already reads `--at-col-gap` (falling back to `--at-gap`), so
the gutter is subtracted from each column's own share. The row must also spend
it as a real `column-gap`. That gives exactly two coherent arrangements:

1. **Gutter padding and no `gap`** — columns keep their gutter padding, the row
   has no `column-gap`. The gutter is the padding.
2. **`at-no-gtr` with a seeded `--at-col-gap`** — columns lose their padding, the
   row carries `at-col-gap` and a real `column-gap`. The column basis subtracts
   the same value, so the gutter is counted once.

It cannot be both. Seeding `--at-col-gap` while `at-gap` is also on the row
double-counts the gutter: the row spends a real `column-gap` *and* every column
still subtracts the same value from its own basis, so the content ends up
`colGap` narrower than the space the row reserved for it. It is silent because
nothing errors — the grid just sits short of the container's right edge.

Unseeded, `--at-col-gap` falls back to `0px` and the columns sum to exactly 100%,
which is coherent, not broken. The gap is simply absent.

#### The third way, which is broken: a raw `gap` on a row

**Inside a row, the gutter has to be a variable. A `gap` property set in your own
CSS adds space that no column subtracts, and the row overflows by the total gap.**

```css
/* WRONG — the columns still subtract var(--at-col-gap, var(--at-gap, 0px)) = 0px,
   so this puts 20px of real column-gap between columns that already fill 100%. */
.my-layout.at-row { gap: 20px; }
```

Four columns at `0` subtracted fill `4 × 25% = 100%` of the container. A real
`column-gap` of `20px` adds `3 × 20px = 60px` on top, and the row overflows its
container by exactly the gap total. Nothing errors and nothing looks obviously
wrong until the container is full width.

`.at-row` sets **no** `column-gap` of its own — only `.at-col-gap` does, and it
reads the variable. So the two correct options remain the two above:

```css
/* 1. Gutter as padding (the default): seed nothing, keep --at-gtr. */
.at-row { }

/* 2. Gutter as a real gap: drop the padding AND seed the variable the columns read. */
.at-row.at-no-gtr { --at-col-gap: 20px; }
```

The same value has to reach both sides, because the row spends it and the
columns subtract it. A property can only ever reach one of them.

**This is scoped to the grid.** A raw `gap` inside a plain `at-flx` container is
fine — nothing there is a `calc()` reading the same variable, so there is nothing
to double-count. The rule is: *where the container's children are sized by a
formula that reads the gap, the gap must be a variable.*

**Columns can still overflow on content, and that is a different fault.** No
`.at-col-*` sets `min-width`, and a flex item's `min-width` defaults to `auto`,
so a column holding a long URL, a `<pre>`, a wide table, or unbroken CJK text
refuses to shrink past its content and spills over its neighbour. Fix it on the
column:

```html
<div class="at-col-6 at-min-w">…</div>        <!-- min-width: 0 -->
<div class="at-col-6 at-wrd-wrp">…</div>     <!-- or break the content -->
```

This is the commonest flexbox-grid defect, and it is a content problem rather
than a gutter one — no gap value will change it.

### The `2m3` fifths ladder

`2m3` reads as "2 and a half of 3" but ships **20% — one fifth**. The name was
never changed because renaming is breaking. Each class is one term of a ladder:

| Class | Alone it gives |
| --- | --- |
| `.at-col-2m3` | `max-width` at every width |
| `.at-col-sm-2m3` … `.at-col-xxl-2m3` | `max-width` from that breakpoint up |

`.at-col-2m3` on its own is capped at every width.

## Flex (210) and display (54)

Both are plain declarations, so your own CSS overrides them by specificity or
order. Flex direction: `at-flx-row`, `at-flx-col`, `at-flx-row-rev`,
`at-flx-col-rev`. Wrap: `at-flx-wrp`, `at-flx-nowrp`, `at-flx-wrp-rev`. Grow and
shrink: `at-flx-fil`, `at-flx-grw-0`, `at-flx-grw-1`, `at-flx-srnk-0`,
`at-flx-srnk-1`. Justify: `at-jfy-cont-{st,end,ctr,btw,ard,evnly}`. Align items:
`at-al-itm-{st,end,ctr,bsln,strh}`. Align content: `at-al-cont-{st,end,ctr,btw,ard,strh}`.
Align self: `at-al-slf-{auto,st,end,ctr,bsln,strh}`. Display: `at-d-non`,
`at-inl`, `at-inl-blk`, `at-blk`, `at-flx`, `at-inl-flx`, `at-tbl`,
`at-tbl-row`, `at-tbl-cel`.

Hiding below a breakpoint and showing it above works only in this order:

```html
<div class="at-d-non at-lg-blk">hidden until lg</div>
```

The reverse (a breakpoint `display: none` plus a base `display: block`) does not,
because the base rule comes later and wins the tie.

## Order / offset / print — **max bundle only**

176 classes, absent from the minimal bundle, where they are silently inert:
`.at-ord-0`…`.at-ord-12` plus `.at-ord-first` / `.at-ord-last` (order), all also
per-breakpoint; `.at-ofst-1`…`.at-ofst-11` (offset, applied as `margin-left`, so
RTL mirrors it — note the range stops at 11, unlike order's 12); `.at-prt-*`
(display inside `@media print`). Fifth offsets are `.at-ofst-2m3` and its
per-breakpoint forms.

## Property utilities (55)

Each applies a property by reading a variable — `bg`+`cl` gives
`.at-bg-cl { background-color: var(--at-bg-cl, initial) }`.

| Class | Property / variables |
| --- | --- |
| `.at-p` `.at-m` | `padding` / `margin` |
| `.at-w` `.at-h` `.at-max-w` `.at-max-h` `.at-min-w` `.at-min-h` | sizing |
| `.at-cl` `.at-bg-cl` `.at-bg-img` | colour and background |
| `.at-bdr` | `--at-bdr-cl` + `--at-bdr-w` + `--at-bdr-sty` |
| `.at-bdr-rad` `.at-box-sdw` `.at-box-szg` `.at-outl` | box |
| `.at-fnt-sz` `.at-fnt-wt` `.at-fnt-fam` `.at-fnt-sty` | font |
| `.at-txt-al` `.at-txt-tf` `.at-txt-dec` `.at-txt-sdw` `.at-txt-ovf` | text |
| `.at-ln-h` `.at-ltr-sp` `.at-wrd-wrp` `.at-wrd-brk` `.at-wrd-spc` `.at-white-sp` | text flow |
| `.at-ovf` `.at-ovf-x` `.at-ovf-y` | overflow |
| `.at-pos` `.at-z-idx` | position group |
| `.at-tf` | transform family (`--at-tf`, `--at-tf-org`, `--at-tf-sty`, `--at-ppv`, `--at-ppv-org`) |
| `.at-msk` `.at-fnt-*` `.at-svg` `.at-ls` `.at-trs` `.at-vis` `.at-clr` `.at-ptr-ev` `.at-resz` `.at-tab-sz` | the rest |

Two names keep a nested fallback for a superseded spelling — set the first, the
second still works: `--at-wrd-spc` → `var(--at-wrd-spg, initial)` and
`--at-mix-blnd-mode` → `var(--at-mix-blend-mode, initial)`.

`.at-svg { fill: var(--at-cl) }` has **no fallback**: unset makes the
declaration invalid, not transparent.

## Structural classes (17)

Framework-owned geometry, so a composition works with no consumer stylesheet.
They set plain CSS, not variables, and read a variable only for values you are
meant to configure.

| Class | Does |
| --- | --- |
| `.at-ovl` + `.at-ovl-cl` / `.at-ovl-grd` | builds the `:after` layer, then paints it from `--at-ovl` |
| `.at-blk-shp` + `.at-shp` + `.at-shp-t` / `.at-shp-b` | halves of a block |
| `.at-stky` | `position: sticky; top: 0` plus `align-self: flex-start` |
| `.at-dropcap` | `float: left` on `::first-letter` — geometry only |
| `.at-has-abs-wrp` + `.at-abs-el` | `position: relative` context and an absolutely filling child |
| `.at-svg-wrp` | collapses the SVG line box; the SVG is fixed at `100%`/`100%` and reads no channel |
| `.at-bg-vid` + `.at-vid-bg` | video-as-background pair |
| `.at-vrt` + `.at-vrt-hdr` + `.at-vrt-conts` | fixed-width rail beside scrolling content |

`-cl` and `-grd` are behaviourally identical (`background: var(--at-ovl)`); the
name only signals that `--at-ovl` should hold a gradient. `.at-vrt-hdr` is
`width: var(--at-vrt-w, 20%)`.

`.at-vrt` sets **only** `gap`, so it needs `at-flx` on the same element or the gap
does nothing and the two children stack.

### Five selectors that are not a plain class

Everywhere else in the bundles a selector is one class, which is what makes "a
utility always beats your element defaults" true by construction. These five are
not, and each can reach past a stylesheet of your own:

| Selector | Effect | Watch out for |
| --- | --- | --- |
| `html` | `scroll-behavior` | The only element rule. Ties with your own `html` rule; source order decides. |
| `.at-row *` | `box-sizing` | Applies to **every** descendant, not just columns — a `*` box-sizing reset is redundant inside a row. |
| `.at-no-gtr > .at-col` | strips column padding | Expected. |
| `.at-no-gtr > [class*=at-col-]` | strips padding from any class **containing** `at-col-` | One of your own classes with that substring silently loses its padding inside an `at-no-gtr` row. |
| `.at-blk-shp > :not(.at-shp):not(.at-z-idx)` | `position: relative; z-index: 2` | A direct child carrying `at-z-idx` is **excluded** and paints wrong. |

There are no others; `check:parity` fails the build if a sixth appears.

### Seeded reads (7)

These *declare* a variable so a co-applied utility picks it up. **A seed does
nothing alone.**

| Class | Seeds | Read by |
| --- | --- | --- |
| `.at-shp` | `--at-l` `--at-pos` `--at-w` `--at-z-idx` | `.at-pos` `.at-w` `.at-z-idx` |
| `.at-shp-t` / `.at-shp-b` | `--at-t` / `--at-b` | `.at-pos` |
| `.at-ovl` | `--at-pos` `--at-z-idx` | `.at-pos` `.at-z-idx` |
| `.at-blk-shp` | `--at-pos` | `.at-pos` |
| `.at-bg-vid` | `--at-pos` `--at-z-idx` | `.at-pos` `.at-z-idx` |
| `.at-vid-bg` | `--at-l` `--at-t` `--at-pos` `--at-z-idx` | `.at-pos` `.at-z-idx` |

```html
<div class="at-shp at-w at-pos">sized and positioned by the seed</div>
```

## Variables (93 read by the bundles)

Read the `fallback` column before concluding a class does nothing. Almost every
utility falls back to `initial`. The exceptions that matter:

| Variable | Fallback |
| --- | --- |
| `--at-ctnr` | `1140px` |
| `--at-ctnr-min` | `1100px` |
| `--at-gtr` | `15px` |
| `--at-box-szg` | `border-box` in `.at-row *`, `initial` in `.at-box-szg` |
| `--at-cl` | `initial` — but **none** in `.at-svg` |
| `--at-ls-pos` / `--at-ls-img` / `--at-ls-typ` | `outside` / `none` / `none` |
| `--at-cust-w` | none — unset means invalid |
| `--at-vrt-w` | `20%` |
| `--at-gap` | `0px` in grid columns, `15px` in `.at-vrt` |

You also legitimately own tokens the reference does **not** list, because it
only covers variables the bundles read — the button palette (`--at-primary`,
`--at-primary--hover`, `--at-white`, `--at-black`, `--at-base-color`,
`--at-body-color`, `--at-quaternary`) is yours to declare. `verify-usage.mjs`
warns rather than fails on those.

State variants use a double dash and nothing else does: `--at-primary--hover`.
