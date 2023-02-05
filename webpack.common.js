const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    // Get error codes to help with webpack 4 -> webpack 5 migration
    stats: {
        errorDetails: true,
        children: true
    },
    optimization: {
        minimize: true
    },
	entry: {
		app: "./src/index.js",
	},
	output: {
		// Cache busting using webpack's filename hashing
		// filename: "[name].[hash].js",
        // Update to new webpack hashing
        filename: "[name].[contenthash].js",
		path: path.resolve(__dirname, "public"),
	},
	resolve: {
		alias: {
			styles: path.resolve(__dirname, "./src/"),
		},
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
			{
                test: require.resolve("./src/scripts/three.js"),
				use: [
					{
						loader: "expose-loader",
						options: {
							exposes: "THREE",
						},
					},
				],
			},
		],

    },
	plugins: [
//		new webpack.DefinePlugin({
//			"process.env": {
//				NODE_ENV: JSON.stringify(process.env.NODE_ENV),
//			},
//		}),
//        new webpack.DefinePlugin({
//            "process.env": {
//                // This has effect on the react lib size
//                NODE_ENV: JSON.stringify("production"),
//            },
//        }),
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "src/index.html",
		}),
		new HtmlWebpackPlugin({
			filename: "projects.html",
			template: "src/projects.html",
		}),
	],
};
