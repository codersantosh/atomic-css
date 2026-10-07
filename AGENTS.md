# Agent Operating Contract

SCSS to CSS atomic/utility framework: `.at-*` classes reading `--at-*` variables, built with Webpack, dart-sass, postcss/autoprefixer and rtlcss. No JavaScript runtime.

**Owner:** governance owner · **Authority:** workflow, safety, routing, evidence, review

## Authority and precedence

Highest first:

1. `AGENTS.md` (this file) — governance: workflow, ownership, evidence, review.
2. `ARCHITECTURE.md` — the framework's rules; where current code and these rules disagree, the rules win.
3. `README.md` — human onboarding and usage.
4. `skills/atomic-css/**` — the shipped consumer contract.

Nothing in this file may add, weaken, or duplicate a rule from `ARCHITECTURE.md`.

Conflict between files: stop and report. Do not create a competing plan or resolve by preference.

## Read first

1. `ARCHITECTURE.md` — the rules and the enforcement map
2. `skills/atomic-css/SKILL.md` — the consumer contract this package ships
3. `README.md` — the human entry point
4. Planning → the human prompt (plan owner)

## Documentation standard

These rules govern every document in this repository. Details live in the code.

1. **Filenames** — extensions are lowercase (`.md`, `.json`). Contract documents use an uppercase base name: `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `SKILL.md`. Generated files keep the name their generator writes. Every reference uses the exact filename.
2. **Header block** — one H1 (the title), a one-line purpose, then `**Owner:** … · **Authority:** …`.
3. **Headings** — sentence case, no manual section numbers, no trailing punctuation, never skip a heading level.
4. **Table of contents** — required when a document exceeds ~100 lines; placed directly after the header block; anchors must match headings. `SKILL.md` keeps skill-format navigation (frontmatter and cheat sheet) instead of a contents block.
5. **Single source of truth** — a rule lives in exactly one document; other documents carry at most a two-line summary plus a relative link to the owning document and section.
6. **Cross-references** — relative markdown links using the exact filename; citing a section that does not exist is a defect. Prose `§` pointers are allowed only where `checkSectionPointers` verifies them.
7. **Tables** — header row always; paths and identifiers in backticks; in-repo files as `[name](./path)` links.
8. **Code fences** — always language-tagged (`sh`, `bash`, `css`, `html`, `js`, `json`); folder trees stay in `sh` fences with one glyph style.
9. **Whitespace** — no trailing spaces; a single trailing newline; one blank line around headings, tables, and fences.
10. **Minimal** — documents stay to the point. Don't describe everything in the code — just the minimal summary if needed.

## Engineering standards

- **DRY** — reuse the shared partials and the existing gates; a fact lives in one place.
- **KISS** — the simplest correct change; no premature abstraction; delete dead code instead of fencing it behind a flag.
- **SOLID** — applied through the structure `ARCHITECTURE.md` fixes; never a reason to add a layer, interface or abstraction with a single implementation (KISS wins).
- **Consistency** — follow existing conventions; add a new pattern only when clearly required.
- **Verifiability** — a new rule ships with the gate that can fail it; doc gates get a fault-injection case in `check-doc-checks.js`.
- **No backward compatibility** — no dead code, shims, aliases or duplicate logic; changes are permanent. The one exception, a rename, is governed by [ARCHITECTURE.md § The token contract](./ARCHITECTURE.md#the-token-contract).

## Commands

- `npm run build` — full build, cleanup, then `verify` (parity, naming, variables, importance, demo, docs). ALWAYS green before committing.
- `npm run lint` — stylelint. ALWAYS green.
- `npm run verify` — `check:parity` (atomic.css ⊂ atomic-max.css; the Grid → Utilities → Properties layer order holds) + `check:names` (every used token is in `short-names.json`) + `check:vars` (exact root globals, direct grid fallbacks, contextual gap chains, reference-set reconciliation, no alias tokens) + `check:important` (no `!important` in any shipped bundle or the template) + `check:demo` (every demo page's assets and `.at-*` resolve) + `check:docs` (the generated reference is fresh; hand-written docs name only classes that ship, and the doc-format gates hold).
- `npm run docs` — regenerate `skills/atomic-css/generated/CLASS-REFERENCE.json` from the compiled CSS. Never hand-edit that file.
- `node scripts/check-doc-checks.js` — fault-inject the doc gates; not part of `verify`, run after changing a doc check.
- `npm run dev` — development build (source maps). Never commit `dev` output over `build` output.

## Ownership

| Path | Owner | Concern |
|---|---|---|
| `AGENTS.md` | governance owner | workflow, safety, routing, evidence, review |
| `ARCHITECTURE.md` | architecture owner | framework rules, the enforcement map |
| `README.md` | developer/user documentation owner | human onboarding, bundles, the variant registry |
| `skills/atomic-css/**` | AI reference owner | the shipped consumer contract |
| `skills/atomic-css/generated/**` | generated | class, variable and token inventory — never hand-edited |
| `demo/**` | reference-consumer owner | the consumer simulation every pattern is demonstrated in |
| `scss/**`, `css*/**` | build | source and compiled artifacts; regenerate, never hand-edit |
| `scripts/**`, `.bin/**` | build | gates and build steps; doc gates are fault-injected by `check-doc-checks.js` |

## Process notes

- Repo history is one-commit-per-change; commit messages mirror existing style (short, imperative).
- Autoprefixer targets `last 5 versions`.
- Never commit secrets. (See ARCHITECTURE.md § Build discipline for the gitignore list.)
- Version bumps keep `package.json` and the WordPress example in `README.md` in step.
