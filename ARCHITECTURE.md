# Atomic CSS Architecture — Rules

*Where current code and these rules disagree, the rules win.*

---

## Scope

**Core Framework**
- `/home/coder/atomic-css/scss/*`
- `/home/coder/atomic-css/css/*`, `/home/coder/atomic-css/css-max/*`, `/home/coder/atomic-css/css-template/*` (build artifact; template is the dynamic-consumer source)
- `/home/coder/atomic-css/scripts/*`, `webpack.config.js`, `rtl-css-plugin.js`, `.bin/*`
- `/home/coder/atomic-css/short-names.json`, `readme.md`

**Consumer Simulation (reference consumer)**
- `/home/coder/atomic-css/demo/**` — the demo plays the role that ATRC's dynamic design system plays downstream. Every pattern a consumer (including ATRC) is expected to follow must be demonstrated here first.

**Key paths**
- Prefix source of truth: `scss/css-variable.scss`
- Grid class prefix source: `scss/grid_base/_variables.scss`
- Bundle entries: `scss/grid.scss` (minimal), `scss/grid-max.scss` (max), `scss/grid-template.scss` (template — replica of the minimal bundle)
- Shared partials: `scss/grid_base/`; mixins: `scss/grid_mixin/`
- Naming legend: `short-names.json`
- Reference variable set (consumer token source): `demo/colormode-globalstyle/scss/variable.scss`
- Consumer base theme (global semantic tag design): `demo/colormode-globalstyle/scss/dynamic.scss`
- Consumer identity/variant reference pattern: `demo/colormode-globalstyle/scss/css-properties.scss` and `readme.md` (`.at-btn` contract)
- Verifiers: `scripts/check-parity.js`, `scripts/check-names.js`

**Two prefixes, one source.** `$appPrefix` (`.at`) is the **class-name prefix**; `$varPrefix` (`--at`) is the **custom-property prefix**. They are two different constants sourced from the same shared module (`scss/css-variable.scss`), never varied by bundle, breakpoint, or context within the framework (`scss/**`). The demo reference set redeclares the same constant values in its own compilation (Part II); its values MUST always match. Grid prefixes `$grid-prefix`/`$grid-col-prefix` exist only in `scss/grid_base/_variables.scss` (the two "at" declarations kept in sync).

**Downstream contract.** ATRC (`/home/coder/atrc/`) copies the minimal bundle (`css/` with its min/RTL variants) into `/home/coder/atrc/.storybook/library/atomic-css` and generates all of its consumer CSS against this project's class and variable names. WordPress/PHP and other dynamic consumers transform `css-template` into their own build. Any rename here is breaking for both.

---

## Shared Rules — Both Systems

1. **Global First, Local Second** — base styling comes from the design system; local overrides are explicit and scoped. The framework ships only structural `:root` values (`--at-ctnr`, `--at-ctnr-min`, `--at-gtr`) — repeated as direct `var()` fallbacks at the grid's use sites so the grid stays functional if a consumer strips or replaces the framework `:root` — and otherwise inert-by-default utilities; every actual value is supplied locally by a consumer setting a `--at-*` variable.
2. **Mobile-First** — base rules target mobile; larger viewports are reached only via `min-width`.
3. **Clean Semantic Markup** — use native semantic HTML; utility classes layer onto semantics, never replace it. Zero div soup.
4. **Design Token Single Source of Truth** — exactly one legend (`short-names.json`) and one reference variable set (`demo/colormode-globalstyle/scss/variable.scss`). Never fork or alias either. Never merge the Core framework's structural tokens with the consumer's token root.

---

## Part I — Core Framework

### The token contract
- Every `.at-*` class token MUST equal its `--at-*` variable token (`check:names` fails otherwise — e.g. `.at-wrd-spc` reads `--at-wrd-spc`).
- Legacy tokens survive only as a nested fallback: `var(--at-new, var(--at-old, initial))` (e.g. `--at-wrd-spc` with `--at-wrd-spg` fallback).
- Every abbreviation used in any class or variable token MUST be added to `short-names.json` in the same change.
- Renames are **BREAKING**: require explicit sign-off, keep the legacy nested fallback for ≥ 1 release, and update `readme.md` in the same commit.

