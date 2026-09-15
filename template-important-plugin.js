const MARKER = '%%IMPORTANT%%';

/**
 * Template-only PostCSS output helper. Appends %%IMPORTANT%% to every
 * declaration value (before the `;`) and drops the `!important` flag, so a
 * dynamic consumer can save either:
 *   - a normal build: remove every marker, or
 *   - a force build: replace every marker with ` !important`.
 * Applied only to the css-template entry; the shipped bundles never see it.
 * See ARCHITECTURE.md § The template bundle.
 */
const TemplateImportantPlugin = {
    postcssPlugin: 'at-template-important',
    // OnceExit, not Declaration: autoprefixer also processes the root in
    // OnceExit and must see the original values. Plugin order in the loader
    // (autoprefixer first) then lets the marker land on every final
    // declaration, including autoprefixer's prefixed clones.
    OnceExit(root) {
        root.walkDecls((decl) => {
            decl.value = `${decl.value}${MARKER}`;
            decl.important = false;
        });
    },
};

module.exports = TemplateImportantPlugin;
