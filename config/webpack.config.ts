import { resolve, join } from "path";
import webpack from "webpack";
import "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";

const mode = process.env.NODE_ENV as webpack.Configuration["mode"];

const IS_MODE = { DEV: mode === "development", PROD: mode === "production" };

const ROOT_PATH = process.cwd();
// const ROOT_PATH = path.dirname(__dirname);

type WebpackENV = { WEBPACK_SERVE: boolean };
type ARGV = Record<string, any> & { env: WebpackENV };

export default (env: WebpackENV, argv: ARGV): webpack.Configuration => {
    return {
        entry: [resolve(ROOT_PATH, "config", "index.ts")],

        mode: mode || "development",

        output: {
            filename: "[name]-[fullhash]-bundel.js",
            path: resolve(ROOT_PATH, "dist"),
        },

        resolve: {
            extensions: [".ts", ".js", ".tsx", ".jsx"],

            alias: {
                "@": resolve(ROOT_PATH, "src", "components"),
                "~": resolve(ROOT_PATH, "src"),
            },
        },

        module: {
            rules: [
                {
                    test: /\.((t|j)sx?)?$/,
                    exclude: /node_modules/,
                    use: "babel-loader",
                },
                {
                    test: /\.(?:ico|png|jpe?g|gif)$/i,
                    type: "asset/resource",
                },
                {
                    test: /\.(woff(2)?|eot|ttf|otf|svg)$/i,
                    type: "asset/inline",
                },
            ],
        },

        devServer: {
            static: false,

            port: 9000,

            hot: true,

            open: true,

            client: {
                progress: true,

                overlay: {
                    errors: true,
                    warnings: true,
                },
            },
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: resolve(ROOT_PATH, "public", "index.html"),
                title: "My App",
                // favicon: resolve(ROOT_PATH, "public", "favicon.ico"),
            }),
        ],
    };
};