### Bundles: exactly two shipped, one template
- One SCSS source, shared partials. Two shipped entries (`css/atomic.css`, `css-max/atomic-max.css`), each with four generated outputs (`.css`, `.min.css`, `-rtl.css`, `.min-rtl.css`). Generated output is never hand-authored or hand-edited.
- `atomic.css` MUST stay a strict subset of `atomic-max.css` (`check:parity`).
- Bundles differ **only** via a dedicated partial included by one entry (e.g. `grid_base/_print-display.scss` — max only) or a flag. NEVER fork a shared partial per bundle. The legacy `grid_minimal`/`grid_max` forks were converged into shared flag-gated partials: `grid_base/_grid-framework.scss` (`$orders-and-offsets`, set `true` only by `grid-max.scss`) and `grid_base/_custom-grid-5ths.scss` (`$offsets`, set `true` only by `grid-max.scss`). Do not create new forks.

### The template bundle (`css-template`) — dynamic-consumer source
**Philosophy:** `atomic-css` provides a **CSS template**; WordPress, PHP, or any dynamic script language modifies the template and saves the result as **their own** build CSS. The framework source never needs to change for a consumer's dynamic needs. The template is a build artifact to be transformed, never linked as-is and never shipped as a finished stylesheet.

- A third entry (`scss/grid-template.scss` → `css-template/atomic-template.css`) is generated from the **same shared partials** as the shipped bundles (flag/dedicated partial — never a fork).
- **`css-template` is a replica of `css/atomic.css` (the minimal bundle), not `css-max`.** It includes exactly what `scss/grid.scss` includes — same partial set, same exclusions (no `grid_base/_print-display.scss`, no order/offset generation). The dynamic consumer starts from the minimal surface and opts into more by composing with the other bundles; the template never silently grows to max.
  - Corollary: `css-template` MUST stay a structural mirror of `css/atomic.css` — same selectors, same order, only values/placeholders differing. A change to `scss/grid.scss` is applied to `scss/grid-template.scss` in the same commit.
- Placeholders are the template's only dynamic points. They use the fixed `%%UPPER_SNAKE%%` form, are declared once per concept, and every one is documented in `readme.md`:
  - `%%MOBILE_BREAKPOINT%%` (sm), `%%TABLET_BREAKPOINT%%` (md), `%%DESKTOP_BREAKPOINT%%` (lg), `%%LARGE_DESKTOP_BREAKPOINT%%` (xl), `%%EXTRA_LARGE_DESKTOP_BREAKPOINT%%` (xxl) — breakpoint pixel values written `%%…%%px` in the `min-width` queries, so a dynamic consumer can regenerate all responsive infixes at its own values.
  - `%%IMPORTANT%%` — appended to **every** declaration value (after the value, before the `;`, no leading space; custom-property declarations included), replacing the shipped bundles' built-in `!important`, so a dynamic consumer can turn any declaration into its `!important` build. **This is the only sanctioned selective-`!important` mechanism**: a consumer that needs the force build replaces every occurrence with ` !important` (the whole build becomes important — mirroring ATRC's dual build: normal CSS vs `!important` CSS, never a partial mix); a consumer that needs the normal build removes every occurrence, yielding an importance-free build (the shipped flex/display/map/sticky forcing exists in the template only as this marker).

Example — dynamic breakpoint:

```css
/* Dynamic Breakpoint Placeholder (the template mirrors the mobile-first
   minimal bundle, so its queries are min-width) */
@media (min-width: %%MOBILE_BREAKPOINT%%px) {

}
```

Example — dynamic importance:

```css
.classes-of-atomic-css {
    display: flex%%IMPORTANT%%;
}
```

```css
.at-col-cust {
    max-width: var(--at-cust-w)%%IMPORTANT%%;
}
```

