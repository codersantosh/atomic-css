# generated — build output, do not hand-edit

The `CLASS-REFERENCE.json` in this folder is **generated from the compiled
CSS**. Everything in it is derived — classes, variables, fallbacks,
breakpoints, the token legend — so none of it is authored by hand and none of
it should be edited here.

```bash
npm run docs        # regenerate it
npm run docs:check  # fail if it is stale, or if a doc invariant breaks
```

Editing it by hand is not just pointless, it is destructive: the next
`npm run docs` overwrites the change, and `docs:check` fails the build until
someone regenerates.

If a name is missing or wrong, the fix belongs in one of these, never here:

| Symptom | Fix in |
| --- | --- |
| The description is unclear | [`../references/classes.md`](../references/classes.md) or [`../SKILL.md`](../SKILL.md) |
| A class does not exist but should | the framework's SCSS source, then rebuild |
| An abbreviation is undocumented | the framework's legend, in its repo |
| A variable's fallback is wrong | the SCSS `var()` at the use site |
| A `2m3` ladder term is wrong | the reference generator's expected-term list |

The top row is the only one a consumer can act on alone — and the fix is in this
skill, not here. The rest are framework-repo side, listed for whoever regenerates
the file: this one travels inside the package, so a consumer has no way to reach
them, and nothing here should send them looking.

The rest of this skill folder is the opposite: hand-written, reviewed prose, and
[`../references/classes.md`](../references/classes.md) is the readable layer over
this data. The checker in `../scripts/` reads the JSON here as its source of
truth, which is why it must always match the compiled bundles.