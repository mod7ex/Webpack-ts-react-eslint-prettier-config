import { resolve } from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import 'webpack-dev-server';

const mode = process.env.NODE_ENV as webpack.Configuration['mode'];

const IS_MODE = { DEV: mode === 'development', PROD: mode === 'production' };

const ROOT_PATH = process.cwd();
// const ROOT_PATH = path.dirname(__dirname);

// regexes
const tsJsTsxJsxRegex = /\.((t|j)sx?)?$/;
const sassRegex = /\.s[ac]ss$/i;

/*
const additionalData =
    `@import "./src/assets/scss/_utils.scss";` +
    `@import "./src/assets/scss/_reset.scss";`;
*/

const getStyleLoaders = () => {
    const sourceMap = IS_MODE.DEV;

    // prettier-ignore
    return [
    IS_MODE.DEV && "style-loader",
    IS_MODE.PROD && MiniCssExtractPlugin.loader,
    { loader: "css-loader", options: { sourceMap } },
    { loader: "postcss-loader", options: { sourceMap } },
    { loader: "sass-loader", options: { sourceMap,/* additionalData */ } },
  ].filter(Boolean) as webpack.RuleSetUseItem[];
};

type WebpackENV = { WEBPACK_SERVE: boolean };
type ARGV = Record<string, unknown> & { env: WebpackENV };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (env: WebpackENV, argv: ARGV): webpack.Configuration => {
    const plugins = [
        new HtmlWebpackPlugin({
            title: 'My App',
            template: resolve(ROOT_PATH, 'public', 'index.html'),
            favicon: resolve(ROOT_PATH, 'public', 'favicon.ico'),
        }),
        IS_MODE.DEV && new BundleAnalyzerPlugin(),
        IS_MODE.DEV && new ReactRefreshWebpackPlugin(),
        IS_MODE.DEV && new ForkTsCheckerWebpackPlugin(),

        IS_MODE.PROD &&
            new MiniCssExtractPlugin({
                filename: '[name]-[contenthash]-bundel.css',
            }),
    ].filter(Boolean) as webpack.Configuration['plugins'];

    return {
        mode: mode || 'development',

        target: ['browserslist'],

        entry: [resolve(ROOT_PATH, 'config', 'index.ts')],

        devtool: IS_MODE.PROD ? false : IS_MODE.DEV && 'source-map',

        output: {
            filename: '[name]-[fullhash]-bundel.js',
            path: resolve(ROOT_PATH, 'dist'),
        },

        resolve: {
            extensions: ['.ts', '.js', '.tsx', '.jsx'],

            alias: {
                '@': resolve(ROOT_PATH, 'src', 'components'),
                '~': resolve(ROOT_PATH, 'src'),
            },
        },

        module: {
            rules: [
                {
                    test: tsJsTsxJsxRegex,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: sassRegex,
                    exclude: /node_modules/,
                    use: getStyleLoaders(),
                },
                {
                    test: /\.(?:ico|png|jpe?g|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(woff(2)?|eot|ttf|otf|svg)$/i,
                    type: 'asset/inline',
                },
            ],
        },

        devServer: {
            static: {
                directory: resolve(ROOT_PATH, 'public'),
            },

            port: 8080,

            hot: true,

            open: true,

            client: {
                progress: true,

                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
        },

        plugins,
    };
};