- Template rules:
  - Placeholders never appear inside `var()` names or class names — they only replace **values** (breakpoints, importance). Names stay stable so `check:names` keeps working.
  - The template is excluded from `check:parity` (it is not a shipped bundle) but MUST pass `check:names` and `npm run lint`.
  - A consumer transform MUST replace every placeholder; a build that still contains `%%…%%` is invalid.
  - No third shipped variant is ever added: the framework ships normal + max + template sources; importance/breakpoint specialization happens in the consumer's own saved build, not here.
  - `%%IMPORTANT%%` placement is fixed: after the value, before the semicolon, on declarations only — never on selectors or at-rules.

### Compiled layer order (fixed)
Variables (`:root`) → Grid → Utilities → Properties, marked with `/*Grid*/` `/*Utilities*/` `/*Properties*/` section comments (no inner space). The `/*Variables*/` marker is intentionally absent (dart-sass re-emits a comment above `@use` wherever that module is re-used). Reordering these layers silently changes which rule wins — it is an architecture defect. The template bundle preserves the same order as `css/atomic.css` so consumer transforms can anchor on it.

### Utility classes
- **One class, one property, one variable:** `.at-x { property: var(--at-x, initial); }`. No utility hardcodes a value.
- **Inert by default is the meaningful fallback.** For a utility, `initial` expresses "Global First — the framework imposes nothing." A utility that imposes styling without its variable being set is a defect.
- **No new utility class without a real consumer** (demo or ATRC). No magic numbers — route values through variables.
- Breakpoint utilities use the fixed infix set `xs/sm/md/lg/xl/xxl`, `min-width` only (the template exposes the breakpoint values for consumers whose direction requires `max-width`).
- **`!important` in shipped bundles is limited to:** the flex, display, and print-display utility groups, plus the sticky (`.at-stky`) block in the Properties layer (deliberate: these must beat variable-driven base styles and consumer base rules). No new `!important` may be added beyond these groups; new importance needs exist only via `%%IMPORTANT%%` in the template (the template carries the marker in place of these flags — see § The template bundle).

### Structural classes (framework-owned geometry)
A small fixed set of **Properties-layer** classes is **structural**: the framework owns their geometry so compositions (overlays, block shapes, sticky columns, vertical layouts) work without a consumer stylesheet.

