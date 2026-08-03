const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const autoprefixer = require('autoprefixer');
const RtlCssPlugin = require('./rtl-css-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        entry: {
            'css-max/atomic-max': './scss/grid-max.scss',
            'css/atomic': './scss/grid.scss',
            'demo/colormode-globalstyle/dynamic': './demo/colormode-globalstyle/scss/dynamic.scss',
            'demo/colormode-globalstyle/colormode-globalstyle': './demo/colormode-globalstyle/colormode-globalstyle.scss',
        },
        output: {
            path: path.resolve(__dirname), // Outputs to the current directory
        },
        module: {
            rules: [
                {
                    test: /\.scss$/, // Match all SCSS files
                    use: [
                        MiniCssExtractPlugin.loader, // Extract CSS to files
                        'css-loader', // Translate CSS into CommonJS modules
                        {
                            loader: 'postcss-loader', // Apply PostCSS transformations
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        autoprefixer({
                                            overrideBrowserslist: ['last 5 versions'], // Autoprefix for browsers
                                        }),
                                    ],
                                },
                            },
                        },
                        'sass-loader', // Compile Sass to CSS (must run before PostCSS)
                    ],
                },
            ],
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
        devtool: isDevelopment ? 'source-map' : false, // Enable source maps for development mode
        watchOptions: {
            ignored: /node_modules/, // Ignore node_modules to speed up watching
        },
        // Avoid outputting any actual JS files (use an empty JS entry as a workaround)
        performance: {
            hints: false, // Disable performance hints (since no actual JS is needed)
        },
    };
};
