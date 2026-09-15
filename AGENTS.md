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
- `npm run build` — full build + cleanup + `verify` (parity + naming). ALWAYS green before committing.
- `npm run lint` — stylelint. ALWAYS green.
- `npm run verify` — `check:parity` (atomic.css ⊂ atomic-max.css) + `check:names` (every used token documented in `short-names.json`).
- `npm run dev` — development build (source maps). Never commit `dev` output over `build` output.

## 3. Process notes (non-architectural)
- Repo history is one-commit-per-change; commit messages mirror existing style (short, imperative).
- Autoprefixer targets `last 5 versions`.
- Never commit secrets. (See ARCHITECTURE.md § Build discipline for the gitignore list.)