- Fixed set — nothing else may be added without a rule change: `.at-dropcap::first-letter`, `.at-svg-wrp`, `.at-ovl` (`-cl`/`-grd`), `.at-blk-shp`, `.at-shp` (`-t`/`-b`), `.at-bg-vid`, `.at-vid-bg`, `.at-has-abs-wrp`, `.at-abs-el`, `.at-stky`, `.at-vrt` (`-hdr`/`-conts`).
- **Plain CSS is mandatory.** Geometry is written as raw declarations (`position: absolute`, `z-index: -1`, `line-height: 0`, …). A structural class MUST NOT set a `--at-*` variable and read it back in the same rule (self-set-then-read).
- **`var()` is allowed only for consumer-configured values** — a property whose value a consumer is expected to set (e.g. `.at-svg-wrp svg { width: var(--at-w, inherit) }`, `.at-vrt { gap: var(--at-vrt-gap, var(--at-gap, 15px)) }`, `.at-ovl::after`'s `transition`), never for the class's own fixed geometry.
- **Seeded reads are allowed and MUST be commented.** A structural class may seed a `--at-*` value consumed by a co-applied utility on the same or a child element (e.g. `.at-shp` seeds `--at-pos`/`--at-w`/`--at-l`/`--at-z-idx` for co-applied `.at-pos`/`.at-w`/`.at-z-idx`). Every seed carries a `// Seeded read:` comment naming the consumer; uncommented seeds are defects.
- **Element/media defaults (`img`, `video`, `audio`, map sizing) are consumer-global.** The framework ships no media-sizing identities; consumers declare those defaults once in their own global CSS (zero-specificity element rules — see Part II § General rules).

### Identity classes are consumer-owned
- The framework ships **no component CSS**. Identity classes such as `.at-btn` are implemented by consumers (the rules in Part II § Identity classes define how).
- **Variant registry** (documented in `readme.md`): solid group `at-btn-primary/-secondary/-success/-danger/-warning/-info/-light/-dark/-lnk`; outline group `at-btn-outln(-<color>)`; `at-btn-icon`. Adding a variant name means updating the registry in the same change.
- **State tokens use a double dash:** `--at-primary--hover`, `--at-primary--active`. No other convention, so state tokens are always greppable.
- **Seeded reads** are a deliberate, commented pattern (see Part II).

### Reference variable set
- `demo/colormode-globalstyle/scss/variable.scss` MUST declare every `--at-*` the bundles read (and no orphaned vars), mirroring the prefix constants from `scss/css-variable.scss`. It is the one token source the demo and downstream dynamic systems reconcile against.
- The core build's `:root` declares only `--at-ctnr`, `--at-ctnr-min`, `--at-gtr`; the grid rules repeat the same defaults as direct fallbacks (`var(--at-ctnr, 1140px)`, `var(--at-ctnr-min, 1100px)`, `var(--at-gtr, 15px)`).
- Present tokens (what a consumer's `:root` must look like) — palette tokens with state variants, structural tokens, and inert utility tokens:

```scss
:root {
    // Structural (mirrored from scss/css-variable.scss)
    #{$varPrefix}-ctnr: 1140px;
    #{$varPrefix}-ctnr-min: 1100px;
    #{$varPrefix}-gtr: 15px;

    // Base palette + state tokens (double dash for states)
    #{$varPrefix}-white: #fff;
    #{$varPrefix}-black: #000;

    #{$varPrefix}-base-color: #2e312f;
    #{$varPrefix}-body-color: #9da29f;

    #{$varPrefix}-primary: #48b44f;
    #{$varPrefix}-primary--hover: #3ea245;

    #{$varPrefix}-secondary: #d4e6d9;
    #{$varPrefix}-secondary--hover: #b1cfb8;

    #{$varPrefix}-success: #46b450;
    #{$varPrefix}-success--hover: #1e7e34;

    #{$varPrefix}-danger: #dc3232;
    #{$varPrefix}-danger--hover: #c82333;

    // … warning, info, light, dark, quaternary — same pattern

    // Utility tokens (inert defaults — Global First, Local Second)
    #{$varPrefix}-cl: initial;
    #{$varPrefix}-bg-cl: initial;
    #{$varPrefix}-bdr-w: initial;
    #{$varPrefix}-bdr-sty: initial;
    #{$varPrefix}-bdr-cl: initial;
    #{$varPrefix}-fnt-sz: initial;
    // … every --at-* the bundles read is declared here, nothing orphaned
}
```

### RTL
- `-rtl` variants are auto-generated by `rtl-css-plugin.js` (rtlcss). rtlcss flips physical declarations but **not values inside `var()`** — so any directional value must live behind a variable, and variables carrying direction-sensitive values must be authored direction-aware by the consumer. Variable names stay direction-neutral where the concept allows.

### dart-sass discipline
- `@use` + namespaces only (no `@import`); no deprecated `if()` function syntax — use `@if/@else`; single source of truth per constant.

### Build discipline
- NEVER hand-edit `css/*.css`, `css-max/*.css`, `css-template/*.css`, or demo compiled CSS. Edit `scss/**` and run `npm run build`; commit regenerated CSS **with** the source change in a single commit.
- `npm run build` must exit 0 with zero sass warnings and green `verify` (parity + naming); `npm run lint` must be clean — always, before committing.
- Never commit `dev` output over `build` output; never commit `tmp/`, `.playwright-cli/`, or `css/backup*.css`.
- Version bumps: `npm version X.Y.Z --no-git-tag-version` + sync the version param in `readme.md` (WordPress example).

---

## Part II — Consumer Simulation (demo/)

The demo is the reference consumer and the regression surface for ATRC's dynamic system. It obeys the same shared rules and demonstrates, in working code, every pattern consumers must follow.

### Layers and ordering
- **Global semantic tag design** lives in the consumer base theme (`demo/colormode-globalstyle/scss/dynamic.scss`) with **zero-specificity selectors**: `:where(body)`, `:where(h1)`, `:where(nav li)`, etc. Zero specificity is what lets any utility class or local override win without `!important`.
- **Zero-specificity layer order is fixed and documented.** Files and blocks are arranged so that, in source order:
  1. Element resets
  2. Semantic tag defaults
  3. Identity defaults (`at-btn`, `at-aud`, …)
  4. Base variant shape (e.g. outline group)
  5. Color variants (e.g. `at-btn-primary`)
  6. State variants (hover, focus, active)

  Active/pressed state is always last so it wins ties. Reordering these layers is an architecture defect — it silently changes which variant wins.

### Device and state rules
a) **Introduce CSS variables based on semantic tags.** The base layer reads consumer tokens through `--at-*` variables with meaningful fallbacks:

```scss
:where(body) {
  font-family: var(--at-body-fnt-fam, var(--token-font-family));
  font-size: var(--at-body-fnt-sz, var(--token-font-size));
  font-weight: var(--at-body-fnt-wt, var(--token-font-weight));
  line-height: var(--at-body-ln-h, var(--token-line-height));
  color: var(--at-body-cl, var(--token-color));
  background-color: var(--at-body-bg-cl, transparent);
}
```

b) **Change CSS properties via CSS variables in media queries and state selectors, including color mode.** The override layer never touches raw properties — it redefines variables:

