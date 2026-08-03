# AGENTS.md — atomic-css

Industrial rules for working in this repo. Every "MUST" below is verifiable
(enforced by a script or a diff). Ask before deviating.

## 1. Project in one paragraph
SCSS → CSS atomic/utility framework (`.at-*` classes reading `--at-*` variables),
built with Webpack + dart-sass + postcss/autoprefixer + rtlcss. No JS runtime.
Two committed bundles: `css/atomic.css` (minimal) and `css-max/atomic-max.css`
(strict superset). Compiled CSS is part of the repo and is the shipped artifact.

## 2. Commands
- `npm run build` — full build + cleanup + `verify` (parity + naming). ALWAYS green before committing.
- `npm run lint` — stylelint. ALWAYS green.
- `npm run verify` — `check:parity` (atomic.css ⊂ atomic-max.css) + `check:names` (every used token documented in `short-names.json`).
- `npm run dev` — development build (source maps). Never commit `dev` output over `build` output.

## 3. Enforceable rules
1. NEVER hand-edit `css/*.css`, `css-max/*.css`, or demo compiled CSS. Edit `scss/**` and run `npm run build`. Commit regenerated CSS WITH the source change (single commit).
2. Every `.at-*` class token MUST equal its `--at-*` variable token (`check:names` fails otherwise — e.g. `.at-wrd-spc` reads `--at-wrd-spc`; legacy tokens only via nested fallback `var(--at-new, var(--at-old, initial))`).
3. Every abbreviation used in CSS MUST be added to `short-names.json` in the same change.
4. `atomic.css` MUST stay a strict subset of `atomic-max.css` (`check:parity`).
5. Single source of truth:
   - `$appPrefix`/`$varPrefix` exist ONLY in `scss/css-variable.scss`; all other files reference them via `@use "css-variable"` + namespace.
   - `$grid-prefix`/`$grid-col-prefix` exist ONLY in `scss/grid_base/_variables.scss` (keep the two "at" declarations in sync).
   - The reference variable set `demo/colormode-globalstyle/scss/variable.scss` MUST declare every `--at-*` the framework consumes (and no orphaned vars).
6. DRY: shared partials live in `scss/grid_base/`. NEVER fork a copy per bundle (`grid_minimal`/`grid_max`); if bundles must differ, use a dedicated partial (like `_print-display.scss`) or a flag.
7. dart-sass: use `@use` + namespaces only (no `@import`); no deprecated `if()` function syntax — use `@if/@else`.
8. Public API: `.at-*` classes and `--at-*` variables are consumed by third-party WordPress themes. Renames are BREAKING: require explicit sign-off, keep a legacy fallback for ≥1 release, and update README.
9. KISS: prefer plain `var(--at-x, initial)`; additive changes over renames; no new utility class without a real consumer; no magic numbers — route through variables.
10. Demo HTML MUST only use classes present in the bundle it links (index.html links `css-max/atomic-max.css`).
11. Never commit `tmp/`, `.playwright-cli/`, or `css/backup*.css` (gitignored); never commit secrets.
12. Version bumps: `npm version X.Y.Z --no-git-tag-version` + sync the version param in `readme.md` (WordPress example) + package-lock is auto-updated.

## 4. Current guidance (verified, do not "fix")
- Compiled section order: Variables (`:root`) → Grid → Utilities → Properties. Section comments in entries use `/*X*/` style (no inner space).
- dart-sass quirk: a comment directly above a `@use` is re-emitted wherever that module is later re-used (e.g. `css-properties.scss` re-uses `css-variable`). Therefore the `/*Variables*/` marker is intentionally absent from entries.
- Autoprefixer `last 5 versions`; `!important` is deliberate in flex/display utilities.
- Repo history is one-commit-per-change; commit messages mirror existing style (short, imperative).

## 5. Definition of done
- [ ] `npm run build` exit 0, zero sass warnings
- [ ] `npm run lint` clean
- [ ] Compiled CSS regenerated and committed with source
- [ ] `short-names.json` + `check:names` green for any new token
- [ ] README updated when public surface (classes/vars/files) changes
- [ ] Demo-affecting changes smoke-tested in a browser
