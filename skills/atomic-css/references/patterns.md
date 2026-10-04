# Patterns

These are the framework's own shapes, worked end to end. Every name is verified
against [generated/CLASS-REFERENCE.json](../generated/CLASS-REFERENCE.json).

## Element defaults are bare elements — never `:where()`-wrapped

Put global element defaults on the element itself. Every utility in this
framework carries a class, so a utility scores `(0,1,0)` and an element rule
`(0,0,1)` — any utility wins without `!important`, and no `:where()` wrapper is
needed. The framework ships no element defaults of its own — the single exception
is `html`'s `scroll-behavior`, see [setup.md](setup.md#confirming-it-is-wired-up) —
so these are yours. A
wrapper would only make the base layer *weaker* against a host stylesheet: a
WordPress theme's `h1` beats `:where(h1)` outright, while it merely ties with
`h1` and loses on source order.

**An element default is a raw property. Always.** The tempting alternative —
seeding a channel on the element and letting a utility apply it — is wrong, and
wrong in a way no utility can undo:

```css
/* WRONG — not a default for the h1: it sets the app's colour channel for every
   h1 subtree, so a nested .at-cl inherits #060606 instead of its own value. */
h1 { --at-cl: #060606; }

/* RIGHT — styles the h1 and leaves --at-cl unset. */
h1 { color: #060606; }
```

Custom properties inherit, so a seed on an element is not a default for that
element — it is a token value for everything beneath it. A raw property sets the
element's computed value and leaves the channel alone. A utility class on the
element outranks either form — a class beats an element selector whatever
specificity the wrapper gives it — so seeding buys no overridability that raw
does not already have.

Two forms exist in this codebase, and they are not alternatives for the same job:

- **Raw property** — for element defaults, and for a bare `<img>` that carries no
  class, so nothing can apply `max-width` for it.
- **Seed on an identity class** — when the value must be themeable per subtree,
  and the reading class is genuinely present. Never seed on the bare element.

Declaring a variable *and* writing its property in the same rule is rule 4's
violation: the property is stated twice and the raw declaration wins on source
order, so a later change to the class appears to do nothing.

```css
/* Box model: the root only, because box-sizing inherits — one declaration
   reaches every element. A `*` reset is a second opinion on every element the
   framework ships, and the library's own metrics are not yours to re-box. */
:root { box-sizing: border-box; }

/* Media defaults: raw properties, because a bare <img> carries no class to
   apply one. No `:root` prefix — `:root` matches <html> and every element is its
   descendant, so `:root img` matches exactly what `img` matches. */
img   { max-width: 100%; height: auto; }
video { max-width: 100%; width: 100%; height: 100%; }
audio { width: 100%; min-width: 217px; }
/* map / iframe sizing is consumer-owned too, e.g. width/height 100% */

/* Element defaults: raw properties. */
body { font-family: 'Open Sans', sans-serif; }
h1     { font-size: 50px; font-weight: bold; color: #060606; }

/* One design in the system wants to be different. It gets an identity class —
   and the class, not a utility, is what outranks the global element rule above.
   Nothing about 72px ever varies, so there is no second writer and no token. */
.hero-title { font-size: 72px; color: #fff; }
```

```html
<h1 class="hero-title">Leader</h1>
```

A global can stay themeable without leaking, by reading **its own** channel and
naming a fallback. The property still applies at the element, so nothing
inherits a seeded value:

```css
h1 { font-size: var(--at-h1-fnt-sz, 50px); }   /* seed at :root to theme it */
```

Two details make this correct. The property is raw, so it styles the `h1` and
nothing else. And the token is **element-scoped** — `--at-h1-fnt-sz`, not the
shared `--at-fnt-sz`. Seeding the shared channel at `:root` to resize one heading
would resize every element that reads that channel too, which is the leak this
whole section exists to avoid. A themed value belongs to the thing being themed.

If you want image width themeable from an ancestor, seed the channel **on the
ancestor** and put the reading class on the image — do not seed and apply it in
one rule:

```css
.article { --at-w: 60%; }                          /* seeds */
<img class="at-w" src="…">                         /* the class applies it */
```

That is a different pattern from the framework's seeded structural classes.
`.at-shp` seeds `--at-w` and `.at-w` — a class the framework ships — reads it.
The difference is the same one above: `.article` is a class, so the seed is
scoped to whatever carries it, while a seed on a bare element escapes to its
whole subtree.

Use a variable only when the value must change per subtree; otherwise write the
value. And write only the CSS you use: a seed nobody reads is dead code, not a
default.

Layer order matters and is fixed: element resets → semantic tag defaults →
identity defaults → base variant shape → colour variants → state variants, with
active/pressed last so it wins ties.

## Global tokens

**Every global token is yours. No bundle ships a `:root` block.** Three values
carry direct fallbacks at their use sites — `--at-ctnr 1140px`, `--at-ctnr-min
1100px`, `--at-gtr 15px` — so the grid works before you theme anything. Everything
else falls back to `initial` or a keyword. Your own CSS reading `var(--at-ctnr)`
bare will not resolve: write `var(--at-ctnr, 1140px)` or declare the token.

