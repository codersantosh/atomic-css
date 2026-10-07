# Patterns

The framework's own shapes, worked end to end; every name is verified against [`CLASS-REFERENCE.json`](../generated/CLASS-REFERENCE.json).

**Owner:** AI reference owner · **Authority:** the consumer contract for the atomic-css 2.0 bundles.

## Contents

- [Standards, and where atomic-css fits](#standards-and-where-atomic-css-fits)
- [Semantic HTML first](#semantic-html-first)
- [Mobile first](#mobile-first)
- [Element defaults are bare elements](#element-defaults-are-bare-elements-never-where-wrapped)
- [Global tokens](#global-tokens)
- [One source, one declaration](#one-source-one-declaration-when-a-token-is-not-warranted)
- [Which classes read a channel](#which-classes-read-a-channel-and-which-do-not)
- [Components: one owner per class](#components-one-owner-per-class)
- [Markup targets](#markup-targets)
- [Variables in markup and JS](#variables-in-markup-and-js)
- [One exception: host CSS](#one-exception-host-css-you-cannot-put-a-class-on)
- [Write the prefix literally](#write-the-prefix-literally)
- [Composition recipes](#composition-recipes)
- [Overriding](#overriding)

## Standards, and where atomic-css fits

Each row names the standard, what it requires, and the class or token that meets it.

**Accessibility — WCAG 2.2**

| Criterion | Requires | Where atomic-css fits |
| --- | --- | --- |
| 1.4.3 Contrast (Minimum), AA | 4.5:1 body text, 3:1 large text | `--at-cl` over `--at-bg-cl`; nothing checks the pair |
| 1.4.11 Non-text Contrast, AA | 3:1 for borders, icons, focus rings | `--at-bdr-cl`, plus the focus outline you write |
| 2.3.3 Animation from Interactions, AAA | respect `prefers-reduced-motion` | `.at-trs` is unconditional — gate `--at-trs` |
| 2.4.7 Focus Visible, AA | a visible focus indicator | ships none; one `:focus-visible` rule in your global layer |
| 2.4.11 Focus Not Obscured (Minimum), AA | sticky or overlay must not cover the focused control | give the target `scroll-margin` |
| 2.4.13 Focus Appearance, AAA | indicator ≥2px, 3:1 against adjacent colours | the same global rule, thicker |
| 2.5.8 Target Size (Minimum), AA | 24×24 px, or 24px between targets | `.at-min-h` / `.at-min-w`, or `.at-gap` for the spacing exception |

The gaps these rows leave you are the [accessibility section](production.md#accessibility-gaps-the-framework-leaves-you).

**Markup, platform and CSS**

| Standard | Requires | Where atomic-css fits |
| --- | --- | --- |
| HTML Living Standard | semantic elements bring behaviour | classes layer onto semantics, never replace them |
| ARIA Authoring Practices | a role and keyboard pattern per widget | ships no ARIA and no component CSS; `.at-btn` is yours |
| CSS Cascade L5 `@layer` | layers beat specificity | **Do not** wrap the bundle — it ships unlayered |
| CSS Cascade L4 `:where()` | a zero-specificity hook | **Never** `:where()`-wrap your base layer |
| CSS Conditional L5 `forced-colors` | the OS palette overrides yours | background and box-shadow signals do not survive |
| CSS Logical Properties | direction-aware values | rtlcss mirrors declarations, never `var()` contents |
| CSS Containment L3 | a component queries its own box | `.at-ctnr` is a fixed width, not a query container |
| CSP Level 3 `style-src` | inline `style` attributes are dropped | seed a token, let an applier class apply it |
| Design Tokens CG | one source per token | one `:root` block, no forks |
| Site builders | generated markup stays stable and serializable | the class owns the token, appliers stay in the markup |

The two **do not** rows are the load-bearing ones: `@layer` and `:where()` both invert a guarantee this framework depends on ([cascade layers](production.md#cascade-layers-the-one-that-breaks-silently)).

## Semantic HTML first

Utility classes layer onto semantics, never replace them: `<button>` over `<div role="button">`, `<h2>` over a styled `<p>`. The element brings focus behaviour, keyboard handling and an accessibility tree for free — `at-p` does not make a `<div>` keyboard-reachable.

One `<main>` per page, and the landmarks around it:

```html
<body>
  <header>…</header>
  <nav aria-label="Primary">…</nav>
  <main id="main">…</main>
  <footer>…</footer>
</body>
```

Give the keyboard a way past the header (WCAG 2.4.1, Level A). The skip link is the first focusable thing on the page and stays off-screen until focused:

```html
<a href="#main" class="skip-link">Skip to content</a>
```

```css
.skip-link {
  position: absolute;
  inset-inline-start: var(--at-skip-inset, -9999px);
  z-index: 1000;
}
.skip-link:focus { --at-skip-inset: 0; }
```

- No `.at-*` classes: `.at-w`, `.at-h`, `.at-ovf` and friends are seeded reads — with nothing seeded they compute to `initial`, so that class list is an ordinary visible link, not a skip link.
- `--at-skip-inset` is one private token because the `:focus` arm is a second writer; the resting value is the `var()` fallback.
- `inset-inline-start`, not `left`: consumer CSS is not mirrored by the `-rtl` bundle.

## Mobile first

Base rules *are* the small screen; wider viewports add an infix. `min-width` only — there is no max-width variant, and the infix set is fixed ([breakpoints](classes.md#breakpoints)).

## Element defaults are bare elements (never `:where()`-wrapped)

**Global First, Local Second.** You own the base layer; the utilities sit above it. Values live at low specificity, so any utility overrides them without `!important` — which is why no bundle ships a `:root` at all. Put element defaults on the element itself: a utility carries a class `(0,1,0)` and an element rule `(0,0,1)`, so the utility wins with no wrapper — and a `:where()` wrapper only makes the base layer weaker against a host stylesheet.

An element default is a raw property, always:

```css
/* WRONG — a seed on an element sets the app's colour channel for every h1 subtree. */
h1 { --at-cl: #060606; }

/* RIGHT — styles the h1 and leaves the channel unset. */
h1 { color: #060606; }
```

When a default must be themeable, scope the token to the element and keep the property raw: `h1 { font-size: var(--at-h1-fnt-sz, 50px); }`. Media defaults follow the same rule, because a bare `<img>` carries no class:

```css
:root { box-sizing: border-box; }
img   { max-width: 100%; height: auto; }
video { max-width: 100%; width: 100%; height: 100%; }
audio { width: 100%; min-width: 217px; }
```

A one-off design takes an identity class, which outranks the element rule: `.hero-title { font-size: 72px; color: #fff; }`.

Layer order is fixed: element resets → semantic tag defaults → identity defaults → base variant shape → colour variants → state variants, active last.

## Global tokens

**Every global token is yours. No bundle ships a `:root` block.** Only three values carry direct fallbacks — `--at-ctnr` 1140px, `--at-ctnr-min` 1100px, `--at-gtr` 15px — and everything else falls back to `initial` (inert) or a keyword. Your own CSS reading `var(--at-ctnr)` bare will not resolve: write `var(--at-ctnr, 1140px)` or declare the token.

### The block

```css
:root {
  /* Grid — direct fallbacks in the bundle. */
  --at-ctnr: 1140px;
  --at-ctnr-min: 1100px;
  --at-gtr: 15px;

  /* Scale — named steps, never measurements. */
  --at-spc-sm: 5px;
  --at-spc-md: 10px;

  /* Palette and state — state uses a double dash. */
  --at-primary: #48b44f;
  --at-primary--hover: #3ea245;
}
```

### Naming

- Name the token after the element, not the property — `--at-h1-fnt-sz`, never the shared `--at-fnt-sz` — so a theme change cannot reach anything it was not aimed at.
- The class and its variable share the joined string: `bg`+`cl` → `.at-bg-cl` / `--at-bg-cl`.
- Every segment in the framework's namespace must exist in the legend; tokens in your own namespace need no entry at all.
- A relative `url()` in a seeded image token resolves against the bundle that reads it — use root-relative paths.
- Keep z-index on a named scale, and give a repeated value a step on a named scale — the step in the class, the value in a digit-free variable; a number in a class name is a step, never a measurement:

```css
:root { --at-spc-lg: 20px; }
.at-spc-lg { --at-gap: var(--at-spc-lg); }
```

```html
<div class="at-flx at-gap at-spc-lg">…</div>
```

### Element-scoped tokens

Declare them on the element that uses them — a token on an element is inherited by its whole subtree:

```css
/* WRONG — every descendant inherits it. */
body { --at-fnt-sz: 16px; }

/* RIGHT — scoped to the elements that read it. */
main, h1 { font-size: var(--at-fnt-sz, 16px); }
```

### Arms and resting values

**A property that can change is reached through a variable. The arm re-points the variable; it never restates the property.** A property changes for a colour mode, a media query or a state — all three, one shape:

```css
.at-card { color: var(--at-card-cl, var(--at-primary)); }
.at-card:hover { --at-card-cl: var(--at-white); }
@media (prefers-color-scheme: dark) {
  .app-shell:not([data-app-theme='light']) .at-card { --at-card-cl: var(--at-black); }
}
```

Theming is this rule — a theme block re-points tokens and nothing else:

```css
:root                  { --at-cl: #1c1c1c; --at-bg-cl: #fff; }
[data-at-theme='dark'] { --at-cl: #f2f2f2; --at-bg-cl: #161616; }
```

Setting a property inside an arm is the defect:

```css
/* WRONG — padding is already written by .at-p. */
@media (min-width: 768px) { .at-p { padding: 32px; } }

/* RIGHT */
@media (min-width: 768px) { .at-p { --at-p: 32px; } }
```

#### A state arm must declare the base it overrides

Custom properties inherit, so a token seeded only inside an arm has no resting value and silently picks up whatever an ancestor set:

```css
/* WRONG — .card inherits the shell's value until hover. */
.card:hover { --at-h: 50px; }

/* RIGHT — the resting value is declared. */
.card { --at-h: 200px; }
.card:hover { --at-h: 50px; }
```

A token written only inside `@media` has no value outside it — every arm re-declares what it needs.

#### `unset` does not reset a custom property

`--at-x: unset` computes to **`inherit`**, restoring the leaked value. Use `initial` to mean "this component opts out of its ancestors"; the reset propagates to the subtree below it.

#### Two shapes that are not violations

- **A reader ladder.** When the token belongs to the class that reads it, a `min-width` sequence is the value being stepped: `.at-ctnr` moves 540 → 720 → 960 → 1140 → 1320px.
- **A private-namespace hover-only arm.** A component whose tokens live in its own namespace may ship a hover arm with no base when the resting value legitimately comes from the shell, a same-element variant, or the read's fallback. The same shape on a **shared** channel is the leak above.

### Responsive

`:root` is one value, not a ladder — re-declare per breakpoint; an element-scoped declaration beats `:root`:

```css
@media (min-width: 576px) { .at-ctnr { --at-ctnr: 540px; } }
```

### Component values stay private

A component's own measurement is not a shared token: a button's internal 6px is not the app's `--at-gap`, and 15px inside a 14px button reads as two separate controls. Use a private `--<prefix>-*` value.

## One source, one declaration (when a token is not warranted)

**Does this value have a second writer?** A second writer is anything that supplies a value other than the rule that styles the element — a theme or media arm, a state, a second variant, a per-instance value, or a generator. If nothing else can supply it, a token is a wrapper around a constant.

| Second writer? | Encoding |
| --- | --- |
| An arm re-points it | seed + utility |
| A control or per-instance value writes it | seed + utility |
| It repeats — a named scale step | step class + digit-free token |
| A breakpoint ladder on the reading class | reader ladder |
| **No — one source, written once** | **raw property in the rule** |

```css
/* WRONG — --at-p seeds nothing, and padding is written twice. */
.at-btn { --at-p: 6px 12px; padding: 6px 12px; }

/* RIGHT — one source; the class still outranks an element rule. */
.hero-title { font-size: 72px; color: #fff; }
```

**Generated markup is the mandatory case.** A generator needs one seam to write a per-instance value through; a generated `style` attribute is an inline style, so it needs `unsafe-inline` and repeats the property on every instance.

## Which classes read a channel, and which do not

Across the full 616-class inventory, 451 classes read **no** variable — every flex, align and display utility. 165 read at least one, and those are inert until you seed them. (The minimal bundle is 440 of those classes: 275 with no channel, the same 165 readers.) Check `reads[]` in the generated reference before assuming.

```css
/* WRONG — three properties the framework already ships behind classes. */
.shell { display: flex; flex-direction: row; height: 100vh; overflow: hidden; }

/* RIGHT — values only. */
.shell { --at-h: 100vh; --at-ovf: hidden; }
```

```html
<div class="shell at-flx at-h at-ovf"></div>
```

- `at-flx` reads nothing; `at-h` and `at-ovf` each need their own seed — miss one and that property silently does nothing.
- `at-flx-row` is deliberately absent: `flex-direction`'s initial value is `row`.
- A class may read more than one channel: `at-bdr` is **three** (`--at-bdr-cl`, `--at-bdr-w`, `--at-bdr-sty`); the heaviest readers are `at-bg-img` (7) and `at-msk` (6).
- Do not add a class for zero: bare `.at-p` already computes to `padding: 0`.

## Components: one owner per class

No component CSS ships. A class is either a framework utility or an identity class you own — never both. The encoding follows the shape of the design.

### Repeating with variants (the identity class owns the box)

The identity class is self-sufficient, reading its **own** private namespace; variants set only those private variables:

```css
.at-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;                            /* deliberately not var(--at-gap) */
  cursor: var(--at-btn-cur, pointer);
  color: var(--at-btn-cl, inherit);
  background-color: var(--at-btn-bg-cl, transparent);
  border-radius: var(--at-btn-bdr-rad, 3px);
  padding: var(--at-btn-p, 6px 12px);
}

.at-btn-primary {
  --at-btn-cl: var(--at-white);
  --at-btn-bg-cl: var(--at-primary);
}
.at-btn-primary:hover { --at-btn-bg-cl: var(--at-primary--hover); }
```

```html
<button class="at-btn at-btn-primary">Primary</button>
<button class="at-btn at-btn-outln-primary">Outline</button>
```

Two classes per button, whatever the variant — a shell every instance wants is the class's job.

### Why the namespace is private

A private token is an isolation boundary, and one fact does the work: **a private namespace has exactly one possible supplier, a shared channel has every ancestor as one.** That decides where a resting value comes from, and what a component may read. A section seed leaks into anything below it — `.at-svg` applies `fill: var(--at-cl)` with no fallback, so a `--at-cl` seed for a section repaints an icon inside a button that never mentioned the section:

```css
/* RIGHT — the button reads only its own tokens; the icon is styled on its own class. */
.at-btn-primary { --at-btn-cl: var(--at-white); }
.at-btn .at-svg  { fill: var(--at-btn-cl, currentColor); }
```

**Generated markup is the one case where the parent publishes** — you cannot class the child, so the value travels through the channel it already reads.

### Unique, no variants (the class writes the properties)

One instance, no registry, nothing that will ever re-point a value: the class writes the properties and the markup names nothing else.

```css
.brand-name { font-size: 16px; font-weight: 700; color: var(--text); white-space: nowrap; }
```

```html
<span class="brand-name">Acme</span>
```

In generated markup the seed shape is mandatory instead: the class owns the channel and an applier class applies it — worked in [site builders](#site-builders).

### Naming the private namespace

Mirror the channel each value serves: `--at-btn-bdr-cl` for border colour, `--at-btn-bdr-rad` for radius. Mind the legend — `r` is **right**, not radius, so write `rad`. None of these names ship: `verify-usage.mjs` needs `--allow at-btn,at-btn-primary,…`, and the private variables allowlisting too. `.at-txt` is the same kind of consumer hook — removed in 2.0, usable as a styling hook, never in a bundle or the reference.

## Markup targets

### React

A value that is the same on every render belongs in the component's own stylesheet; only a genuinely per-instance value earns the pair:

```jsx
function Card({ tone, pad }) {
  return <div className="card at-cl at-p" style={{ "--at-cl": tone, "--at-p": pad }} />;
}
```

- `CSSProperties` has no custom properties — `style` needs `as React.CSSProperties`.
- Conditional class names must not fork the stylesheet: one identity class per variant, changing a private token.

### Site builders

- **No inline `style`** — a generated `style` attribute is an inline style: dropped by any `style-src` without `unsafe-inline`, after which the class still applies and the property goes silently missing.
- **The class owns the token, the applier is a fixed class** — every instance carries the same classes, so the generated markup stays stable; values arrive through the cascade, never through the markup.
- **Global CSS** — the values are taken from the global settings / global CSS: declare the tokens once, and every instance follows:

```css
.unique-class { --at-cl: var(--at-card-cl, inherit); }
```

```html
<figure class="unique-class at-cl at-p">…</figure>
```

## Variables in markup and JS

The variable may sit inline, on your class, or on any ancestor — the class only has to be on the element that uses the property:

```html
<div class="at-p at-cl" style="--at-p: 24px; --at-cl: #c00">inline</div>
<div class="at-p card">value comes from .card or an ancestor</div>
```

Keep direction out of the values, so the same token works in both builds.

## One exception: host CSS you cannot put a class on

When a host stylesheet (a CMS admin theme, a UI kit) sets a property on the same elements and a restatement is the only way to out-specify it, a raw property is acceptable — the palette still lives in your tokens. There is no such exception for a colour-mode, media or state arm: re-point the token. `@supports` and `:has()` are raw CSS too — neither has a utility form.

## Write the prefix literally

`at-` and `--at-` are constants fixed by the bundles you linked. Write them literally — never via a variable, map or alias:

```scss
/* WRONG — compiles clean, matches nothing. */
$vp: '--at';
.card { #{$vp}-cl: #000; }

/* RIGHT */
.card { --at-cl: #000; }
```

A custom prefix produces rules that match no shipped CSS — no error, no warning. The prefix is part of the shipped public surface; changing it is a fork, not a setting.

## Composition recipes

```html
<!-- flex with alignment and gap -->
<div class="at-flx-col at-flx-md-row at-jfy-cont-btw at-al-itm-ctr at-gap">
  <div class="at-col-12 at-col-md-4">…</div>
</div>

<!-- overlay — --at-ovl holds the paint -->
<div class="at-ovl at-ovl-cl" style="--at-ovl: linear-gradient(#0000, #000)">…</div>

<!-- vertical layout: .at-vrt sets only gap, so it needs at-flx -->
<div class="at-vrt at-flx">
  <aside class="at-vrt-hdr">rail</aside>
  <main class="at-vrt-conts">content</main>
</div>
```

### Flex is fully expressible as classes

`at-flx-col` is `flex-direction: column`, and `at-flx-fil` / `at-flx-grw-0` / `at-flx-grw-1` / `at-flx-srnk-0` / `at-flx-srnk-1` compose a `flex: 0 0 auto` — there is no reason to hand-write flex. `at-fl` is `filter`, not `flex`.

## Overriding

Bundles carry **zero** `!important`; every utility is an ordinary `(0,1,0)` declaration your CSS beats by specificity or order. Preference order:

1. Redefine the variable.
2. Add a class.
3. Load your sheet after the bundle.
4. `!important` only at an external boundary you do not control.

The grid maths stay in [classes.md](classes.md#grid-104-classes).
