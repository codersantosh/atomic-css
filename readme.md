# AT Grid - Flexbox Grid System on Grunt and SCSS

A complete grid system based on the flex display property.

## Uses
Customized `container: max-width` and `gutter` using CSS variable.

```css
:root{
--at-container-sm: 540px;
--at-container-md: 720px;
--at-container-lg: 960px;
--at-container-xl: 1140px;
--at-gutter:15px;
}
```
Add CSS to your HTML page: `at-grid.css` for development site or `at-grid.min.css` for production site
```html
<link rel="stylesheet" href="css/at-grid.css" type="text/css">
```
## Demo
See index.html
