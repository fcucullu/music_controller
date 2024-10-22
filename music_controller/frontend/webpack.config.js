const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
    return {
        entry: "./src/index.js",
        output: {
            path: path.resolve(__dirname, "./static/frontend"),
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                    },
                },
            ],
        },
        optimization: {
            minimize: true,
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: JSON.stringify(argv.mode === 'production' ? 'production' : 'development'),
                },
            }),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, "./static/frontend"),
            },
            compress: true,
            port: 8000,
            hot: true,  // Enables Hot Module Replacement
        },
    };
};
