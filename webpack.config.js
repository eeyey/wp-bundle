const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const PATHS = {
    src: path.join(__dirname, './src'),
    dist: path.join(__dirname, './dist'),
    assets: 'assets/',
}

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = (ext = `[ext]`) => isProd ? `[name].[hash]${ext}` : `[name]${ext}`;

const optimization = () => {
    const config = {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'all',
                    enforce: true
                },
            }
        }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
}

const cssLoaders = extra => {
    const loaders = [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    config: path.resolve(__dirname, "postcss.config.js"),
                },
            },
        }
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
}

module.exports = {
    mode: 'development',
    entry: `${PATHS.src}/index.js`,
    output: {
        filename: `${PATHS.assets}js/${filename('.js')}`,
        path: PATHS.dist,
    },
    optimization: optimization(),
    devtool: isDev ? 'source-map' : false,
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src'),
        }
    },
    devServer: {
        port: 4200,
        hot: isDev
    },
    plugins: [
        new HTMLWebpackPlugin(),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `${PATHS.assets}css/${filename('.css')}`
        }),
        // new CopyWebpackPlugin({})
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                type: 'asset',
                generator: {
                    filename: `${PATHS.assets}images/[name][ext]`
                }
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset',
                generator: {
                    filename: `${PATHS.assets}fonts/[name][ext]`
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: babelOptions()
                }]
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                }]
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }]
            }
        ]
    }
}