# Production notes

Everything here is a concern of the **consumer**, not the framework. The bundles
are built and shipped; these are the decisions you own before you ship a page
that uses them. Each item names the mechanism it depends on, so you can verify it
against `../generated/CLASS-REFERENCE.json` rather than trusting the prose.

## Cascade layers — the one that breaks silently

**Do not wrap either stylesheet in `@layer`.** The bundles ship unlayered, and an
unlayered normal declaration beats *every* layered declaration regardless of
specificity. That inverts the guarantee the whole framework rests on:

```
layered consumer rule  loses to  unlayered .at-p   (not because of specificity)
```

So a consumer who adopts `@layer framework, base, components` gets their base
layer and their components silently ignored by every utility class. Worse, it
fails in the *safe* direction: the page still renders, it just looks wrong.

The framework's "layers" — Grid → Utilities → Properties — are a **source order**
inside one stylesheet, not cascade layers. They cannot be `@layer`-ed and mean the
same thing.

If you need layers for coexistence with another framework, you own the
translation: put the atomic bundles in a later layer than the other framework's
rules and keep your own stylesheet unlayered, or scope the other framework
instead. Test the result — do not assume the utilities still win.

## Browser support — the floor is custom properties

Every utility is `property: var(--at-x, fallback)`. A browser without custom
property support does not degrade the utilities one at a time; it drops **all**
of them, including the grid. `.at-col-6` is `flex: 0 0 calc(50% - …)` and there is
no non-`var()` fallback, so the result is an unstyled page rather than a slightly
worse one.

The floor is roughly Chrome 49, Safari 9.1, Firefox 31 — and **not** IE11, whose
lack of custom properties is the binding constraint.

The trap is diagnosis. An unsupported `var()` and an unset variable produce the
*same* symptom — the property simply does not apply — and DevTools shows the same
thing for both:

| Symptom in DevTools | Meaning |
| --- | --- |
| Custom property shows a value | Supported; the property is overridden or wrong elsewhere |
| Custom property shows *no* entry | **Either** the variable is unset **or** the browser lacks `var()` |

If a variable you definitely set shows no entry, suspect the browser, not the
markup. Check `CSS.supports('color', 'var(--x)')` once and stop guessing.

The bundles also carry autoprefixer clones (`-ms-flex-direction`,
`-webkit-box-orient`), which are dead weight against that floor. They are not a
signal that IE11 is supported.

## Content Security Policy — inline variables are inline styles

The framework's most natural idiom is an inline variable:

```html
<div class="at-p at-cl" style="--at-p: 24px">
```

That is an inline `style` attribute. Under `style-src` without `'unsafe-inline'`
it does not apply — and because the class still does, **the element renders with
the property missing rather than failing visibly**. A spacing token silently
disappears.

Three ways out, in order of preference:

1. **Put the value in a class**, which CSP does not touch. This is the same
   argument as writing a spacing scale instead of repeating an inline value.
2. **Use a nonce or a hash.** `style-src 'nonce-…'` covers inline *attributes*
   only in some engines; verify against your target browsers, and prefer option 1.
3. **Set it from CSS at runtime** via
   `document.documentElement.style.setProperty('--at-p', '24px')`. Also an inline
   style, and also blocked — but the token then lives in one place instead of
   being repeated per element.

The WordPress/template path has the same exposure: your built stylesheet is a
separate file and needs no nonce, but any inline variable in the markup does.

## Dark mode needs `color-scheme`

Setting `--at-cl` and `--at-bg-cl` repaints *your* palette. It does not change
what the browser paints around it. Without `color-scheme`, a dark theme leaves:

- light scrollbars and light form-control chrome
- a light `::selection`
- the UA's default `background: white` behind any surface you did not set

So pair the variables with the property:

```css
[data-at-theme='dark'] {
  color-scheme: dark;
  --at-cl: #f2f2f2;
  --at-bg-cl: #161616;
}
```

Set `color-scheme: light` on the light arm too, so the browser switches back.

**Preference order** — resolve these explicitly, because all three can be true at
once:

```css
:root { color-scheme: light dark; }              /* 1. follow the system */

@media (prefers-color-scheme: dark) {
  :root:not([data-at-theme]) { /* 2. system, unless overridden */ }
}

[data-at-theme='dark'] { /* 3. explicit choice wins */ }
```

