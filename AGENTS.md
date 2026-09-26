# AGENTS.md — atomic-css

Operational notes for working in this repo.

**Architecture rules live in [ARCHITECTURE.md](ARCHITECTURE.md) — it is the
only source of truth for architecture rules.** Nothing in this file may
add, weaken, or duplicate a rule from ARCHITECTURE.md.

## 1. Project in one paragraph
SCSS → CSS atomic/utility framework (`.at-*` classes reading `--at-*` variables),
built with Webpack + dart-sass + postcss/autoprefixer + rtlcss. No JS runtime.
Compiled CSS is part of the repo and is the shipped artifact. Bundle layout and
the template artifact are defined in ARCHITECTURE.md (§ Bundles, § The template
bundle).

## 2. Commands
- `npm run build` — full build + cleanup + `verify` (parity + naming + variables + docs). ALWAYS green before committing.
- `npm run lint` — stylelint. ALWAYS green.
- `npm run verify` — `check:parity` (atomic.css ⊂ atomic-max.css, and Grid → Utilities → Properties layer order holds) + `check:names` (every used token documented in `short-names.json`) + `check:vars` (exact framework root globals, direct grid fallbacks, contextual gap chains, reference-set reconciliation, no alias tokens) + `check:important` (no `!important` in any shipped bundle or the template) + `check:docs` (generated reference is not stale; `USAGE.md`, `llms.txt` and `README.md` name no class that does not ship, except the reviewed allowlists in `scripts/generate-docs.js`; no prose example links two bundles).
- `npm run docs` — regenerate `docs/CLASS-REFERENCE.{md,json}` from the compiled CSS. Never hand-edit those two files.
- `npm run dev` — development build (source maps). Never commit `dev` output over `build` output.

## 3. Documentation map
- `llms.txt` — condensed rules for an AI agent *consuming* the classes.
- `USAGE.md` — task-oriented consumer guide.
- `docs/CLASS-REFERENCE.md` / `.json` — generated class, variable and token inventory.
- `README.md` — human-facing install, bundles, button contract, WordPress.
- ARCHITECTURE.md Part I is for changing the framework; Part II is the `demo/` consumer spec.


## 4. Process notes (non-architectural)
- Repo history is one-commit-per-change; commit messages mirror existing style (short, imperative).
- Autoprefixer targets `last 5 versions`.
- Never commit secrets. (See ARCHITECTURE.md § Build discipline for the gitignore list.)

