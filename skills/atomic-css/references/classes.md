# Classes and tokens

The map around [`CLASS-REFERENCE.json`](../generated/CLASS-REFERENCE.json) — inside this skill, generated from the compiled CSS, the only truth for names.

**Owner:** AI reference owner · **Authority:** the consumer contract for the atomic-css 2.0 bundles.

## Contents

- [Look a name up before you use it](#look-a-name-up-before-you-use-it)
- [Naming grammar](#naming-grammar)
- [Breakpoints](#breakpoints)
- [Grid (104 classes)](#grid-104-classes)
- [Flex (210) and display (54)](#flex-210-and-display-54)
- [Order, offset and print (max bundle only)](#order-offset-and-print-max-bundle-only)
- [Property utilities (55)](#property-utilities-55)
- [Structural classes (17)](#structural-classes-17)
- [Variables (93 read by the bundles)](#variables-93-read-by-the-bundles)

## Look a name up before you use it

Run from this skill's folder:

```bash
REF=generated/CLASS-REFERENCE.json
node -p "JSON.stringify(require('./$REF').classes.find(c=>c.name==='at-p'),null,1)"
# { "name": "at-p", "kind": "property", "bundle": "both", "breakpoint": null,
#   "properties": ["padding"], "reads": ["--at-p"], "seeds": [], "importance": "none",
#   "tokens": ["p"] }

node -p "JSON.stringify(require('./$REF').variables.find(v=>v.name==='--at-ctnr'),null,1)"
node -p "require('./$REF').classes.some(c=>c.name==='at-mt-4')"   # false
node -p "require('./$REF').legend['bg']"                          # "background"
```

`classes[]` fields: `name` (no leading dot), `kind` (`grid`, `flex`, `display`, `property`, `structural`, `order-offset-print`), `bundle` (`both` / `max only`), `breakpoint`, `properties`, `reads`, `seeds`, `importance`, `tokens`.

| Field | Meaning |
| --- | --- |
| `properties` | The CSS properties the class applies; autoprefixer clones collapsed |
| `reads` | `--at-*` variables the class reads — empty means plain CSS |
| `seeds` | Variables the class declares for a co-applied utility |
| `breakpoint` | The infix, or `null` for all widths |
| `tokens` | The legend tokens the name is assembled from |

`variables[]` fields: `name`, `fallback`, `chain`, `legacy`, `readBy`, `fallbacks[]` (one per use site — read it when a variable has several), `legacyName`, `legacyHost`.

## Naming grammar

`at` + legend tokens joined by `-`; the class and its variable share the joined string, so `.at-bg-cl` reads `--at-bg-cl`. The pattern is consistent but **not complete** — guessing is how you get a name that silently does nothing. Two conventions that are not guessable:

- **State variants use a double dash**, and nothing else does: `--at-primary--hover`, `--at-danger--active`.
- **Private component tokens are yours to invent.** `--at-btn-*`, `--at-card-*` need no legend entry; the legend is the framework's vocabulary, not a registry you apply to.

### Where the legend is

**The legend is inside this skill**: the `legend` key of the generated reference, all 319 entries. Look one up with the recipe above, or count them:

```bash
node -p "Object.keys(require('./generated/CLASS-REFERENCE.json').legend).length"
```

There is deliberately **no second copy**: a hand-maintained copy of 319 entries would drift from the generated one, nothing would catch it, and an agent reading the stale copy would hit a token check that fails for no stated reason.

## Breakpoints

| Infix | Min width |
| --- | --- |
| *(none)* | 0 — applies at all widths |
| `sm` | 576px |
| `md` | 768px |
| `lg` | 992px |
| `xl` | 1200px |
| `xxl` | 1400px |

Mobile-first, `min-width` only. There is no `max-width` variant, and **no `xs` infix** — it has no `min-width` to write.

### Infix position is not uniform

| Family | Base | From `md` up |
| --- | --- | --- |
| Columns | `.at-col-6` | `.at-col-md-6` |
| Flex direction | `.at-flx-row` | `.at-flx-md-row` |
| Justify | `.at-jfy-cont-btw` | `.at-jfy-cont-md-btw` |
| Align items | `.at-al-itm-ctr` | `.at-al-itm-md-ctr` |
| **Display** | `.at-blk` | `.at-md-blk` |

Middle for columns, flex, justify and align; **first** for display only.

## Grid (104 classes)

Reach for these before writing any layout CSS — a second declaration of a property a class already applies is a second source of truth that will drift.

| Class | Does |
| --- | --- |
| `.at-ctnr` | Centred, `max-width: var(--at-ctnr, 1140px)` |
| `.at-ctnr-min` | Same at `var(--at-ctnr-min, 1100px)` |
| `.at-ctnr-fld` | Fluid, full width |
| `.at-row` | `display: flex; flex-wrap: wrap` + negative margins cancelling the gutter |
| `.at-col-1` … `.at-col-12` | Span N of 12, gap-aware |
| `.at-col` … `.at-col-xxl` | Equal share, no span — `flex: 1 1 0` from that breakpoint up |
| `.at-col-auto` | Size to content |
| `.at-col-cust` | Span `--at-cust-w` — no fallback, inert until set |
| `.at-no-gtr` | Cancel the gutter on the row and its direct columns |
| `.at-gap` `.at-row-gap` `.at-col-gap` | Gaps (chain below) |

Every column family takes a breakpoint infix (`.at-col-md-4`). The 104 = 72 spans (12 × 6 breakpoints) + 6 equal-share + 6 `2m3` + 6 `auto` + 6 `cust` + 2 containers + the row, the gutter cancel and the three gap classes.

`.at-row *` sets `box-sizing: var(--at-box-szg, border-box)`. A column's width is `calc(<fraction> - var(--at-col-gap, var(--at-gap, 0px)) * <k>)` — `.at-col-6` is `calc(50% - var(--at-col-gap, var(--at-gap, 0px)) * 0.5)`.

### Gap chain

- `--at-gap` unset → columns resolve to `0`, `.at-gap` applies `initial`.
- `--at-row-gap` falls back to `var(--at-gap)`; `--at-col-gap` likewise.
- `.at-vrt` is the exception: `gap: var(--at-vrt-gap, var(--at-gap, 15px))`.

### The gutter is counted once (two coherent arrangements)

A column's basis already subtracts `--at-col-gap` (falling back to `--at-gap`), and the row must spend the same value as a real `column-gap`. Exactly two coherent arrangements:

1. **Gutter padding and no `gap`** — columns keep their gutter padding; the gutter is the padding.
2. **`at-no-gtr` with a seeded `--at-col-gap`** — columns lose their padding, the row carries `at-col-gap` and a real `column-gap`; both sides read the same value.

It cannot be both. Seeding `--at-col-gap` while `at-gap` is also on the row double-counts: the row spends a real `column-gap` *and* every column still subtracts the same value from its own basis. Nothing errors — the grid just sits short of the container's right edge.

#### The third way, which is broken: a raw `gap` on a row

**Inside a row, the gutter has to be a variable.** A raw `gap` adds space no column subtracts, and the row overflows by the total gap:

```css
/* WRONG — the columns subtract var(--at-col-gap, var(--at-gap, 0px)) = 0px. */
.my-layout.at-row { gap: 20px; }
```

```css
/* Gutter as padding (the default): seed nothing. */
.at-row { }

/* Gutter as a real gap: drop the padding AND seed the variable the columns read. */
.at-row.at-no-gtr { --at-col-gap: 20px; }
```

The rule: where the container's children are sized by a formula that reads the gap, the gap must be a variable. A raw `gap` inside a plain `at-flx` container is fine.

**Columns can still overflow on content** — a flex item's `min-width` defaults to `auto`, so a long URL, a `<pre>`, a wide table or unbroken CJK text refuses to shrink past its content. Fix it on the column: `.at-min-w` (`min-width: 0`) or `.at-wrd-wrp`.

### The `2m3` fifths ladder

`2m3` reads as "2 and a half of 3" but ships **20% — one fifth**; the name was never changed because renaming is breaking. `.at-col-2m3` alone caps at every width; the per-breakpoint forms cap from their breakpoint up.

## Flex (210) and display (54)

Plain declarations, so your own CSS overrides them by specificity or order. Direction: `at-flx-row`, `at-flx-col`, `at-flx-row-rev`, `at-flx-col-rev`. Wrap: `at-flx-wrp`, `at-flx-nowrp`, `at-flx-wrp-rev`. Grow and shrink: `at-flx-fil`, `at-flx-grw-0`, `at-flx-grw-1`, `at-flx-srnk-0`, `at-flx-srnk-1`. Justify: `at-jfy-cont-{st,end,ctr,btw,ard,evnly}`. Align items: `at-al-itm-{st,end,ctr,bsln,strh}`; align content: `at-al-cont-{st,end,ctr,btw,ard,strh}`; align self: `at-al-slf-{auto,st,end,ctr,bsln,strh}`. Display: `at-d-non`, `at-inl`, `at-inl-blk`, `at-blk`, `at-flx`, `at-inl-flx`, `at-tbl`, `at-tbl-row`, `at-tbl-cel`.

Hiding below a breakpoint and showing it above works only in this order — the reverse does not, because the base rule comes later and wins the tie:

```html
<div class="at-d-non at-lg-blk">hidden until lg</div>
```

## Order, offset and print (max bundle only)

176 classes, absent from the minimal bundle, where they are silently inert: `.at-ord-0`…`.at-ord-12` plus `.at-ord-first` / `.at-ord-last`, all also per-breakpoint; `.at-ofst-1`…`.at-ofst-11` (applied as `margin-left`, so RTL mirrors it — the range stops at 11, unlike order's 12); `.at-prt-*` (display inside `@media print`). Fifth offsets are `.at-ofst-2m3` and its per-breakpoint forms.

## Property utilities (55)

Each applies a property by reading a variable — `bg`+`cl` gives `.at-bg-cl { background-color: var(--at-bg-cl, initial) }`.

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

Two names keep a nested fallback for a superseded spelling — set the first, the second still works: `--at-wrd-spc` → `var(--at-wrd-spg, initial)` and `--at-mix-blnd-mode` → `var(--at-mix-blend-mode, initial)`.

`.at-svg { fill: var(--at-cl) }` has **no fallback**: unset makes the declaration invalid, not transparent.

## Structural classes (17)

Framework-owned geometry, so a composition works with no consumer stylesheet. They set plain CSS, not variables, and read a variable only for values you are meant to configure.

| Class | Does |
| --- | --- |
| `.at-ovl` + `.at-ovl-cl` / `.at-ovl-grd` | builds the `:after` layer, then paints it from `--at-ovl` |
| `.at-blk-shp` + `.at-shp` + `.at-shp-t` / `.at-shp-b` | halves of a block |
| `.at-stky` | `position: sticky; top: 0` plus `align-self: flex-start` |
| `.at-dropcap` | `float: left` on `::first-letter` — geometry only |
| `.at-has-abs-wrp` + `.at-abs-el` | a positioning context and an absolutely filling child |
| `.at-svg-wrp` | collapses the SVG line box; the SVG fills it and reads no channel |
| `.at-bg-vid` + `.at-vid-bg` | video-as-background pair |
| `.at-vrt` + `.at-vrt-hdr` + `.at-vrt-conts` | fixed-width rail beside scrolling content |

`-cl` and `-grd` are behaviourally identical; the name signals that `--at-ovl` should hold a gradient. `.at-vrt` sets **only** `gap`, so it needs `at-flx` on the same element.

### Five selectors that are not a plain class

Everywhere else a selector is one class — which is what makes "a utility always beats your element defaults" true by construction. These five can reach past a stylesheet of your own:

| Selector | Watch out for |
| --- | --- |
| `html` | `scroll-behavior` — the only element rule; ties with your own `html` rule, source order decides |
| `.at-row *` | `box-sizing` applies to **every** descendant — a `*` box-sizing reset is redundant inside a row |
| `.at-no-gtr > .at-col` | strips column padding — expected |
| `.at-no-gtr > [class*=at-col-]` | strips padding from any class **containing** `at-col-` |
| `.at-blk-shp > :not(.at-shp):not(.at-z-idx)` | a direct child carrying `at-z-idx` is **excluded** and paints wrong |

`check:parity` fails the build if a sixth appears.

### Seeded reads (7)

These *declare* a variable so a co-applied utility picks it up. **A seed does nothing alone.**

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

Read the `fallback` column before concluding a class does nothing — almost every utility falls back to `initial`. The exceptions that matter:

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

This table is the framework's channels only; the tokens **you** declare are yours, and `verify-usage.mjs` warns rather than fails on those.