**Theme flash is a real failure.** A theme resolved in JavaScript on
`DOMContentLoaded` gives a dark-theme user a light first paint. Either resolve it
in a blocking `<head>` script, or declare `[data-at-theme='dark']` in the served
HTML and let CSS do the work. The framework needs no JavaScript for this — the
theme is an attribute and a variable block.

Also note what the dark arm costs: element defaults are **raw properties**
(see [patterns.md](patterns.md#element-defaults-are-bare-elements-never-where-wrapped)), and no
token reaches a raw property. A dark arm therefore has to restate those
properties per element type. Budget for that, or move the affected defaults onto
classes.

## Forms need normalizing yourself

The bundles ship **no** `input`, `select`, `textarea`, `button` or `form` element
rules. That is a deliberate scope boundary, and it means browser defaults win
until you say otherwise. Three that bite:

- **`font` does not inherit into form controls.** `body { font-family: … }` never
  reaches an `<input>`. Add `at-fnt-fam` / `at-fnt-sz` per control.
- **`appearance` is not reset.** To style a control you need
  `appearance: none`, which no class provides.
- **`line-height: normal` on `<select>`** breaks box alignment — set it
  explicitly.

Placeholder, autofill and validation-message colours are UA-owned and are not
reachable with `--at-*` tokens; use `::placeholder` and
`:-webkit-autofill` with raw properties.

## Print

Nine classes ship, all in the max bundle, and **all of them set `display` only**:

```html
<button class="at-prt-non at-btn">Never print</button>
<nav class="at-d-non at-prt-blk at-lg-blk">Print only on lg+</nav>
```

What they cannot do is hide a background, an image or a shadow. The framework's
visual identity is `--at-bg-cl` plus `--at-box-sdw`, and **browsers do not print
either by default**. If the design matters on paper:

```css
@media print {
  :root { --at-bg-cl: #fff; --at-cl: #000; --at-box-sdw: initial; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

Also set `@page` margins. The default ~0.4in will clip a `1140px` container and
its gutters, and the print classes cannot express that.

## Accessibility gaps the framework leaves you

The design section of [patterns.md](patterns.md#how-to-design-with-this-framework)
covers focus, motion and contrast. Three more:

**Screen-reader-only text.** No utility provides it, and `.at-vis` is not a
substitute — `visibility: hidden` takes the element out of the accessibility
tree, which is the opposite of what you want. Build it from classes:

```html
<span class="at-pos at-w at-h at-ovf at-clp-pth at-white-sp">label text</span>
```

**`forced-colors`.** In Windows High Contrast Mode the OS overrides your palette,
so anything you signalled with `background` or `box-shadow` disappears. Test it,
and keep meaning in text and borders as well as colour.

**Reduced motion.** `The design section documents the `*` gate. Remember it reaches **two** classes, not one: `.at-trs`
and `.at-ovl`'s `:after` layer both read `--at-trs`.

## Framework selectors that are not plain classes

Five selectors in the bundles are not a single class, and each one can reach past
a base layer you wrote. There are no more.

| Selector | What it does | Consequence for you |
| --- | --- | --- |
| `html` | `scroll-behavior` | The only element rule. Tie with your own `html` rule; source order decides. |
| `.at-row *` | `box-sizing` on **every** descendant, not just columns | A `*` box-sizing reset of your own is redundant inside a row. |
| `.at-no-gtr > .at-col` | strips column padding | Expected. |
| `.at-no-gtr > [class*=at-col-]` | strips padding from **any** class containing the substring `at-col-` | So a consumer class whose name merely *contains* `at-col-` silently loses its padding inside a `.at-no-gtr` row. Avoid that substring in your own names. |
| `.at-blk-shp > :not(.at-shp):not(.at-z-idx)` | `position: relative; z-index: 2` | A direct child carrying `at-z-idx` is **excluded** and paints wrong. Do not put `at-z-idx` on a block-shape child. |

## Logical properties

Every one of the 102 properties the framework applies is **physical**. There is
no `margin-inline`, `padding-block` or `inset-inline` anywhere, and `text-align`
is never `start`/`end`.

For a bidirectional site, write your own base layer with logical properties and
keep direction out of the values:

```css
h1 { margin-block: 0 2rem; padding-inline: 0; }   /* not margin: 0 0 30px 0 */
```

`rtlcss` mirrors *declarations*, never the contents of a `var()` — so
`--at-m: 0 auto 0 0` is not flipped in the RTL build. A single asymmetric
shorthand is the commonest mistake here; see
[the RTL section](setup.md#rtl).

One asymmetry worth knowing: `--at-l` and `--at-r` are *slots*, not directions. In
the RTL build rtlcss swaps which physical side reads which token, so seeding
`--at-l: 16px` puts 16px on the right in RTL. That is the mechanism working, and
it is why the token names stay neutral.

## Container queries

The framework is viewport-only: five `min-width` breakpoints and no `max-width`
variant. If a component must respond to **its container** rather than the window,
write that in your own sheet — the framework ships no `container-type`.

```css
.card-host { container-type: inline-size; }
@container (min-width: 30rem) {
  .card-host { grid-template-columns: 8rem 1fr; }
}
```

Related: `100vh` is wrong on mobile, where browser chrome changes the viewport
height. Prefer `dvh`/`svh` in your own rules — the framework has no viewport-unit
class.

## Performance

`.at-trs` applies the whole `transition` **shorthand**, so
`--at-trs: all 0.3s` means `transition: all` — animating *every* property that
changes, including layout-triggering ones. Name the properties:

```css
.hero { --at-trs: opacity 0.3s ease, transform 0.3s ease; }
```

Prefer `transform` and `opacity`: they are the two that can be composited. The
framework's own `--at-tf` exists for exactly this.

Two shipped classes have a real compositing cost and are worth knowing about:
`.at-msk` (`mask`, six channels) and `.at-clr` (`caret-color`, which runs a
repaint on every caret blink). Neither is a default to reach for casually.

There is no `will-change` class — an empty lookup there means raw CSS is the
correct answer.

### DOM depth

Every element in the tree is work: style resolution, layout, then paint. Depth
multiplies that, and a wrapper that exists only to carry a class costs exactly
as much as any other node. The framework cannot help here — it styles what you
ship and never sees the markup around it.

Before adding an element to hang a utility on, check whether an element you
already have can take it:

```html
<!-- one node deeper, no visual difference -->
<div class="at-p">Save</div>
<button class="at-p">Save</button>
```

When a new element is genuinely needed, make it **semantic** — `<header>`,
`<main>`, `<aside>`, `<nav>`, `<section>`. Those earn their depth: they carry
meaning a stylesheet cannot, and a screen reader uses them. A `div` with a class
is a layout decision written as markup, and it is the one a reviewer has no way
to check.

Depth also compounds. `AtrcWrap` and friends are single nodes, so a utility
applied to an existing parent is almost always cheaper than wrapping.

*Two shapes that are not violations* in the **patterns** reference lists the
wrappers that are deliberate. Those are the exceptions; anything else is a
candidate for removal, not a starting point.

## Testing

`verify-usage.mjs` checks names and channels. Rendering is a separate axis, and
the framework's own traps are all computed-value assertions:

```js
// the gutter must be spent exactly once
getComputedStyle(document.querySelector('.at-row')).columnGap;   // '15px' or 'normal', not both paths

// a long value must not overflow its column
const col = document.querySelector('.at-col-6');
col.scrollWidth <= col.clientWidth;

// --at-svg has no fallback: unset makes the declaration invalid, not transparent
getComputedStyle(document.querySelector('.at-svg')).fill;
```

One trap belongs here rather than only in the class reference, because it
overflows a container instead of one column: **inside an `at-row`, the gutter has
to be a variable.** Column widths are `calc()`s that read `--at-col-gap`, so a raw
`gap` in your own CSS adds space no column subtracts and the row overflows by the
total gap. A raw `gap` on an ordinary `at-flx` container is fine. See
[classes.md](classes.md#the-gutter-is-counted-once-two-coherent-arrangements).

Worth snapshotting, because each fails silently in CSS:

- both theme arms, and the state between them (that is how a theme flash shows up)
- `prefers-reduced-motion` and `prefers-color-scheme` emulated
- the `-rtl` bundle, against the same markup — the parity between the two is a
  build-time invariant, so a drift is yours
- print preview

Wire `verify-usage.mjs` into CI. It is a normal script with no dependencies, and
it catches the class of mistake — a plausible name that silently does nothing —
that no amount of visual review will find.

Keep your `--allow` list in version control next to the stylesheet it belongs to.
It is a decision record: every name in it is a class you own, and a name that
leaves the list should be one you removed on purpose.