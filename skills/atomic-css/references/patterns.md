# Patterns

Real patterns, taken from the framework's reference consumer and its documented
`.at-btn` contract in `README.md`. All verified against commit `c51609b`.

## The base layer stays at zero specificity

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

/* One design in the system wants to be different. That gets an identity class,
   which seeds the channels; the utilities in the markup apply the properties,
   and they outrank the raw global above. */
.hero-title { --at-fnt-sz: 72px; --at-cl: #fff; }
```

```html
<h1 class="hero-title at-fnt-sz at-cl">Leader</h1>
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

Name the token after the element, not the property — `--at-h1-fnt-sz`, not
`--at-fnt-sz`. The framework spells the same idea `--at-body-fnt-sz` for the
document root; both are legend tokens, so either resolves. The rule is spelled
out under Device and state rules in `ARCHITECTURE.md`.

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

## Theming: variables only

```css
:root {
  --at-ctnr: 1280px;      /* themeable, but a single value — see below */
  --at-gtr: 20px;
  --at-gap: 24px;         /* .at-row-gap / .at-col-gap follow automatically */
  --at-cl: #1c1c1c;
  --at-bg-cl: #fff;
  --at-fnt-sz: 16px;
}

[data-at-theme='dark'] { --at-cl: #f2f2f2; --at-bg-cl: #161616; }
```

```html
<html data-at-theme="dark">
```

Because the switch redefines variables only, every utility on the page follows
with no class changes and no extra stylesheet. Never set properties in a theme
block — that is what makes theming composable.

Two things to know:

- **The framework ships no `:root` variables.** `--at-ctnr`, `--at-ctnr-min`
  and `--at-gtr` carry direct `var()` fallbacks at their use sites, so the grid
  works before you theme anything. Your own CSS reading `var(--at-ctnr)` bare
  will not resolve — write `var(--at-ctnr, 1140px)` or declare it.
- **Those defaults are not responsive.** `--at-ctnr` is one value; re-declare it
  per breakpoint, and element-scoped declarations win over `:root`:

```css
:root { --at-ctnr: 700px; --at-gtr: 20px; }
@media (min-width: 576px) { .at-ctnr { --at-ctnr: 540px; } }
```

Every state or device block that uses a variable re-declares it in that block —
never carry a value forward.

## Seeding a reader's own default

A reader shipped with no default and an `initial` fallback collapses to zero
unseeded. When you seed it, **put the seed on the reader's own class, not on an
ancestor** — a declaration on an element beats an inherited value at any
specificity, so every `--at-gap` placed on an ancestor is overruled before it
arrives.

```css
/* WRONG — the row wears at-gap through its content span, so this never arrives. */
.wp-tcra-rail-item { --at-gap: 12px; }

/* RIGHT — name the reader, not the container. */
.wp-tcra-rail .wp-tcra-nav-link { --at-gap: 12px; }
```

Two things follow, and both fail silently:

- A seed on the reader's class can only be overridden from a more specific
  selector, never by an ancestor. When an override appears not to work, check
  where it is placed before changing the value.
- A rule that restates what the base already says is dead. Restating a value an
  ancestor supplies is the same defect as restating a property behind a class,
  one layer out.

### A state arm must declare the base it overrides

This is the rule most often broken, because the broken version looks correct:
custom properties inherit, so **a token seeded only inside a state arm has no
value on the element at all in the resting state** — it silently picks up
whatever an ancestor set.

```css
/* The page shell owns the height. */
main.at-h { --at-h: 100vh; }

/* WRONG — `wp-card` inherits 100vh. Only `:hover` has a value. */
.wp-card:hover { --at-h: 50px; }

/* RIGHT — the resting state is declared, so it is 100vh→own value, then 50px. */
.wp-card { --at-h: 200px; }
.wp-card:hover { --at-h: 50px; }
```

Verified behaviour for `<main class="at-h" style="--at-h:100vh">` wrapping
`<div class="at-h wp-card">` where only `:hover` seeds the token:

| the card's own declaration | resting | `:hover` |
|---|---|---|
| *(none)* | **720px** — inherited `100vh` | 50px |
| `--at-h: initial` | 18px (`height: auto`) | 50px |
| `--at-h: 200px` | 200px | 50px |

The same applies to a media or device block: a token written only inside
`@media` has no value outside it.

**Declare the resting value explicitly.** `initial` is the right keyword only
when *unset* is what you want, because `height: var(--at-h, initial)` resolves
to `auto` — not to a sensible default. If you mean 200px, write 200px.

#### `unset` does not reset a custom property

The obvious wrong fix silently fails. Custom properties inherit, so
`--at-h: unset` computes to **`inherit`** — it restores the leaked value:

| the card's own declaration | resting |
|---|---|
| `--at-h: initial` | 18px — reset |
| `--at-h: unset` | **720px — still leaking** |

`initial` works because it yields the guaranteed-invalid value, and a
declaration beats an inherited value at any specificity. Use `initial`, never
`unset`, to mean "this component opts out of its ancestors".

Two consequences worth knowing:

- The reset propagates. A reset on a container unsets the whole subtree below
  it, because its descendants inherit the guaranteed-invalid value. Reset the
  element you mean, not a wrapper.
- A same-element variant still wins. `.btn { --at-btn-cl: initial }` does not
  defeat `.btn-primary { --at-btn-cl: #006600 }` — the later, equally specific
  declaration takes precedence. A reset and a variant coexist safely.

#### Two shapes that are not violations

Both are deliberate, and both are fenced so they cannot become a loophole:

- **A reader ladder.** When the token belongs to the class that *reads* it, a
  `min-width` sequence is the value being stepped, not a missing base. The
  framework does this itself: `--at-ctnr` moves 540 → 720 → 960 → 1140 →
  1320px through `.at-ctnr` in ascending `min-width` blocks.
- **A private-namespace hover-only arm.** A component whose channels live in
  its own namespace (`.at-btn` owns `--at-btn-*`) may ship a `:hover` arm with
  no base when the resting value legitimately comes from the shell or a
  same-element variant. This is only safe because no ancestor seeds a private
  namespace. It stops being safe the moment the same shape uses a *shared*
  channel, which is exactly the leak above.

If a state arm seeds a **shared** channel (`--at-cl`, `--at-bg-cl`, `--at-p`)
with no base declaration, that is a bug — unless the token has no reader on
that element, in which case the seed is simply dead and should be deleted.

### `url()` in a seeded image token is resolved against the stylesheet

A seed the framework's own class consumes carries one more trap. `--at-bg-img`
and `--at-msk-img` are read by `.at-bg-img` / `.at-msk` in the bundle, so the
browser resolves the `url()` **against that stylesheet's URL, not the document's**:

```css
/* WRONG on a page at /products/index.html — resolves to /css/img/hero.jpg */
.hero { --at-bg-img: url("img/hero.jpg"); }

/* RIGHT — root-relative, so it does not depend on where the rule is declared */
.hero { --at-bg-img: url("/img/hero.jpg"); }
```

It fails silently: the token is set, the class applies, the declaration is
valid, and only the image is missing. Either use a root-relative path, or
declare the consuming property on the same rule that seeds it.

```css
/* Also correct — the page declares the read, so the url() is document-relative. */
.hero { --at-bg-img: url("img/hero.jpg"); background-image: var(--at-bg-img); }
```

## The consumer contract

Raw properties are cheap to write and easy to leave behind, so a strict
consumer adopts six rules. They are a convention, not framework requirements —
but rules 3 and 4 fail *silently*: nothing errors, the page renders, and the
defect only shows as a value that does not move.

1. **Raw properties only where genuinely necessary** — chiefly to override host
   CSS (WordPress, a UI kit) and for the global layer.
2. **Raw properties are the tool for global CSS**: resets, media defaults, the
   token block, the host adapter. Element defaults especially — seeding a channel
   on a bare element sets that token for its whole subtree, so it is a token
   block in disguise, and the wrong scope.
3. **Match the encoding to the shape of the design.** The discriminator is
   repetition and variants, not which is "better":

   | Shape | Encoding | Markup |
   | --- | --- | --- |
   | Repeats, has variants — button, card, nav link | identity class owns its properties, reading its **own** `--<prefix>-*` namespace; variants set only those private variables | `at-btn at-btn-primary` |
   | Unique, no variants — brand name, logo, pagination | identity class seeds only the framework's `--at-*` channels; zero raw properties | `brand-name at-cl at-fnt-sz …` |
   | Global layer — media defaults, resets | raw properties on the element | — |

   For a repeating component, the identity class is *meant* to be
   self-sufficient. A shell that every instance wants is the class's job, not
   every call site's: eleven classes on one button is eleven chances to forget
   one.

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

5. **A component-local value is not a shared token.** `--at-gap` is the app's
   spacing unit. A button's internal 6px is a different quantity — routing it
   through `--at-gap` corrupts the token for every descendant that reads it, and
   15px inside a 14px button reads as two separate controls. This is why the
   repeating shape wants its own namespace: values the component owns do not
   belong in the vocabulary it shares.

6. **A consumer may define any private class or variable, `at-`-prefixed or
   not.** Two obligations. It stays in your stylesheet — the `at-` prefix
   belongs to the framework, so borrowing the name is fine but adding to the
   framework is not: never add a consumer name to `short-names.json` or expect
   it in a bundle. The legend governs the *framework's* vocabulary — it is not a
   registry you have to apply to for permission to name your own components, so
   `--at-card-*` needs no entry anywhere to be valid. And hand the names to the
   checker with `--allow`, so their absence from the reference is a decision
   rather than a warning you learn to ignore.

One consequence of rule 3 worth stating: a repeating identity class that owns
its properties is *load-bearing*. A page that forgets your stylesheet loses the
box while the variables still resolve. That is the cost of making the class
self-sufficient, and it is why the unique shape exists — where the markup
carries the classes, a missing sheet is visibly broken rather than quietly
wrong.

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

### Global first, local second

Values live in the base layer, at zero specificity, so any utility overrides
them without `!important`. The framework ships no `:root` variables precisely so
this stays true: you own the token block, and it sits underneath everything.

The layer order is fixed, and reordering it silently changes which rule wins —
see [above](#the-base-layer-stays-at-zero-specificity) for the six steps.

### Mobile first

Base rules *are* the small screen. Wider viewports are reached only by adding
an infix, never by writing a max-width variant — so "below the breakpoint" means
the base rule, with nothing to override. There are no `xs` or `md-down` classes
because a max-width rule would have to be beaten by the base rule that follows
it in the bundle.

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
`.at-p-0` would be a second name for a number the framework already gives you —
and it would hide the checker's warning that the channel is unsupplied, which is
real information when the value is genuinely missing.

## Which classes read a channel, and which do not

Across the full 616-class inventory, 451 classes read **no** variable — every
flex, align and display utility. 165 read at least one, and those are inert
until you seed them. (The minimal bundle is 440 of those classes: 275 with no
channel, the same 165 readers.) This is the distinction that decides whether a
class in your markup needs a value beside it, and it is mechanically checkable:

```bash
# run from this skill's folder — the one holding SKILL.md
REF=generated/CLASS-REFERENCE.json
node -p "require('./$REF').classes.find(c=>c.name==='at-ovf').reads"   // ['--at-ovf']
node -p "require('./$REF').classes.find(c=>c.name==='at-flx').reads"   // []
```

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

There is no reason to hand-write flex. Use `at-flx-col` for
`flex-direction: column`, and `at-flx-fil` / `at-flx-grw-0` / `at-flx-grw-1` /
`at-flx-srnk-0` / `at-flx-srnk-1` to compose a `flex: 0 0 auto`. A project may
still freeze a partially-migrated flex model during a migration, but that is its
own recorded decision, not framework guidance — a half-migrated model is worse
than a consistent one.

### One trap worth memorising

**`at-fl` is `filter`, not `flex`.** Seeding `--at-fl` to feed a hand-written
`flex:` names the wrong channel; use `at-flx-*` instead.

## Two exceptions, and why they are not rule-breaking

- **`color`.** Raw `color` is acceptable even where a utility exists, when a
  host stylesheet (a CMS admin theme, a UI kit) sets colour on the same elements
  and a restatement is the only way to out-specify it. The palette still lives
  in your tokens; the exception governs the *property*, not the colour.
- **Media and state arms.** In a `prefers-color-scheme` or `[data-theme]` arm you
  may restate the property, because redefining the variable there would state
  the same fact in a second rule. Dark arms written as raw properties are
  intentional, not an oversight. If the arm instead *seeds* a token, it is
  subject to the state-arm rule above and needs a base — the permission covers
  restating a property, not skipping a declaration.

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
  --at-cl: var(--at-btn-cl, inherit); /* seeds fill for a nested .at-svg */
  --at-cur: var(--at-btn-cur, pointer);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;                    /* deliberately not var(--at-gap) */
  box-sizing: border-box;
  cursor: pointer;
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

Note the two namespaces in one rule are deliberate and are not rule 4's
violation: `--at-cl` is seeded for a *descendant* that carries `.at-svg`, while
`color` reads the private `--at-btn-cl`. Different variables, two jobs.

### Unique, no variants — the class seeds, the markup applies

A brand name, a logo, a one-off panel: one instance, no registry. Nothing
repeats, so nothing justifies the identity class owning a box. It seeds only
the framework's channels, and the markup carries the classes that apply them.

```css
/* No properties at all. */
.brand-name {
  --at-fnt-sz: 16px;
  --at-fnt-wt: 700;
  --at-ln-h: 1.2;
  --at-cl: var(--text);
  --at-white-sp: nowrap;
  --at-ovf: hidden;
  --at-txt-ovf: ellipsis;
}
```

```html
<span class="brand-name at-cl at-fnt-sz at-fnt-wt at-ln-h at-white-sp at-ovf at-txt-ovf">Acme</span>
```

Here the missing stylesheet is loudly broken rather than quietly wrong, which
is the trade rule 3 makes on purpose.

### Naming the private namespace

Mirror the channel each value serves, so the mapping is legible at a glance:
`--at-btn-bdr-cl` for border colour, `--at-btn-bdr-rad` for radius. Mind the
legend — `r` is **right**, not radius, so `-bdr-r` decodes wrongly even though
it passes a token check. Use `rad`.

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

```jsx
<div className="at-p at-cl" style={{ "--at-p": "24px", "--at-cl": "#c00" }} />
```

```ts
const tokens = { "--at-p": "24px", "--at-cl": "#c00" } as React.CSSProperties;
```

Keep direction out of variable values (see RTL in `setup.md`), and keep values
direction-neutral even in LTR builds, so the same token works in both.

## Composition recipes

Grid and responsive:

```html
<div class="at-ctnr">
  <div class="at-row">
    <div class="at-col-12 at-col-md-6 at-col-lg-4">…</div>
    <div class="at-col-12 at-col-md-6 at-col-lg-4">…</div>
  </div>
</div>
```

Fifths:

```html
<div class="at-col-2m3">…</div>
```

Gutterless edge-to-edge:

```html
<div class="at-row at-no-gtr"><div class="at-col-6">…</div></div>
```

Flex with alignment and gap:

```html
<div class="at-flx-col at-flx-md-row at-jfy-cont-btw at-al-itm-ctr at-gap">
  <div class="at-col-12 at-col-md-4">…</div>
</div>
```

Overlay and shapes:

```html
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
   `%%IMPORTANT%%` instead, all-or-nothing.

If a utility you set earlier stops winning, look for a later rule of equal
specificity setting the same property — that is expected in this framework, not a
bug.
