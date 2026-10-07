# Production notes

Everything here is a concern of the **consumer**, not the framework: the decisions you own before you ship a page. Each item names the mechanism it depends on, so you can verify it against [`CLASS-REFERENCE.json`](../generated/CLASS-REFERENCE.json) rather than trusting the prose.

**Owner:** AI reference owner · **Authority:** the consumer contract for the atomic-css 2.0 bundles.

## Contents

- [Cascade layers](#cascade-layers-the-one-that-breaks-silently)
- [Browser support](#browser-support-the-floor-is-custom-properties)
- [Content Security Policy](#content-security-policy-inline-variables-are-inline-styles)
- [Dark mode needs `color-scheme`](#dark-mode-needs-color-scheme)
- [Forms need normalizing yourself](#forms-need-normalizing-yourself)
- [Print](#print)
- [Accessibility gaps the framework leaves you](#accessibility-gaps-the-framework-leaves-you)
- [Framework selectors that are not plain classes](#framework-selectors-that-are-not-plain-classes)
- [Logical properties](#logical-properties)
- [Container queries](#container-queries)
- [Performance](#performance)
- [Testing](#testing)

## Cascade layers (the one that breaks silently)

**Do not wrap either stylesheet in `@layer`.** The bundles ship unlayered, and an unlayered normal declaration beats *every* layered one regardless of specificity — so your base and component layers are silently ignored by every utility class. It fails in the safe direction: the page renders, just wrong.

If you need layers for coexistence with another framework, put the atomic bundles in a later layer than the other framework's rules and keep your own stylesheet unlayered. Test it — do not assume the utilities still win.

## Browser support (the floor is custom properties)

Every utility is `property: var(--at-x, fallback)`. A browser without custom properties drops **all** of them, including the grid — an unstyled page, not a degraded one. The floor is roughly Chrome 49, Safari 9.1, Firefox 31; not IE11.

The trap is diagnosis: an unsupported `var()` and an unset variable show the same symptom. If a variable you definitely set shows no entry in DevTools, check `CSS.supports('color', 'var(--x)')` once and stop guessing. The autoprefixer clones in the bundles are dead weight against that floor, not an IE11 signal.

## Content Security Policy (inline variables are inline styles)

An inline variable is an inline `style` attribute: under `style-src` without `'unsafe-inline'` it does not apply — and because the class still does, the element renders with the property silently missing. In order of preference:

1. Put the value in a class — CSP does not touch it.
2. A nonce or hash. Verify it covers inline attributes in your target browsers, and prefer option 1.
3. Set it from CSS at runtime: `document.documentElement.style.setProperty('--at-p', '24px')` — still an inline style, still blocked, but the token lives in one place.

Generated markup is the case this bites hardest — see [generated markup](patterns.md#one-source-one-declaration-when-a-token-is-not-warranted).

## Dark mode needs `color-scheme`

Setting `--at-cl` and `--at-bg-cl` repaints your palette, not the browser chrome: without `color-scheme` a dark theme leaves light scrollbars, light form controls, a light `::selection` and a light UA background. Pair the variables with the property:

```css
[data-at-theme='dark'] { color-scheme: dark; --at-cl: #f2f2f2; --at-bg-cl: #161616; }
```

Set `color-scheme: light` on the light arm too. Resolve preference explicitly — system default, then system unless overridden, then an explicit choice that wins — and resolve it in the served HTML or a blocking head script: a theme resolved on `DOMContentLoaded` gives a dark-theme user a light first paint.

Element defaults are raw properties, so a default that must change per theme takes an element-scoped variable, never a shared channel:

```css
h1 { color: var(--at-h1-cl, #060606); }
@media (prefers-color-scheme: dark) { :root { --at-h1-cl: #f2f2f2; } }
```

## Forms need normalizing yourself

No `input`, `select`, `textarea`, `button` or `form` rules ship — browser defaults win until you say otherwise. The three that bite: `font` does not inherit into controls (add `at-fnt-fam` / `at-fnt-sz` per control); `appearance` is not reset (no class provides it); `line-height: normal` on `<select>` breaks box alignment. Placeholder, autofill and validation colours are UA-owned — use `::placeholder` and `:-webkit-autofill` with raw properties.

## Print

The nine `at-prt-*` classes set `display` only, and only the max bundle ships them:

```html
<nav class="at-d-non at-prt-blk at-lg-blk">Print only on lg+</nav>
```

They cannot hide a background, image or shadow — browsers do not print `--at-bg-cl` or `--at-box-sdw` by default. If the design matters on paper:

```css
@media print {
  :root { --at-bg-cl: #fff; --at-cl: #000; --at-box-sdw: initial; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

Set `@page` margins too: the default ~0.4in clips a 1140px container.

## Accessibility gaps the framework leaves you

The framework ships no focus utility, no motion gate and no contrast check — these are yours. Criteria are WCAG 2.2.

- **Focus visible (2.4.7 AA, 2.4.13 AAA).** One rule in the global layer applies everywhere: `:focus-visible { outline: 2px solid var(--at-cl); outline-offset: 2px; }`. The indicator is non-text — 3:1 against adjacent colours.
- **Focus not obscured (2.4.11 AA).** A control scrolled under `.at-stky` or `.at-vrt-hdr`, or opened beneath `.at-ovl`, is focused and invisible. Give the target room: `main :is(a, button, input, [tabindex]) { scroll-margin-block: 4rem; }`.
- **Motion (2.3.3 AAA).** `.at-trs` applies `transition` unconditionally. Gate it: `@media (prefers-reduced-motion: reduce) { * { --at-trs: none; } }` — two classes read `--at-trs` (`.at-trs` and `.at-ovl`'s layer), so gate on `*`.
- **Contrast (1.4.3, 1.4.11).** `--at-cl` and `--at-bg-cl` apply whatever they are given; nothing checks the pair — verify the foreground against the background you actually pair it with, including hover and disabled states. Text is 4.5:1 (3:1 only at 24px or 18.66px bold); borders, icons, focus rings and control edges are 3:1.
- **Screen-reader-only text.** No utility provides it, and `.at-vis` is not a substitute — `visibility: hidden` removes the element from the accessibility tree:

  ```css
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ```

  Every declaration is raw: no second writer ever supplies this box.
- **`forced-colors`.** In Windows High Contrast Mode the OS overrides your palette, so anything signalled by `background` or `box-shadow` disappears — keep meaning in text and borders too.
- **Target size (2.5.8 AA).** 24×24 px, or 24px of spacing between targets. The spacing route is a step class (`.at-spc-lg`); the size route is `at-min-h at-min-w` with seeds. `.at-btn`'s `6px 12px` padding clears 24px tall by accident — own the target size explicitly if your identity class sets its own padding.

## Framework selectors that are not plain classes

Five selectors in the bundles are not a single class; each is listed once, with what it costs you, in [classes.md](classes.md#five-selectors-that-are-not-a-plain-class).

## Logical properties

Every property the framework applies is **physical** — no `margin-inline`, no `inset-inline`, and `text-align` is never `start`/`end`. For a bidirectional site, write your own base layer with logical properties and keep direction out of values. `--at-l` and `--at-r` are *slots*, not directions: rtlcss swaps which physical side reads which token.

## Container queries

The framework is viewport-only. If a component must respond to its container, write that yourself: `.card-host { container-type: inline-size; }` plus `@container`. Related: prefer `dvh`/`svh` over `100vh` in your own rules — the framework has no viewport-unit class.

## Performance

- `.at-trs` applies the whole shorthand — `--at-trs: all 0.3s` animates every changed property, including layout-triggering ones. Name the properties, and prefer `transform` and `opacity`.
- `.at-msk` and `.at-clr` carry real compositing and repaint costs — not defaults to reach for casually.
- Reserve the box before the asset arrives: `width`/`height` attributes on `<img>`, an explicit `min-height` for a background image. `.at-w` and `.at-h` help the second paint, not the first.
- DOM depth is work. Apply a utility to an element you already have rather than wrapping; when a new element is needed, make it semantic.

## Testing

`verify-usage.mjs` checks names and channels; rendering is a separate axis, and the framework's traps are computed-value assertions:

```js
getComputedStyle(document.querySelector('.at-row')).columnGap;   // '15px' or 'normal', never both paths
const col = document.querySelector('.at-col-6');
col.scrollWidth <= col.clientWidth;
getComputedStyle(document.querySelector('.at-svg')).fill;        // no fallback: unset is invalid, not transparent
```

Worth snapshotting, because each fails silently: both theme arms and the state between them, `prefers-reduced-motion` and `prefers-color-scheme` emulated, the `-rtl` bundle against the same markup, and print preview. Wire the checker into CI, and keep your `--allow` list in version control next to the stylesheet — it is a decision record.
