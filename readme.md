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

## WordPress Uses
```php 
wp_enqueue_style( 'at-grid', 'url-path-to/at-grid.min.css', array(), 1.0.0 );
$at_grid_css_var = "
    :root{
        --at-container-sm: 540px;
        --at-container-md: 720px;
        --at-container-lg: 960px;
        --at-container-xl: 1140px;
        --at-gutter:15px;
    }
";
wp_add_inline_style( 'at-grid', $at_grid_css_var );
```
## Demo
[View Demo](https://codersantosh.github.io/at-grid/) or See index.html
