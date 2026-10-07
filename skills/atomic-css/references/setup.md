# Setup and integration

Getting the **stylesheet** onto the page — separate from installing the skill itself (see `SKILL.md`). Look a name up in [`CLASS-REFERENCE.json`](../generated/CLASS-REFERENCE.json), which travels with this skill, before trusting a class.

**Owner:** AI reference owner · **Authority:** the consumer contract for the atomic-css 2.0 bundles.

## Contents

- [Install](#install)
- [What you get](#what-you-get)
- [Load order is load-bearing](#load-order-is-load-bearing)
- [RTL](#rtl)
- [Confirming it is wired up](#confirming-it-is-wired-up)
- [WordPress / PHP and any runtime-generated build](#wordpress-php-and-any-runtime-generated-build)
- [Enqueue (WordPress)](#enqueue-wordpress)

The commands below assume the framework package is installed; a vendored copy of `atomic.css` works just as well.

## Install

```bash
# reproducible — the only immutable ref, because the repo has no git tag
npm install github:codersantosh/atomic-css#c51609b

# convenience only: `2.0.0` is a moving branch, not a version
npm install github:codersantosh/atomic-css#2.0.0
```

Do **not** use `npm install atomic-css` — that registry name is an unrelated 2017 project — and do not rely on `github:codersantosh/atomic-css` with no ref, which resolves to the pre-2.0 `master` tree. Git installs ship the committed CSS: there is no build step.

Without a dependency:

```bash
git clone --depth 1 --branch 2.0.0 https://github.com/codersantosh/atomic-css
cp -r atomic-css/css atomic-css/css-max atomic-css/css-template .

# or a single raw file
curl -LO https://raw.githubusercontent.com/codersantosh/atomic-css/c51609b/css/atomic.min.css
```

There is **no JavaScript entry point** — `package.json` defines no `main`, no `exports` and no `style`. Link the file, or import its path from your own CSS.

## What you get

| File | Classes | Use when |
| --- | --- | --- |
| `css/atomic.css` (+ `.min`, `-rtl`, `.min-rtl`) | 440 | Default |
| `css-max/atomic-max.css` (+ 3 variants) | 616 | You need `at-ord-*`, `at-ofst-*` or `at-prt-*` |
| `css-template/atomic-template.css` | 440 | WordPress/PHP/dynamic build input — **never link** |

Max is a strict superset of minimal; the framework enforces that in CI. Link exactly one bundle — linking minimal and max together ships every rule twice — and link your own stylesheet **after** it, so your rules win on equal specificity.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/node_modules/atomic-css/css/atomic.min.css">
  </head>
  <body>
    <!-- your content -->
  </body>
</html>
```

Four lines in that head are load-bearing: `<!doctype html>` (without it the browser uses quirks mode), `<html lang="…">` (**WCAG 3.1.1 Language of Page**), `<meta charset="utf-8">` (before any content byte), and the viewport tag — every breakpoint here is `min-width`, so without it a phone lays out at desktop width and no infix engages.

## Load order is load-bearing

The compiled order is **Grid → Utilities → Properties**, and it changes which rule wins: `.at-stky` sets `position: sticky` while `.at-col-*` sets `position: relative`, and sticky wins only because the Properties layer comes later. Never concatenate, reorder or partially include a bundle.

## RTL

Each bundle has an `-rtl` sibling (rtlcss flips `margin-left` → `margin-right`, `float: left` → `float: right`, `.at-ofst-*` offsets included).

```html
<link rel="stylesheet" href="/node_modules/atomic-css/css/atomic.min-rtl.css">
```

The mirrored stylesheet is only half of it — **the document has to be marked RTL too** (`<html lang="ar" dir="rtl">`), or you ship mirrored CSS in an LTR page. And rtlcss mirrors declarations, not the contents of `var()`: a directional value inside a variable stays LTR-oriented.

```css
--at-p: 16px;              /* fine — no direction in the value */
--at-m: 0 auto 0 0;        /* the -rtl bundle will NOT flip this */
```

## Confirming it is wired up

```bash
curl -sI /node_modules/atomic-css/css/atomic.min.css | head -1     # 200, not 404
grep -c '%%' node_modules/atomic-css/css/atomic.min.css            # expect 0
grep -c '!important' node_modules/atomic-css/css/atomic.min.css    # expect 0
grep -c '\.at-col-md-6' node_modules/atomic-css/css/atomic.min.css # the class is really in the bundle
```

In DevTools, check the *custom property* in the Computed panel: if `--at-p` is `initial` or empty, the class is working and the **variable** is the missing half. One caveat: `html { scroll-behavior }` is the only element rule in the bundles, so your own `html` rule ties with it and source order decides — link your sheet after the bundle, or seed `--at-scr-beh`.

## WordPress / PHP and any runtime-generated build

Use the **template**, transform it, and save the result as your own stylesheet. Placeholders live in values only, never inside `var()` names or selectors.

| Marker | Occurrences | Replace with |
| --- | --- | --- |
| `%%MOBILE_BREAKPOINT%%` | 4 | your `sm` width, e.g. `576` |
| `%%TABLET_BREAKPOINT%%` | 4 | your `md` width |
| `%%DESKTOP_BREAKPOINT%%` | 4 | your `lg` width |
| `%%LARGE_DESKTOP_BREAKPOINT%%` | 4 | your `xl` width |
| `%%EXTRA_LARGE_DESKTOP_BREAKPOINT%%` | 4 | your `xxl` width |
| `%%IMPORTANT%%` | 1220 | `''` or `' !important'` — see below |

The five breakpoint markers are written `%%NAME%%px` inside a `min-width`, so replacing the name regenerates every responsive infix at your values. `%%IMPORTANT%%` is appended to the tail of **every** declaration value. There are exactly two builds, never a partial mix:

```php
// Normal build (default). Behaviourally identical to the shipped bundles.
$css = str_replace( '%%IMPORTANT%%', '', $css );

// Force build — every declaration becomes !important. Leading space matters:
// it replaces the tail of the value, not the whole declaration.
$css = str_replace( '%%IMPORTANT%%', ' !important', $css );
```

The result must contain **zero** `%%` markers:

```bash
grep -c '%%' path/to/your-built.css   # must be 0
```

Prefer the normal build — importance is opt-in because it changes what wins.

## Enqueue (WordPress)

```php
wp_enqueue_style( 'atomic', get_template_directory_uri() . '/css/atomic.min.css', array(), '2.0.0' );
```

The enqueued bundle declares no `:root` variables; the theme supplies the token set. The grid still works, because `--at-ctnr` / `--at-ctnr-min` / `--at-gtr` carry direct `var()` fallbacks.
