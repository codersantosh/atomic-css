# generated — build output, do not hand-edit

The `CLASS-REFERENCE.md` and `CLASS-REFERENCE.json` in this folder are
**generated from the compiled CSS**. Everything in them is derived — classes,
variables, fallbacks, breakpoints, the token legend — so none of it is authored
by hand and none of it should be edited here.

```bash
npm run docs        # regenerate both files
npm run docs:check  # fail if either is stale, or if a doc invariant breaks
```

Editing them by hand is not just pointless, it is destructive: the next
`npm run docs` overwrites the change, and `docs:check` fails the build until
someone regenerates.

If a name is missing or wrong, the fix belongs in one of these, never here:

| Symptom | Fix in |
| --- | --- |
| A class does not exist but should | the framework's SCSS source, then rebuild |
| An abbreviation is undocumented | the `short-names.json` legend |
| A variable's fallback is wrong | the SCSS `var()` at the use site |
| The description is unclear | [`../references/classes.md`](../references/classes.md) or [`../SKILL.md`](../SKILL.md) |
| A `2m3` ladder term is wrong | the reference generator's expected-term list |

Two of those are framework-internal and have no path here on purpose: this file
ships inside the package, so a consumer holding it cannot act on them. They are
listed for whoever generated the file in a checkout of the repository.

The rest of this skill folder is the opposite: hand-written, reviewed prose. The
checker in `../scripts/` reads the JSON in this folder as its source of truth,
which is why it must always match the compiled bundles.