const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const autoprefixer = require('autoprefixer');
const RtlCssPlugin = require('./rtl-css-plugin');
const TemplateImportantPlugin = require('./template-important-plugin');

const scssRule = {
    test: /\.scss$/, // Match all SCSS files
    use: [
        MiniCssExtractPlugin.loader, // Extract CSS to files
        'css-loader', // Translate CSS into CommonJS modules
        {
            loader: 'postcss-loader', // Apply PostCSS transformations
            options: {
                postcssOptions: (loaderContext) => ({
                    plugins: [
                        autoprefixer({
                            overrideBrowserslist: ['last 5 versions'], // Autoprefix for browsers
                        }),
                        // Template entry only: append %%IMPORTANT%% after
                        // every declaration value (see template-important-plugin.js).
                        ...(loaderContext.resourcePath.endsWith('grid-template.scss')
                            ? [TemplateImportantPlugin]
                            : []),
                    ],
                }),
            },
        },
        'sass-loader', // Compile Sass to CSS (must run before PostCSS)
    ],
};

function baseConfig(isDevelopment) {
    return {
        output: {
            path: path.resolve(__dirname), // Outputs to the current directory
        },
        module: {
            rules: [scssRule],
        },
        devtool: isDevelopment ? 'source-map' : false, // Enable source maps for development mode
        watchOptions: {
            ignored: /node_modules/, // Ignore node_modules to speed up watching
        },
        performance: {
            hints: false, // Disable performance hints (since no actual JS is needed)
        },
    };
}

// Shipped bundles + demo: each entry emits .css + .min.css and gets its
// auto-generated -rtl variants from RtlCssPlugin.
const mainConfig = (isDevelopment) => ({
    ...baseConfig(isDevelopment),
    name: 'main',
    entry: {
        'css-max/atomic-max': './scss/grid-max.scss',
        'css/atomic': './scss/grid.scss',
        'demo/colormode-globalstyle/dynamic': './demo/colormode-globalstyle/scss/dynamic.scss',
        'demo/colormode-globalstyle/colormode-globalstyle': './demo/colormode-globalstyle/colormode-globalstyle.scss',
    },
    plugins: [
        // Output for non-minified CSS
        new MiniCssExtractPlugin({
            filename: (pathData) => {
                const name = pathData.chunk.name; // Get the entry name
                return `${name}.css`; // Non-minified CSS
            },
        }),
        // Output for minified CSS
        new MiniCssExtractPlugin({
            filename: (pathData) => {
                const name = pathData.chunk.name; // Get the entry name
                return `${name}.min.css`; // Minified CSS
            },
        }),
        // Output for RTL CSS (both non-minified and minified variants)
        new RtlCssPlugin(),
    ],
    optimization: {
        minimize: true, // Enable minimization
        minimizer: [
            new CssMinimizerPlugin({
                test: /\.min(-rtl)?\.css$/i, // Match both .min.css and .min-rtl.css files
                minimizerOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: { removeAll: true }, // Remove comments in production
                        },
                    ],
                },
            }),
        ],
    },
});

// Template bundle: exactly one output (css-template/atomic-template.css).
// No min/RTL variants — it is a transform source for dynamic consumers, not a
// linked stylesheet (ARCHITECTURE.md § The template bundle).
const templateConfig = (isDevelopment) => ({
    ...baseConfig(isDevelopment),
    name: 'template',
    entry: {
        'css-template/atomic-template': './scss/grid-template.scss',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: (pathData) => {
                const name = pathData.chunk.name; // Get the entry name
                return `${name}.css`;
            },
        }),
    ],
    optimization: {
        minimize: false,
    },
});

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return [mainConfig(isDevelopment), templateConfig(isDevelopment)];
};