```scss
@media (min-width: 1600px) {
  :root {
    --at-body-fnt-sz: 15px;
  }
}

:where(body:hover) {
  --at-body-fnt-sz: 16px;
}

:where([data-at-theme="dark"]) {
  --at-body-cl: var(--at-white);
  --at-body-bg-cl: var(--at-black);
}
```

- Every new `--at-*` segment introduced by the consumer layer MUST already exist in `short-names.json` — check the legend before adding any new segment; extend it in the same change if a segment is genuinely new.
- Every state/device block that uses a variable **re-declares it in that block** — no carrying values forward.

### Identity classes
- **Global component/control design uses unique identity classes**, e.g. `.at-aud`, `.at-ctrl-aud`, `.at-btn`. In the demo, each block owns exactly one identity class; in ATRC, components and controls already own unique classes defined in their source.
- **Identity classes are element-specific.** They set the shape of *one* element type (padding, cursor, line-height, border defaults) and are not meant to be reused across element types. If two element types share a color scheme, that is a variant's job, not an identity's.
- Identity classes read variables with meaningful fallbacks — `transparent` and `currentColor`/`inherit` are preferred over `initial` where they express intent; a missing fallback in a base-layer rule is a defect.

Example — identity:

```scss
:where(.at-btn) {
  --at-cl: var(--at-btn-cl, inherit); // Seeded read: icon fill for nested .at-svg
  color: var(--at-btn-cl, inherit);
  background-color: var(--at-btn-bg-cl, transparent);
  font-size: var(--at-btn-fnt-sz, 14px);
  border-color: var(--at-btn-bdr-cl, transparent);
  border-width: var(--at-btn-bdr-w, 0);
  border-style: var(--at-btn-bdr-sty, solid);
  padding: var(--at-btn-p, 6px 12px);
  line-height: var(--at-btn-ln-h, normal);
}

/* Cursor belongs to the element, not the identity class —
   variants can be applied to non-interactive elements like badges. */
:where(button, a[href], [role="button"]) {
  cursor: pointer;
}
```

### Reusable variant classes
- **Global CSS generates variant classes**, because the same variant class can be applied to a button, an anchor, a badge, etc. A block never redefines a variant class; it only emits the variant class name and any scoped custom-property values it needs.
- **Variants only set variables. Identity classes provide the shape.** A variant never sets `padding`, `cursor`, or `line-height`; those belong to the identity class or the base element.
- **Shape vs. color split:** variants are grouped (outline group, color group, size group). A variant name like `at-btn-outln-primary` belongs to both the outline group and the primary color group. Every variant class name is listed in a written registry inside the stylesheet, grouped by which sets it belongs to. Adding a new variant means updating the registry in the same change.

Example — shared variant shape (outline group):

