# Master Migration Plan — atomic-css Architecture Adoption

**Status:** plan only — no source, build, or compiled-CSS changes have been made.
**Source of truth:** [ARCHITECTURE.md](ARCHITECTURE.md).

**Docs state (done):**
- `ARCHITECTURE.md` written and finalized (Standing section omitted per instruction).
- `AGENTS.md` reduced to operational notes; all architecture rules removed in its favor.
- `readme.md` received a targeted addition: the template bundle row and the
  "CSS template (dynamic consumers)" subsection, **marked "Planned — not yet
  available"** so user-facing docs never advertise a non-existent artifact.
- Review findings B1–B3 and NB1–NB5 addressed in docs; NB6 is a code cleanup
  scheduled below (Phase 3).

**Goal:** make the codebase comply with ARCHITECTURE.md without changing any
public class name, variable name, or selector (no breaking changes).

---

## Phase 0 — Baseline (verification only)
1. Run `npm run build && npm run lint`; record as the pre-migration baseline (expected green).
2. Snapshot: `css/atomic.css` selector list, `css-max/atomic-max.css` selector list,
   `check:parity` / `check:names` output.

## Phase 1 — Template bundle (`css-template`) *(Part I § The template bundle)*
1. Create `scss/grid-template.scss` replicating `scss/grid.scss` include-for-include
   (css-variable → grid-partials → grid_minimal/grid-framework → grid_minimal/custom-grid-5ths
   → flex → display → css-properties). NOT the max partial set.
2. Placeholder injection without forking — resolve the design first (reviewer concern):
   a dart-sass flag/mixin from a dedicated partial (e.g. `grid_base/_template-placeholders.scss`)
   that, in template mode, (a) emits `%%MOBILE_BREAKPOINT%%`-style tokens into `@media`
   params via the existing breakpoint mixins, and (b) appends `%%IMPORTANT%%` after values
   via a single output helper used only by the template entry. Shipped entries never
   include the partial.
3. Add webpack entry `css-template/atomic-template`; decide/verify whether the RTL plugin
   applies to it; exclude template variants from `check:parity` inputs.
4. Extend `scripts/check-names.js` to also scan `css-template/atomic-template.css`
   (placeholders live only in values, so token parsing is unaffected; assert no `%%`
   appears inside `var()` names or selectors).
5. Extend `.bin/build.js` cleanup list with `css-template`.
6. Flip the readme markers: remove the two "planned — not yet available" notes added
   during docs reconciliation.

**Acceptance:** `css-template/atomic-template.css` is a structural mirror of
`css/atomic.css` (same selectors/order; only breakpoint values + `%%IMPORTANT%%`
markers differ) · build + lint green · `check:names` covers the template ·
no `%%…%%` inside `var()` names or selectors.

## Phase 2 — Legacy fork convergence *(Part I § Bundles)*
1. Converge `grid_minimal/_grid-framework.scss` vs `grid_max/_grid-framework.scss`
   and `grid_minimal/custom-grid-5ths.scss` vs root `custom-grid-5ths.scss` into one
   shared partial each, order/offset gated behind a flag used only by max.
2. Acceptance criterion (reviewer NB2 — relaxed from byte-equivalence):
   **selector-and-declaration equivalence** — the parsed PostCSS rule set (selectors,
   declarations, media contexts) must be identical before/after; whitespace and
   comment placement may vary. Diff via a PostCSS normalization script or
   `check-parity`-style comparison.

## Phase 3 — Prefix hygiene cleanup (reviewer NB6) *(Part I § Two prefixes, one source)*
1. Replace hardcoded `var(--at-…)` literals in `scss/grid_mixin/_grid-mixin.scss`,
   `scss/grid_base/_variables.scss`, `scss/custom-grid-5ths.scss`,
   `scss/grid_minimal/custom-grid-5ths.scss`, and both `_grid-framework.scss` files
   with `#{css-variable.$varPrefix}` interpolation (or a re-exported constant).
2. Same acceptance criterion as Phase 2: parsed output must be identical (the
   interpolation must produce byte-identical values).

## Phase 4 — Reference-consumer demo conformance *(Part II)*
1. Audit `demo/colormode-globalstyle/scss/*` against the Part II checklist:
   zero-specificity layer order; every state/device block redeclares the variables it
   uses; no raw-property overrides where a `--at-*` variable + utility exists;
   meaningful fallbacks in base layers.
2. Prefix hygiene in the demo (reviewer NB5): the demo redeclares `$appPrefix` in
   `scss/variable.scss` and re-reads it in `css-properties.scss`. Keep the demo
   self-contained (it compiles independently of `scss/css-variable.scss`), but add a
   comment cross-referencing the framework prefix source and asserting the values match
   (`'.at'` / `'--at'`) — a drift check, not a merge.
3. Fix findings in demo SCSS only; rebuild; re-run parity/naming; smoke-test
   `color-mode.html` and `index.html` in a browser.

## Phase 5 — Reference variable set reconciliation *(Part I § Reference variable set)*
1. Diff: every `--at-*` read by the bundles must be declared in
   `demo/colormode-globalstyle/scss/variable.scss`, and no orphaned vars.
2. Add missing declarations / remove orphans in the same change; rebuild.

## Phase 6 — Docs sync (mostly done)
1. ✅ Template row + subsection in `readme.md` (added early, marked planned; unmarked in Phase 1.6).
2. Confirm the readme variant registry still matches ARCHITECTURE.md § Identity classes.
3. Confirm no other `*.md`/`*.txt` file carries architecture rules.

## Out of scope (explicitly deferred)
- ATRC-side changes (`/home/coder/atrc/**`) — including refreshing
  `.storybook/library/atomic-css` (which currently holds only the minimal bundle)
  and wiring the placeholder transform.
- Any rename of public classes/variables (breaking) — none planned.
- Consumer transform tooling (PHP/WordPress placeholder replacement) — consumer-side.

## Rollback
Each phase is one commit (compiled CSS committed with source, per Build discipline);
revert the phase commit if any verifier regresses.
