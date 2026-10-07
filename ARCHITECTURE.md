# Atomic CSS Architecture

Rules for the framework and its reference consumer. Where current code and these rules disagree, the rules win.

**Owner:** architecture owner · **Authority:** the rules for paths, the token contract, bundles, the template, the consumer contract, and the gates that enforce them.

## Contents

- [Scope](#scope)
- [Shared rules](#shared-rules)
- [Core framework](#core-framework)
- [Consumer simulation (demo/)](#consumer-simulation-demo)

---

## Scope

**Core framework**
- `scss/*` — sources; `css/*`, `css-max/*`, `css-template/*` — compiled artifacts (the template is the dynamic-consumer source)
- `scripts/*`, `webpack.config.js`, `rtl-css-plugin.js`, `.bin/*`
- `short-names.json`, `README.md`
- `skills/atomic-css/*` — the agent-facing consumption contract, shipped in the package; hand-written except `skills/atomic-css/generated/*`, which `scripts/generate-docs.js` generates

**Consumer simulation (reference consumer)**
- `demo/**` — stands in for a downstream design system, and every pattern a consumer is expected to follow is demonstrated here first. `scripts/check-demo.js` fails the build on an unresolvable stylesheet, an undefined `.at-*` or dead CSS, and `demo/organism/*` is in the CI drift check. A pattern may only be dropped when the framework stops shipping the feature it demonstrates — deleting a page is an amendment to this file, in the same change.
- The consumer-facing rules live in `skills/atomic-css/references/patterns.md` and are not restated here.

**Key paths**
- Prefixes: written literally (`.at` / `--at`) in every `.scss` source — there is no prefix variable (§ The prefixes are literals).
- Bundle entries: `scss/grid.scss` (minimal), `scss/grid-max.scss` (max), `scss/grid-template.scss` (template); shared partials in `scss/grid_base/`, mixins in `scss/grid_mixin/`.
- Naming legend: `short-names.json`. Reference variable set: `demo/colormode-globalstyle/scss/variable.scss`. Consumer base theme: `demo/colormode-globalstyle/scss/dynamic.scss`. Variant registry and the `.at-btn` contract: `README.md`.
- Verifiers: `scripts/check-*.js`, run by `npm run verify`.

**The prefixes are literals.** `.at` and `--at` are written literally in every source and are not held in variables, in the framework or in any consumer. A variable for them can only invite a value that matches nothing — dead CSS that compiles clean. `$appPrefix`, `$varPrefix`, `$grid-prefix` and `$grid-col-prefix` are removed; nothing may reintroduce them.

## Shared rules

One line each. What a *consumer* must do is stated once in the skill; what is left here is what this repository enforces.

| Rule | Stated for consumers in | Enforced here by |
| --- | --- | --- |
| **Global First, Local Second** — base layer underneath, local overrides explicit | `references/patterns.md` § Global first, local second | the build ships no `:root`; the grid's three values carry direct `var()` fallbacks — `check:vars` |
| **Mobile-First** — larger viewports only via `min-width` | `references/patterns.md` § Mobile first | the infix set is fixed by § The token contract |
| **Clean Semantic Markup** — classes layer onto semantics, never replace them | `references/patterns.md` § Semantic HTML first | — |
| **Design Token Single Source** — one legend, one reference set, never forked | `references/classes.md` § Where the legend is | `check:names`, `check:vars` |
| **Shipped CSS is Importance-Free** — a consumer sheet overrides by order or specificity | `references/patterns.md` § Overriding, and `references/production.md` § Cascade layers | `check:important` fails an `!important` in any bundle or the template; `%%IMPORTANT%%` is the only sanctioned route |

## Core framework

### The token contract

- Every `.at-*` class token MUST equal its `--at-*` variable token (`check:names` fails otherwise) — e.g. `.at-wrd-spc` reads `--at-wrd-spc`.
- Legacy tokens survive only as a nested fallback: `var(--at-new, var(--at-old, initial))` (e.g. `--at-wrd-spc` with a `--at-wrd-spg` fallback).
- Every abbreviation used in any class or variable token MUST be added to `short-names.json` in the same change.
- Renames are **BREAKING**: explicit sign-off, the legacy nested fallback kept for ≥ 1 release, `README.md` updated in the same commit.

### Bundles

- One SCSS source, shared partials. Two shipped entries (`css/atomic.css`, `css-max/atomic-max.css`), each with four generated outputs (`.css`, `.min.css`, `-rtl.css`, `.min-rtl.css`). Generated output is never hand-authored.
- `atomic.css` MUST stay a strict subset of `atomic-max.css` (`check:parity`).
- Bundles differ **only** via a dedicated partial or a flag — never a fork. The legacy `grid_minimal`/`grid_max` forks were converged into flag-gated partials: `grid_base/_grid-framework.scss` (`$orders-and-offsets`) and `grid_base/_custom-grid-5ths.scss` (`$offsets`), both set `true` only by `grid-max.scss`. Do not create new forks.

### The template bundle

`atomic-css` provides a **CSS template**; WordPress, PHP or any dynamic script transforms it and saves the result as **its own** build CSS. The framework source never changes for a consumer's dynamic needs, and the template is transformed, never linked and never shipped as a finished stylesheet.

- Generated from the same shared partials as the shipped bundles (flag/dedicated partial — never a fork), and it is a replica of `css/atomic.css` (minimal): same selectors, same order, only values/placeholders differing. A change to `scss/grid.scss` is applied to `scss/grid-template.scss` in the same commit.
- Placeholders are the fixed `%%UPPER_SNAKE%%` form, declared once per concept, and documented in `README.md`: the five `%%…_BREAKPOINT%%` markers (written `%%…%%px` inside `min-width` queries) and `%%IMPORTANT%%` — appended to every declaration value, the only sanctioned selective-`!important` mechanism (the shipped bundles carry none).
- Placeholders never appear inside `var()` names or class names — values only.
- The template is excluded from `check:parity` but MUST pass `check:names`, `check:vars` and `npm run lint`; a consumer build still containing any `%%…%%` marker is invalid.
- No third shipped variant is ever added: importance and breakpoint specialization happen in the consumer's own saved build.

```css
/* Dynamic breakpoint */
@media (min-width: %%MOBILE_BREAKPOINT%%px) { }

/* Dynamic importance — after the value, before the semicolon, declarations only */
.classes-of-atomic-css { display: flex%%IMPORTANT%%; }
```

### Compiled layer order

Grid → Utilities → Properties, marked with `/*Grid*/` `/*Utilities*/` `/*Properties*/` section comments (no inner space). Reordering silently changes which rule wins: `.at-stky` sets `position: sticky` while `.at-col-*` sets `position: relative`, and sticky wins only because Properties comes later — an architecture defect, and `check:parity` verifies the order on the compiled output. The template preserves it so consumer transforms can anchor on it.

### Utility classes

- **One class, one property, one variable:** `.at-x { property: var(--at-x, initial); }`. No utility hardcodes a value.
- **Inert by default is the meaningful fallback.** `initial` expresses "Global First — the framework imposes nothing"; a utility that imposes styling without its variable set is a defect.
- **No new utility class without a real consumer** (the demo or a downstream system that generates against these names). No magic numbers — route values through variables.
- Breakpoint utilities use the fixed infix set `xs/sm/md/lg/xl/xxl`, `min-width` only (the template exposes the breakpoint values for consumers whose direction requires `max-width`).
- **Shipped bundles carry no `!important`.** Every utility is an ordinary declaration, so a consumer's own rules can override it by specificity or order. Enforced on the compiled output by `check:important`; importance is available only through `%%IMPORTANT%%`.

### Structural classes (framework-owned geometry)

A fixed set of Properties-layer classes whose geometry the framework owns, so overlays, block shapes, sticky columns and vertical layouts work without a consumer stylesheet: `.at-dropcap::first-letter`, `.at-svg-wrp`, `.at-ovl` (`-cl`/`-grd`), `.at-blk-shp`, `.at-shp` (`-t`/`-b`), `.at-bg-vid`, `.at-vid-bg`, `.at-has-abs-wrp`, `.at-abs-el`, `.at-stky`, `.at-vrt` (`-hdr`/`-conts`). Nothing else may be added without a rule change.

- **Plain CSS is mandatory.** Geometry is raw declarations; a structural class MUST NOT set a `--at-*` variable and read it back in the same rule.
- **`var()` is allowed only for consumer-configured values** (`.at-vrt`'s gap, `.at-ovl::after`'s transition) — never for the class's own fixed geometry, and the fallback is a real value, never `inherit`. `.at-svg-wrp svg` was the case that proved it and is now fixed geometry.
- **Seeded reads are allowed and MUST be commented** — every seed carries a `// Seeded read:` comment naming the consumer.
- **Element/media defaults (`img`, `video`, `audio`, map sizing) are consumer-global.** The framework ships no media-sizing identities.

### Identity classes are consumer-owned

- The framework ships **no component CSS**. Identity classes such as `.at-btn` are implemented by consumers; the rules that define them are in `references/patterns.md` § Components.
- **Variant registry** (documented in `README.md`): solid `at-btn-primary/-secondary/-success/-danger/-warning/-info/-light/-dark/-lnk`; outline `at-btn-outln(-<color>)`; `at-btn-icon`. Adding a variant name means updating the registry in the same change.
- **State tokens use a double dash:** `--at-primary--hover`, `--at-primary--active`. Always greppable, no other convention.
- **Seeded reads** are a deliberate, commented pattern in two forms: the framework's own (§ Structural classes), and a consumer's parent republishing a private value for a child it cannot class (`references/patterns.md` § Why the namespace is private).

### Reference variable set

- `demo/colormode-globalstyle/scss/variable.scss` MUST declare every `--at-*` the bundles read, and no orphans; enforced by `check:vars`. The grid's three structural values are direct use-site fallbacks, and the set declares them so a consumer can theme the grid.
- The set is not written out here: `variable.scss` **is** the set — a second listing would be a third copy to keep in step.

### RTL

`-rtl` variants are auto-generated by `rtl-css-plugin.js` (rtlcss), which flips physical declarations but **not values inside `var()`**. The consumer rule it forces — direction-neutral token names, and no `left`/`right` inside a value — is stated once in `references/setup.md` § RTL.

### dart-sass discipline

`@use` + namespaces only (no `@import`); no deprecated `if()` function syntax — use `@if/@else`; single source of truth per constant.

### Build discipline

- NEVER hand-edit `css/*.css`, `css-max/*.css`, `css-template/*.css` or demo compiled CSS. Edit `scss/**`, run `npm run build`, and commit the regenerated CSS **with** the source change in one commit.
- `npm run build` exits 0 with zero sass warnings and a green `verify`; `npm run lint` is clean — always, before committing.
- Never commit `dev` output over `build` output; never commit `tmp/`, `.playwright-cli/` or `css/backup*.css`.
- Version bumps: `npm version X.Y.Z --no-git-tag-version` plus the version in `README.md`'s WordPress example.

## Consumer simulation (demo/)

The demo is the reference consumer: a working instance of every consumer pattern, and the regression surface for the gates. The rules it obeys are `references/patterns.md`, which ships in the package — that whole file is the contract. What belongs to this repository:

- **One identity class per block** — a framework utility, a Core identity class, a Core variant class or a Consumer block class, never two owners.
- **The variant registry is `README.md` § Buttons**; adding a variant name updates it in the same change.
- **Demo HTML uses only classes present in the bundle it links**, and `index.html` links every page.
- The compiled demo CSS is regenerated by the build (§ Build discipline).

| Requirement | Check |
| --- | --- |
| `atomic.css` is a strict subset of `atomic-max.css`; layer order holds; every selector carries a class | `check:parity` |
| Every token in compiled CSS is in the one legend | `check:names` |
| Every bundle read is declared in the one reference set; no `:root` in the build; fallbacks are direct | `check:vars` |
| No `!important` in a shipped bundle or the template | `check:important` |
| Every page's assets and `.at-*` resolve; the dark arm reaches the text it themes | `check:demo` |
| The generated reference matches the compiled CSS; the docs name only classes that ship and keep the documentation standard | `check:docs` |