### The block

```css
:root {
  /* Grid — these three have direct fallbacks in the bundle. */
  --at-ctnr: 1140px;
  --at-ctnr-min: 1100px;
  --at-gtr: 15px;

  /* Scale — named steps, never measurements. */
  --at-spc-sm: 5px;
  --at-spc-md: 10px;

  /* Palette — a surface role and a text role are separate tokens. */
  --at-white: #fff;
  --at-black: #000;
  --at-base-color: #2e312f;
  --at-body-color: #9da29f;
  --at-primary: #48b44f;
  --at-primary-tint: #1f6f26;

  /* State — double dash, the only form that uses one. */
  --at-primary--hover: #3ea245;
}
```

The block sits in the base layer at low specificity, so any utility overrides it
without `!important` — that is why no bundle ships a `:root` at all. Fixed layer
order is the six steps at the top of this file; breaking it is covered in
[production.md](production.md#cascade-layers-the-one-that-breaks-silently).

### Naming

- **Name the token after the element, not the property** — `--at-h1-fnt-sz`, not
  `--at-fnt-sz` — so a theme change cannot reach anything it was not aimed at.
  `--at-body-fnt-sz` is the same idea for the document root.
- **The class and its variable share the joined string**: `bg` + `cl` →
  `.at-bg-cl` / `--at-bg-cl`.
- **State variants use a double dash** and nothing else does:
  `--at-primary--hover`, `--at-danger--active`.
- **Every segment must exist in the legend.** Look it up before using it; extend
  the legend in the same change if it is genuinely new.
- **Private tokens are yours to invent.** `--at-btn-*`, `--at-card-*` need no
  legend entry and ship in no bundle.
- **A relative `url()` in a seeded image token resolves against the bundle that
  reads it**, not the document: `--at-bg-img` and `--at-msk-img` are read by
  `.at-bg-img` / `.at-msk` in the bundle. Use root-relative paths. The token applies and the image is simply missing when you
  do not — unless the same rule also declares the consuming property, which makes
  the path document-relative again.

### Element-scoped tokens

Declare them on the element that uses them, never on a bare element or `:root`.
A token on an element is inherited by its whole subtree, so a seed on a bare
element is a token block in disguise, at the wrong scope. Element defaults
themselves are raw properties — see
[Element defaults are bare elements](#element-defaults-are-bare-elements-never-where-wrapped).

```css
/* WRONG — every descendant inherits it. */
body { --at-fnt-sz: 16px; }

/* RIGHT — scoped to the elements that read it. */
main, h1 { font-size: var(--at-fnt-sz, 16px); }
```

### Properties change rule

**A property that can change is reached through a variable. The arm that changes
it re-points the variable; it never restates the property.**

A property changes for exactly three reasons — a **colour mode**, a **media
query**, a **state** (`:hover`, `:focus`, `:active`, `[aria-current]`). All three
are handled the same way, and none of them is a reason to write the property
twice.

```css
/* The component reads its own private tokens. The fallback IS the resting
   value, so there is nothing to redeclare. */
.at-card {
  margin: var(--at-card-m, var(--at-spc-sm));
  color: var(--at-card-cl, var(--at-primary));
}

/* A state arm re-points the token. It never writes `color` or `margin`. */
.at-card:hover {
  --at-card-cl: var(--at-white);
  --at-card-m: 10px;
}

/* A colour-mode arm re-points the same token, so the hover value still wins
   where the two overlap. The guard means an explicit light choice on the shell
   beats the OS preference. */
@media (prefers-color-scheme: dark) {
  .app-shell:not([data-app-theme='light']) .at-card {
    --at-card-cl: var(--at-black);
  }
}
```

Each arm is one declaration on one token. The property is written once, so the
arms cannot drift and a fourth needs no new rule.

**Theming is this rule.** A theme block re-points tokens and nothing else, so
every utility on the page follows with no class changes and no extra stylesheet:

```css
:root                { --at-cl: #1c1c1c; --at-bg-cl: #fff; }
[data-at-theme='dark'] { --at-cl: #f2f2f2; --at-bg-cl: #161616; }
```

```html
<html data-at-theme="dark">
```

Setting a property inside a theme block is the defect. Never write `color:` or
`background-color:` there.

**Never set a property in an arm, at any scope** — a `@media`, `[data-at-theme]`
or `:hover` block re-points a token or it does nothing:

```css
/* WRONG — `padding` is already written by .at-p. */
@media (min-width: 768px) { .at-p { padding: 32px; } }

/* RIGHT */
@media (min-width: 768px) { .at-p { --at-p: 32px; } }
```

**What never changes stays a raw property** — an element default, a reset, a media
default, a component shell's own geometry. `.at-btn`'s `display` and `gap` are
written once and no arm moves them. A value written once and never varied has
nothing to re-point; converting it into a token is rule 5 of
[the consumer contract](#the-consumer-contract).

### Resting values

**Private token or shared channel decides where the resting value lives.**

- **A private token** — `--at-card-cl`, in a namespace no ancestor seeds — takes
  its resting value from the read's fallback. One possible supplier, so nothing
  to inherit and nothing to redeclare.
- **A shared channel** — `--at-cl`, `--at-bg-cl`, `--at-p`, anything a bundle
  class reads — **must** be declared on the resting selector. Custom properties
  inherit, so an arm-only seed leaves the resting state on whatever an ancestor
  set.

#### A state arm must declare the base it overrides

Custom properties inherit, so **a token seeded only inside a state arm has no
value on the element at all in the resting state** — it silently picks up
whatever an ancestor set.

```css
/* The page shell owns the height. */
main.at-h { --at-h: 100vh; }

/* WRONG — `.card` inherits 100vh. Only `:hover` has a value. */
.card:hover { --at-h: 50px; }

/* RIGHT — the resting state is declared, so it is 100vh→own value, then 50px. */
.card { --at-h: 200px; }
.card:hover { --at-h: 50px; }

/* Also RIGHT — `initial` is the same fix meaning "opt out of the ancestor".
   Resting is `height: auto`, not the inherited 100vh. */
.card { --at-h: initial; }
.card:hover { --at-h: 50px; }
```

Measured for `<main class="at-h" style="--at-h:100vh">` wrapping
`<div class="at-h card">` where only `:hover` seeds the token:

| the card's own declaration | resting | `:hover` |
|---|---|---|
| *(none)* | **720px** — inherited `100vh` | 50px |
| `--at-h: initial` | 18px (`height: auto`) | 50px |
| `--at-h: 200px` | 200px | 50px |

A token written only inside `@media` has no value outside it. **Every state or
device block that uses a variable re-declares it in that block** — never carry a
value forward.

**Declare the resting value explicitly.** `initial` is correct only when *unset*
is what you want, because `height: var(--at-h, initial)` resolves to `auto`. If
you mean 200px, write 200px.

#### `unset` does not reset a custom property

`--at-h: unset` computes to **`inherit`** — it restores the leaked value:

| the card's own declaration | resting |
|---|---|
| `--at-h: initial` | 18px — reset |
| `--at-h: unset` | **720px — still leaking** |

`initial` works because it yields the guaranteed-invalid value, and a declaration
beats an inherited value at any specificity. Use `initial`, never `unset`, to mean
"this component opts out of its ancestors".

- The reset propagates: a reset on a container unsets the whole subtree below it.
  Reset the element you mean, not a wrapper.
- A same-element variant still wins: `.btn { --at-btn-cl: initial }` does not
  defeat `.btn-primary { --at-btn-cl: #006600 }`.

#### Two shapes that are not violations

Both are deliberate, and both are fenced so they cannot become a loophole:

- **A reader ladder.** When the token belongs to the class that *reads* it, a
  `min-width` sequence is the value being stepped, not a missing base. The
  framework does this itself: `--at-ctnr` moves 540 → 720 → 960 → 1140 →
  1320px through `.at-ctnr` in ascending `min-width` blocks.
- **A private-namespace hover-only arm.** A component whose channels live in its
  own namespace (`.at-btn` owns `--at-btn-*`) may ship a `:hover` arm with no base
  when the resting value legitimately comes from the shell, a same-element
  variant, or the read's own fallback. This is only safe because no ancestor
  seeds a private namespace. It stops being safe the moment the same shape uses a
  **shared** channel — which is exactly the leak above — and the worked form is
  under [the properties change rule](#properties-change-rule).

A state arm seeding a **shared** channel with no base declaration is a bug,
unless the token has no reader on that element — then the seed is dead code and
should be deleted.

### Responsive

`:root` is one value, not a ladder. Re-declare per breakpoint; an element-scoped
declaration beats `:root` at the same specificity.

```css
:root { --at-ctnr: 700px; --at-gtr: 20px; }
@media (min-width: 576px) { .at-ctnr { --at-ctnr: 540px; } }
```

The shipped defaults are fixed at those three values and do not move with the
viewport unless you re-declare them.

### Component values stay private

A component's own measurement is not a shared token. `--at-gap` is the app's
spacing unit; a button's internal 6px is a different quantity, and 15px inside a
14px button reads as two separate controls. Use a private `--<prefix>-*` value —
the reason, and the failure mode of routing it through a shared channel, are in
[Why the namespace is private](#why-the-namespace-is-private).

### One source, one declaration — when a token is not warranted

**Does this value have a second writer?** A second writer is anything that
supplies a value other than the rule that styles the element — a theme or media
arm, a state, a second variant, a component that computes the value per instance,
or a generator writing the markup. If nothing else can supply it, a token is a
wrapper around a constant.

| Is there a second writer? | Encoding | Example |
| --- | --- | --- |
| An arm re-points it | seed + utility | `.at-btn-primary:hover { --at-btn-bg-cl: … }` |
| A control or per-instance value writes it | seed + utility | a block's saved `style="--at-p: …"` |
| It repeats, so it is a named scale step | step class + digit-free token | `.at-spc-lg { --at-gap: var(--at-spc-lg) }` |
| A breakpoint ladder on the reading class | reader ladder | `.at-ctnr { --at-ctnr: 540px }` in `min-width` blocks |
| **No — one source, written once** | **raw property in the rule** | **`.hero-title { font-size: 72px }`** |

Rows 3 and 4 are not variants; both are documented under
[Two shapes that are not violations](#two-shapes-that-are-not-violations). The
last row is the common one, and the class still does the work: `.hero-title`
scores `(0,1,0)` and outranks an `h1` element rule `(0,0,1)`, so the override
survives without a utility in the markup.

**Generated markup is the mandatory case.** When a block builder, a Gutenberg
control, or any other system writes the markup, the class + variable pair is not
a preference. A generated `style` attribute is an inline style, so it needs
`unsafe-inline` under a `style-src` policy, and it repeats the property on every
instance; the token is one seam the generator writes through, and one class serves
all of them. See [CSP](production.md#content-security-policy-inline-variables-are-inline-styles).

Put the other way: the override layer never touches a raw property, it redefines
the variable. That is the whole rule.

## The consumer contract

Seven rules. The first decides whether you are leaving a raw property behind or a
token around a constant. They are a convention, not framework requirements — but
rules 3 and 4 fail silently: nothing errors, the page renders, the value just
never moves.

1. **A raw property unless the value has a second writer.** One source written
   once — an element default, a reset, a component's own one-off box — is a plain
   declaration; a theme, state, second variant, per-instance value or generator is
   a second writer and needs the channel. Test and table:
   [when a token is not warranted](#one-source-one-declaration-when-a-token-is-not-warranted).
2. **Raw properties are the tool for global CSS**: resets, media defaults, the
   token block, the host adapter. Seeding a channel on a bare element sets it for
   that element's whole subtree — a token block in disguise:
   [Element-scoped tokens](#element-scoped-tokens).
3. **Match the encoding to the shape of the design.** The discriminator is
   repetition and variants, not which is "better":

   | Shape | Encoding | Markup |
   | --- | --- | --- |
   | Repeats, has variants — button, card, nav link | identity class owns its properties, reading its **own** `--<prefix>-*` namespace; variants set only those private variables | `at-btn at-btn-primary` |
   | Unique, no variants — brand name, logo, pagination | identity class writes the properties as raw declarations; no token, no appliers | `brand-name` |
   | Generated markup — block, Gutenberg control | identity class seeds a channel the generator writes; the markup carries the applier | `at-card at-p` |
   | Global layer — media defaults, resets | raw properties on the element | — |

   A repeating component's identity class is *meant* to be self-sufficient: the
   shell every instance wants belongs to the class, not to every call site
   ([Components](#repeating-with-variants-the-identity-class-owns-the-box)). For the
   unique shape the class is the whole mechanism, so write the properties in it —
   nothing varies, so a token would be a wrapper around a constant
   ([when a token is not warranted](#one-source-one-declaration-when-a-token-is-not-warranted)).

4. **Never restate one variable in two places.** Seeding a channel *and* writing
   a property in the same rule is fine as long as the property reads a
   *different* variable — seeding `--at-cl` for a nested `.at-svg` while
   `color` reads `--at-btn-cl` is one rule doing two jobs, not a duplicate.

   The failure is a variable stated twice, or a property that a class already
   applies:

```css
/* WRONG — --at-p seeds nothing, and padding is written twice. */
.at-btn { --at-p: 6px 12px; padding: 6px 12px; }
```

5. **A component-local value is not a shared token, and a component does not read
   one either.** `--at-gap` is the app's spacing unit; a button's internal 6px is a
   different quantity, and a shared channel has every ancestor as a supplier. Use a
   private `--<prefix>-*` value:
   [Why the namespace is private](#why-the-namespace-is-private).

6. **A consumer may define any private class or variable, `at-`-prefixed or
   not.** Two obligations. It stays in your stylesheet — the `at-` prefix
   belongs to the framework, so borrowing the name is fine but adding to the
   framework is not: never expect a consumer name in a bundle. The legend governs the *framework's* vocabulary — it is not a
   registry you have to apply to for permission to name your own components, so
   `--at-card-*` needs no entry anywhere to be valid. And hand the names to the
   checker with `--allow`, so their absence from the reference is a decision
   rather than a warning you learn to ignore.

7. **A custom property is for a value that has variants.** The variants that
   justify one: the button family (`--at-btn-*`), colour and accent schemes, the
   media-query and `data-at-theme` arms, user-action states (`:hover`,
   `[aria-current="page"]`, `[disabled]`), and a generator writing a per-instance
   value. Seeded once and never re-pointed, it is a value in a wrapper and it
   inlines. Test: [when a token is not
   warranted](#one-source-one-declaration-when-a-token-is-not-warranted). Scale
   convention: [Five decisions](#five-decisions-the-framework-leaves-to-you).

Rule 3 has a cost: a repeating identity class that owns its properties is
*load-bearing*. A page that forgets your stylesheet loses the box while the
variables still resolve. In the unique shape the class writes the properties
itself, so a missing sheet is equally broken — which is what a sheet-wide failure
looks like anyway.

## How to design with this framework

The contract below is the mechanism. These are the intent — three principles
the framework already follows, and the decisions it deliberately leaves to you.

### Semantic HTML first

Utility classes layer onto semantics, never replace them. `<button>` over
`<div role="button">`, `<nav>` over `<div class="nav">`, `<h2>` over a styled
`<p>`. The element brings focus behaviour, keyboard handling, and the
accessibility tree for free, and no class can add any of them — `at-p` does not
make a `<div>` reachable by keyboard. A utility framework can restyle semantics;
it cannot supply them.

### Mobile first

Base rules *are* the small screen: wider viewports are reached by adding an
infix, never by writing a max-width variant, and the whole infix set is in
[classes.md](classes.md#breakpoints). The one consequence worth
restating here — a max-width rule would have to be beaten by the base rule that
follows it in the bundle — is why that set is fixed rather than open.

### Five decisions the framework leaves to you

**Focus is yours.** No focus utility ships, and `.at-outl` applies `outline`
without ringing anything by itself. A keyboard user needs a visible indicator
you have to write — in the global layer, so it applies everywhere:

```css
:focus-visible { outline: 2px solid var(--at-cl); outline-offset: 2px; }
/* The raw property applies it; the theme seeds --at-cl at :root. A :root prefix
   here would add nothing — every focusable element is a descendant of <html>. */
```

**Motion is yours to gate.** `.at-trs` applies `transition` unconditionally.
Respect the preference rather than assuming it:

```css
@media (prefers-reduced-motion: reduce) { * { --at-trs: none; } }
/* Not an element default, so not the rule above: this overrides a token for the
   whole app under a media condition. Two classes read --at-trs — .at-trs, and
   .at-ovl's :after layer — so seeding it at :root would still every overlay too.
   Gating on `*` scopes it to those two and leaves host CSS alone. */
```

Seeding the channel overrides it for every descendant, so nothing animates
without each element opting back in.

**Contrast is a decision, not a default.** `--at-cl` and `--at-bg-cl` are
channels that apply whatever they are given; nothing checks the pair. Palette
tokens like `--at-white` and `--at-primary` are just values — verify the
foreground against the background you actually pair it with, including hover
and disabled states.

**Keep z-index on a named scale.** `--at-z-idx` exists, and structural classes
seed it, but the framework does not reserve the scale. Inventing `z-index:
9999` per component is how a layering model rots; write the scale down once and
use it.

**A number in a class name is a step on a scale you own — never a raw
measurement.** The framework does this itself: 245 of its classes end in a purely
numeric segment — 257 counting the twelve `2m3` fifths — and they are all scale
positions, not measurements. `.at-col-6` is "span
6 of 12"; `.at-flx-grw-1` and `.at-flx-srnk-0` are the two ends of a 0/1 range.
None of them is a pixel value.

That is the whole test. A number that indexes a **scale** is fine. A number that
*is* the value — a class meaning literally `20px` — is not, because it hard-codes
a measurement into a name and every reader has to guess whether 20 is px, %, or a
step. The demo's own stylesheet shipped exactly that before this rule, and it is
the reason the scale below names steps instead.

**When one value repeats in several places, give it a step on a named scale.**
The framework ships no numeric spacing utility, so a consumer that needs `20px` of
gap in three places should say so once:

```css
:root {
    --at-spc-sm: 5px;
    --at-spc-lg: 20px;
}

.at-spc-sm { --at-gap: var(--at-spc-sm); }
.at-spc-lg { --at-gap: var(--at-spc-lg); }
```

```html
<div class="at-flx at-gap at-spc-lg"><!-- was: --at-gap:20px three times inline --></div>
```

Note the split, because it is the framework's own convention: **the step is named
by the class, the value by a digit-free variable.** `.at-col-6` names its step in
the class name; no framework variable contains a digit, so `--at-spc-lg` names the
value and `.at-spc-lg` names the step. A step class only seeds the channel — a
reader such as `.at-gap` still applies it, so the two co-apply.

Now `.at-spc-lg` is a step like `.at-col-6`, the pixels are declared once and
change in one place, and no name contains a measurement. This is the same
discipline as writing the z-index scale down — one scale, named, owned.

**One value used once does not need a class.** A single `gap: 20px` is not a
pattern; give it a raw property or a variable on the one element that needs it.

**Do not add a class for zero.** `.at-p` and `.at-m` already read `--at-p` and
`--at-m` with an `initial` fallback, and `initial` for padding and margin *is*
`0`. So bare `.at-p` computes to `padding: 0` and needs no value beside it.
`.at-p-0` and `.at-m-0` would each be a second name for a number the framework
already gives you — and either would hide the checker's warning that the channel
is unsupplied, which is real information when the value is genuinely missing.

## Which classes read a channel, and which do not

Across the full 616-class inventory, 451 classes read **no** variable — every
flex, align and display utility. 165 read at least one, and those are inert
until you seed them. (The minimal bundle is 440 of those classes: 275 with no
channel, the same 165 readers.) This is the distinction that decides whether a
class in your markup needs a value beside it, and it is mechanically checkable —
read `reads[]` off the class in the generated reference, using the recipe at the
top of [classes.md](classes.md#look-a-name-up-before-you-use-it).

A worked shell:

```css
/* WRONG — three properties the framework already ships behind classes. */
.shell { display: flex; flex-direction: row; height: 100vh; overflow: hidden; }

/* RIGHT — values only. */
.shell { --at-h: 100vh; --at-ovf: hidden; }
```

```html
<div class="shell at-flx at-h at-ovf"></div>
```

- `at-flx` reads nothing, so it needs no channel — it applies `display: flex`
  unconditionally.
- `at-h` and `at-ovf` each read one variable, so **each needs its own seed**.
  Miss one and that single property silently does nothing while the others work.
- `at-flx-row` is deliberately absent: `flex-direction`'s initial value is
  `row`, so declaring it states a default that already holds, and a later
  `at-flx-col` would have to cancel it.

### A class may read more than one channel

`at-bdr` is **three** channels, not one: `--at-bdr-cl`, `--at-bdr-w`,
`--at-bdr-sty`. Seeding only the colour and letting the rest fall back to
`initial` happens to work (it gives `border-style: none`, so no border shows),
but it is accidental. Seed what you mean:

```css
.plain-button {
  --at-bdr-cl: transparent;
  --at-bdr-w: 0;
  --at-bdr-sty: none;
}
```

The heaviest readers are `at-bg-img` (7 channels) and `at-msk` (6). Check
`reads[]` before assuming one class means one variable.

### Flex is fully expressible as classes

There is no reason to hand-write flex: `at-flx-col` is `flex-direction: column`,
and `at-flx-fil` / `at-flx-grw-0` / `at-flx-grw-1` / `at-flx-srnk-0` /
`at-flx-srnk-1` compose a `flex: 0 0 auto` — the whole family is in
[classes.md](classes.md#flex-210-and-display-54). Note that **`at-fl` is
`filter`, not `flex`**, so seeding `--at-fl` to feed a hand-written `flex:` names
the wrong channel.

A project may still freeze a partially-migrated flex model during a migration,
but that is its own recorded decision, not framework guidance — a half-migrated
model is worse than a consistent one.

## One exception: host CSS you cannot put a class on

Raw `color` is acceptable even where a utility exists, when a host stylesheet (a
CMS admin theme, a UI kit) sets colour on the same elements and a restatement is
the only way to out-specify it. The palette still lives in your tokens; the
exception governs the *property*, not the colour.

There is no exception for a colour-mode, media or state arm. Restating a
property in one of those is the defect [the properties change
rule](#properties-change-rule) exists to prevent: it states the same fact twice,
so the two copies drift, and the arm wins or loses on source order rather than
on intent. Re-point the token instead.

## Write the prefix literally

`at-` and `--at-` are **constants fixed by the bundles you linked**. Write them
literally. Never introduce a variable, map or alias for them:

```scss
/* WRONG — a constant that cannot change, wrapped in indirection. */
$at: '.at';
$vp: '--at';
.card { #{$vp}-cl: #000; }

/* RIGHT */
.card { --at-cl: #000; }
```

The cost is not verbosity, it is a silent failure mode. The prefix is part of
the shipped CSS's public surface: if you set your own, `.card-btn` compiles
clean, passes every build, and matches **nothing** — no error, no warning, just
a rule that does nothing. A literal cannot drift; a variable invites someone to
change it, and that change is invisible until the CSS stops working. Grep works
against a literal (`rg -- '--at-cl'` finds every reader; through an
interpolation it finds only the template), and a prefix that *did* need to
differ is a different framework — renaming is breaking for every downstream
consumer, so it is a fork, not a setting.

## Components: one owner per class

No component CSS ships. A class is either a framework utility, or an identity
class you own — never both. Which of the two component shapes you use follows
from rule 3: does the design repeat, and does it have variants?

### Repeating with variants — the identity class owns the box

A button, a card, a nav link: many instances, a registry of variants. The
identity class is self-sufficient, reading its **own** private namespace, and
variants set only those private variables. Markup carries the identity and the
variant, nothing else.

Nothing here is specific to buttons. Any component that repeats with variants
takes this shape, and the namespace simply follows the component — a card is
`--at-card-*`, a panel `--at-panel-*`. Only the values and the properties differ;
the rule is that the component owns its own geometry instead of borrowing the
app's shared vocabulary.

```css
/* The shell. Private namespace — --at-gap and friends are the app's shared
   vocabulary, and a button's own measurements are not part of it (rule 5). */
.at-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;                    /* deliberately not var(--at-gap) */
  box-sizing: border-box;
  cursor: var(--at-btn-cur, pointer);   /* reads the private token directly */
  color: var(--at-btn-cl, inherit);
  text-decoration: none;
  background-color: var(--at-btn-bg-cl, transparent);
  font-size: var(--at-btn-fnt-sz, 14px);
  line-height: var(--at-btn-ln-h, normal);
  border-color: var(--at-btn-bdr-cl, transparent);
  border-width: var(--at-btn-bdr-w, 0);
  border-style: var(--at-btn-bdr-sty, solid);
  border-radius: var(--at-btn-bdr-rad, 3px);
  padding: var(--at-btn-p, 6px 12px);
}

.at-btn[disabled] { --at-btn-cur: not-allowed; opacity: 0.5; }
```

Note what the shell does *not* do: it never publishes `--at-btn-cl` into the
shared `--at-cl`. `cursor` reads its own token, and `color` reads its own token,
because a private token has exactly one supplier and a shared one has every
ancestor.

Variants are values only — the same job a global token block does:

```css
.at-btn-primary {
  --at-btn-cl: var(--at-white);
  --at-btn-bg-cl: var(--at-primary);
  --at-btn-bdr-cl: var(--at-primary);
}
.at-btn-primary:hover {
  --at-btn-bg-cl: var(--at-primary--hover);
  --at-btn-bdr-cl: var(--at-primary--hover);
}
.at-btn-secondary { --at-btn-bg-cl: var(--at-secondary); --at-btn-bdr-cl: var(--at-secondary); }
```

```html
<button class="at-btn at-btn-primary">Primary</button>
<button class="at-btn at-btn-outln-primary">Outline</button>
<button class="at-btn at-btn-lnk">Link</button>
<button class="at-btn" disabled>Disabled</button>
```

Two classes, at every call site, whatever the variant. A shell that every
instance wants is the class's job: carrying eight classes on each button is
eight chances to forget one, and the instance that forgets renders wrong with
nothing to show for it.

### Why the namespace is private

A private token is not a tidier name. It is an **isolation boundary**, and rule 5
gives the mechanism. Here is what that costs when it is ignored.

```html
<section class="unique-section">
  <button class="at-btn at-btn-primary">Save</button>
</section>
```

```css
/* The section's own seed. Correct for the section. */
.unique-section { --at-cl: red; }
```

Read that as "the section and its text are red" and it is fine. But `.at-svg`
applies `fill: var(--at-cl)` with **no fallback**, so an icon inside that button
now paints red too — and nothing errors. The section never mentioned the button.

```css
/* RIGHT — the button reads a token only its own variants set, and the icon is
   styled on the icon's own class. */
.at-btn-primary { --at-btn-cl: var(--at-white); --at-btn-bg-cl: var(--at-primary); }
.at-btn .at-svg  { fill: var(--at-btn-cl, currentColor); }
```

`--at-btn-cl` has exactly one supplier, so no ancestor can reach it by accident.
That is the whole argument for the namespace, and it is a different argument from
rule 5's: that one is about *publishing* a value you should keep to yourself, this
one is about *reading* a value that anyone may set.

**Generated markup is the one case where the parent publishes.** A generator emits
the child and you cannot put a class on it, so the value has to travel through the
channel its child already reads:

```css
/* Generated markup only: the script cannot class the icon, so the parent
   republishes. In hand-written HTML, write `fill` on the icon's own class. */
/* the same card as above, in the generated case */
.at-card { --at-cl: var(--at-card-cl, inherit); }
.at-card > .at-svg { fill: var(--at-cl); }
```

Two namespaces in one rule is still not rule 4's violation — different variables,
two jobs — but it is a tool for a case where you cannot reach the child, not a
default. Anywhere you own the markup, reach the child.

### Unique, no variants — the class writes the properties

A brand name, a logo, a one-off panel: one instance, no registry, and nothing
that will ever re-point a value. The class writes the properties, and the markup
carries the class and nothing else.

```css
.brand-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

```html
<span class="brand-name">Acme</span>
```

Seven tokens and seven applier classes were what this used to cost, for values
that had exactly one source. The class is still the mechanism — `.brand-name`
outranks any element rule the host sheet brings — so the only thing the seed
bought was a second place to look for each value.

In **generated markup** — a block, a site builder, a Gutenberg control — the
seed shape is mandatory rather than preferred, and for a reason that has nothing
to do with the grid: the generator needs a seam to write a per-instance value
through. A generated `style` attribute is an inline style, so a `style-src`
policy without `unsafe-inline` drops it silently, and it repeats the property on
every instance. The seed is one channel the generator writes and every instance
shares. That is the same test as above with the generator as the second writer,
and it is why a block's values are the exception to "one source, one declaration"
rather than a contradiction of it.

The whole shape is two classes and one channel — the block class owns the token,
an applier class applies it:

```css
/* Your block class owns the channel. `--at-card-*` is a private namespace — no
   bundle ships it, and it never reaches a component you did not write. */
.wp-block-card {
  --at-cl: var(--at-card-cl, inherit);
  --at-p: var(--at-card-p, 1rem 1.5rem);
}
```

```html
<!-- generator output: the applier classes are fixed, the values are per-instance -->
<figure class="wp-block-card at-cl at-p">
  <img src="…" alt="…">
</figure>
```

`.at-cl` and `.at-p` are ordinary shipped appliers (`color: var(--at-cl, initial)`,
`padding: var(--at-p, initial)`) — the block adds no property CSS of its own. The
generator writes `--at-card-cl` / `--at-card-p`; every instance shares the two
classes. Name the applier class with no leading dash: `at-cl`, not `-at-cl`.

A block with a **static** value takes the other branch — the block class writes
the properties and takes no applier at all. The second writer is the test, not the
fact that the markup is generated.

### Naming the private namespace

Mirror the channel each value serves, so the mapping is legible at a glance:
`--at-btn-bdr-cl` for border colour, `--at-btn-bdr-rad` for radius. Mind the
legend — `r` is **right**, not radius, so `-bdr-r` decodes wrongly even though
it passes a token check. Use `rad`.

The token a property-change arm re-points is named the same way: a card that
changes colour and margin by theme and by state owns `--at-card-cl` and
`--at-card-m`, and nothing else — the namespace is what makes the arm safe
without a resting declaration (see
[the properties change rule](#properties-change-rule)).

Variants read the palette tokens `--at-<color>` and `--at-<color>--hover`, plus
`--at-white`, `--at-black`, `--at-base-color`, `--at-body-color`,
`--at-quaternary`. Declare them at `:root` or on a theme container.

A layout variant that only sets a value needs no extra markup — the shell reads
it. `.at-btn-icon` is one: it sets its value alone and the shell's `gap` picks
it up. Only when a variant genuinely needs a reader class on the element do you
pair one with a utility, as `[disabled]` does at the bottom of this block.

**None of these class names ship.** `at-btn` appears nowhere in a bundle, so
`verify-usage.mjs` needs `--allow at-btn,at-btn-primary,…`, and the private
variables need allowlisting too (rule 6). `.at-txt` is the same kind of consumer
hook: removed from the framework in 2.0, usable as a styling hook, and it will
never appear in a bundle or in the reference.

## Variables in markup and JS

The variable may sit inline, on your own class, or on any ancestor — the class
only has to be on the element that uses the property.

```html
<div class="at-p at-cl" style="--at-p: 24px; --at-cl: #c00">inline</div>
<div class="at-p card">value comes from .card or an ancestor</div>
```

In a component framework, **a value the component computes per instance is a
second writer**, so it earns the pair: props, theme context, a breakpoint hook, a
saved user preference. A JSX component that renders the same two hundred pixels
everywhere should write `padding` in its own stylesheet and name no applier —
see [when a token is not warranted](#one-source-one-declaration-when-a-token-is-not-warranted).

In JSX the same pair is `style={{ "--at-p": "24px" }}`, and in TypeScript the
tokens object needs `as React.CSSProperties` — custom properties are not in
`CSSProperties` by default.

Keep direction out of variable values (see RTL in `setup.md`), and keep values
direction-neutral even in LTR builds, so the same token works in both.

## Composition recipes

Grid, fifths and gutterless rows are in
[classes.md](classes.md#grid-104-classes) with the arithmetic behind them.
The combinations that span families:

```html
<!-- flex with alignment and gap -->
<div class="at-flx-col at-flx-md-row at-jfy-cont-btw at-al-itm-ctr at-gap">
  <div class="at-col-12 at-col-md-4">…</div>
</div>

<!-- overlay and shapes -->
<div class="at-ovl at-ovl-cl" style="--at-ovl: linear-gradient(#0000, #000)">…</div>
<div class="at-blk-shp">
  <div class="at-shp at-shp-t">Top half</div>
  <div class="at-shp at-shp-b">Bottom half</div>
</div>
```

Vertical layout — the rail width is `--at-vrt-w` (20% if unset), and the gap
falls back to `--at-gap` then `15px`. **`.at-vrt` sets only `gap`, so it needs a
flex or grid parent of its own** — `at-flx` above is not optional, and without it
the gap does nothing and the two children stack.

```html
<div class="at-vrt at-flx">
  <aside class="at-vrt-hdr">rail</aside>
  <main class="at-vrt-conts">content</main>
</div>
```

## Overriding

Bundles carry **zero** `!important`, so every utility is an ordinary (0,1,0)
declaration that your CSS beats with specificity or order. Preference order:

1. Redefine the variable (best — composes with theming).
2. Add a class.
3. Load your sheet after the bundle.
4. `!important` only at an external boundary you do not control — third-party or
   CMS markup. For framework-wide importance, build from the template's
   `%%IMPORTANT%%` instead, all-or-nothing — [setup.md](setup.md#wordpress-php-and-any-runtime-generated-build).

If a utility you set earlier stops winning, look for a later rule of equal
specificity setting the same property — the bundle's Grid → Utilities →
Properties order is why that happens, and it is expected, not a bug.