```scss
:where(
  .at-btn-outln,
  .at-btn-outln-primary,
  .at-btn-outln-secondary,
  .at-btn-outln-success,
  .at-btn-outln-danger,
  .at-btn-outln-warning,
  .at-btn-outln-info
) {
  --at-btn-bdr-w: 1px;
  --at-btn-bdr-sty: solid;
  --at-bdr-w: 1px;
  --at-bdr-sty: solid;
}
```

Example — color variant and its state:

```scss
:where(.at-btn-primary) {
  --at-btn-cl: var(--at-white);
  --at-btn-bg-cl: var(--at-primary);
  --at-btn-bdr-cl: var(--at-primary);
}

:where(.at-btn-primary):hover {
  --at-btn-bg-cl: var(--at-primary--hover);
  --at-btn-bdr-cl: var(--at-primary--hover);
}
```

**State-token naming:** a state variant of a token uses a double dash: `--at-primary--hover`, `--at-primary--active`. No other convention is permitted, so state tokens are always greppable.

**Seeded reads:** when an identity class reads a variable and republishes it under a shared name for nested children (e.g. `--at-btn-cl` read into `--at-cl` for a nested `.at-svg`), that is a deliberate pattern called a **seeded read**. Seeded reads are named in a comment so they are not mistaken for arbitrary duplication.

### Overrides
- **Inner components/blocks override only** by adding classes and setting `--at-*` custom properties — consumed by `atomic-css` utility classes from the bundle. Consumers never write raw property CSS where a utility + variable exists, and never reimplement an `atomic-css` utility.
- **Exception:** external components such as WordPress or third-party libraries may need raw CSS and `!important` to override. Keep it scoped, commented, and minimal.
- **`!important` is limited to:**
  1. Cases where adding classes and customizing via CSS variables cannot win because the utility groups themselves use `!important` (see § Utility classes for the exhaustive group list) — the consumer takes the `%%IMPORTANT%%` transform of the template instead.
  2. External-boundary isolation.
  3. Registered force-reset utilities.

  Consumer-to-consumer conflicts are architecture defects — fix them at the source, never with `!important`.

### Per-block output
- Per-block CSS emits **scoped custom-property values only**, consumed by `at-*` utilities.
- A generated block class must **redeclare every custom property it uses in every state/device block** — do not carry values forward.
- **One class, one owner:** a class is either a Core identity class, an `atomic-css` utility, a Core variant class, or a Consumer block class — never two owners.
- **Demo HTML only uses classes present in the bundle it links** (`index.html` links `css-max/atomic-max.css`).

### Reference-consumer checklist (mirrors ATRC's generator checklist)
- [ ] Every variable read has a meaningful fallback (`initial` for utilities; `transparent`/`currentColor`/`inherit` where intent says so in base layers).
- [ ] Every state/device block that uses a variable re-declares it in that block.
- [ ] Class tokens are drawn from `short-names.json`; nothing invented ad hoc (enforced by `check:names` for the bundles, the template, and the demo's compiled CSS).
- [ ] Class prefix is `$appPrefix` and property prefix is `$varPrefix` — never mixed, never redefined.
- [ ] No static or hardcoded values where a `--at-*` variable exists.
- [ ] Zero-specificity layer order respected; active/pressed state last.
- [ ] Variant names drawn from the registry; nothing new invented per block.

### General rules
- Do not declare new root custom properties outside the reference variable set. Check `short-names.json` before adding any new segment.
- Element resets stay zero-specificity. Do not promote them to class rules. One owner per element type.
- **Element/media defaults (`img`, `video`, `audio`, map sizing) are consumer-global.** The framework ships no `.at-img`/`.at-vid`/`.at-aud`/`.at-map` identities. The reference consumer declares them once as zero-specificity element rules (`:where(img)`, `:where(video)`, `:where(audio)`, map sizing) — never as reusable utility classes.
- **Every variable read has a meaningful fallback.** `transparent` and `currentColor` are preferred over `initial` where they express intent; a missing fallback in a base-layer rule is a defect.
- **RTL:** any directional property in a consumer rule or variant goes through a variable with a direction-neutral name (no `-left` / `-right` in the variable name), so the `atomic-css` RTL build can remap it.
